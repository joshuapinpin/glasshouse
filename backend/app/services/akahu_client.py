from datetime import datetime
import hashlib
import logging

import httpx
from supabase import create_client

from core.config import settings

logger = logging.getLogger(__name__)

AKAHU_BASE_URL = "https://api.akahu.io/v1"
AKAHU_HEADERS = {
    "Authorization": f"Bearer {settings.AKAHU_USER_TOKEN}",
    "X-Akahu-Id": settings.AKAHU_APP_TOKEN,
}

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

TRANSACTIONS_TABLE = "Transactions"
FUNDRAISER_TABLE = "Fundraiser"


class AkahuClient:

    async def fetch_accounts(self) -> list[dict]:
        async with httpx.AsyncClient(headers=AKAHU_HEADERS) as client:
            response = await client.get(f"{AKAHU_BASE_URL}/accounts")
            response.raise_for_status()
            return response.json()["items"]

    async def fetch_pending_transactions(self, account_id: str) -> list[dict]:
        async with httpx.AsyncClient(headers=AKAHU_HEADERS) as client:
            response = await client.get(
                f"{AKAHU_BASE_URL}/transactions/pending",
                params={"account": account_id},
            )
            response.raise_for_status()
            return response.json()["items"]

    async def fetch_transactions(self, account_id: str) -> list[dict]:
        """Fetch settled transactions for an account."""
        async with httpx.AsyncClient(headers=AKAHU_HEADERS) as client:
            response = await client.get(
                f"{AKAHU_BASE_URL}/transactions",
                params={"account": account_id},
            )
            response.raise_for_status()
            return response.json()["items"]

    def _make_transaction_id(self, t: dict) -> int:
        """Stable numeric ID from pending tx fields (no _id on pending txns)."""
        key = f"{t['date']}|{t['amount']}|{t['description']}"
        return int(hashlib.md5(key.encode()).hexdigest()[:8], 16)

    def _map_transaction(self, fundraiser_id: int, t: dict) -> dict:
        txn_id = t.get("_id") or self._make_transaction_id(t)
        if isinstance(txn_id, str):
            txn_id = int(hashlib.md5(txn_id.encode()).hexdigest()[:8], 16)
        return {
            "transactionID": txn_id,
            "fundraiserID": fundraiser_id,
            "amount": t["amount"],
            "payee": t["description"],
        }

    def upsert_transactions(self, fundraiser_id: int, transactions: list[dict]) -> int:
        if not transactions:
            return 0
        rows = [self._map_transaction(fundraiser_id, t) for t in transactions]
        supabase.table(TRANSACTIONS_TABLE).upsert(
            rows, on_conflict="transactionID"
        ).execute()
        return len(rows)

    async def sync_fundraiser(self, fundraiser_id: int, akahu_account_id: str) -> int:
        pending = await self.fetch_pending_transactions(akahu_account_id)
        settled = await self.fetch_transactions(akahu_account_id)
        all_txns = pending + settled
        count = self.upsert_transactions(fundraiser_id, all_txns)
        logger.info(f"Synced {count} transactions for fundraiser {fundraiser_id}")
        return count

    async def sync_all(self) -> dict:
        """Sync every fundraiser that has an akahu_access_token."""
        result = supabase.table(FUNDRAISER_TABLE).select(
            "fundraiserID, akahu_access_token"
        ).neq("akahu_access_token", "").execute()

        fundraisers = result.data or []
        results = {}
        for f in fundraisers:
            fid = f["fundraiserID"]
            account_id = f["akahu_access_token"]
            try:
                count = await self.sync_fundraiser(fid, account_id)
                results[fid] = {"status": "ok", "new_transactions": count}
            except Exception as e:
                logger.error(f"Failed to sync fundraiser {fid}: {e}")
                results[fid] = {"status": "error", "detail": str(e)}
        return results


akahu_client = AkahuClient()
