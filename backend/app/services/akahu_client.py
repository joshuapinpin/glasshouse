from datetime import datetime
from fastapi import Depends
from supabase import Client
from core.supabase import get_supabase
from core.config import settings
import httpx
import logging

logger = logging.getLogger(__name__)

AKAHU_BASE_URL = "https://api.akahu.io/v1"
AKAHU_HEADERS = {
    "Authorization": f"Bearer {settings.AKAHU_USER_TOKEN}",
    "X-Akahu-Id": settings.AKAHU_APP_TOKEN,
}

class AkahuClient:
    def __init__(self, supabase: Client = Depends(get_supabase)):
        self.db = supabase
        self.client = httpx.AsyncClient(headers=AKAHU_HEADERS)

    # --- Akahu API calls ---

    async def fetch_accounts(self) -> list[dict]:
        """Fetch all linked bank accounts from Akahu."""
        response = await self.client.get(f"{AKAHU_BASE_URL}/accounts")
        response.raise_for_status()
        return response.json()["items"]  # replace "items" with actual response key

    async def fetch_transactions(self,
                                 account_id: str,
                                 start: datetime | None = None,
                                 end: datetime | None = None
        ) -> list[dict]:
        """Fetch transactions for a given account, between a start and end date."""
        params = {}
        if start and end:
            params["start"] = start.isoformat()
            params["end"] = end.isoformat()

        response = await self.client.get(
            f"{AKAHU_BASE_URL}/accounts/transactions",  # replace with actual endpoint
            params=params
        )
        response.raise_for_status()
        return response.json()["items"]  # replace "items" with actual response key

# supabase reads
# UPDATE FOLLOWING CODE ACCORDING TO DB
    async def get_last_synced(self, fundraiser_id: str) -> datetime | None:
        """Get the timestamp of the most recent transaction we have for a fundraiser."""
        result = (
            self.db.table("transactions")
            .select("created_at")  # replace with actual Akahu timestamp field
            .eq("fundraiser_id", fundraiser_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if result.data:
            return datetime.fromisoformat(result.data[0]["created_at"])
        return None

    # supabase writes
    async def upsert_transactions(self, fundraiser_id: str, transactions: list[dict]) -> None:
        """Insert new transactions, ignore duplicates by akahu_transaction_id."""
        if not transactions:
            return

        rows = [
            {
                "fundraiser_id": fundraiser_id,
                "akahu_transaction_id": t["_id"],      # replace with actual Akahu ID field
                "amount": t["amount"],                  # replace with actual field
                "description": t["description"],        # replace with actual field
                "merchant": t.get("merchant", {}).get("name"),  # replace with actual field
                "date": t["date"],                      # replace with actual field
                "raw": t,                               # store raw payload for reference
                "evidence": None,                       # filled in later by fundraiser host
            }
            for t in transactions
        ]

        self.db.table("transactions").upsert(
            rows,
            on_conflict="akahu_transaction_id"  # prevents duplicates on re-sync
        ).execute()

    # --- Main sync logic ---

    async def sync_fundraiser(self, fundraiser_id: str, akahu_account_id: str) -> int:
        """Sync transactions for a single fundraiser. Returns number of new transactions."""
        last_synced = await self.get_last_synced(fundraiser_id)
        transactions = await self.fetch_transactions(akahu_account_id, start=last_synced, end=datetime.now().isoformat())

        await self.upsert_transactions(fundraiser_id, transactions)
        logger.info(f"Synced {len(transactions)} transactions for fundraiser {fundraiser_id}")
        return len(transactions)

    async def sync_all(self) -> dict:
        """Poll all active fundraisers and sync their transactions."""
        accounts = await self.fetch_accounts()
        results = {}

        for account in accounts:
            akahu_account_id = account["_id"]  # replace with actual ID field
            fundraiser = await self.get_fundraiser_by_account_id(akahu_account_id)

            if not fundraiser:
                logger.debug(f"No fundraiser linked to account {akahu_account_id}, skipping")
                continue

            try:
                count = await self.sync_fundraiser(fundraiser["id"], akahu_account_id)
                results[fundraiser["id"]] = {"status": "ok", "new_transactions": count}
            except Exception as e:
                logger.error(f"Failed to sync fundraiser {fundraiser['id']}: {e}")
                results[fundraiser["id"]] = {"status": "error", "detail": str(e)}

        return results