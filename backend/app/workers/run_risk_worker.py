"""
Risk Detection Worker — Standalone runner.

This script polls the database for new transactions and runs them through
the rule engine + AI analyzer. It is designed to be run as a separate process
alongside the main FastAPI server.

It does NOT modify any existing code — it only reads from the database and
writes alerts to a separate "risk_alerts" table (or logs).

Usage:
    # Basic polling (every 60 seconds)
    python -m backend.app.workers.run_risk_worker

    # Custom interval
    python -m backend.app.workers.run_risk_worker --interval 120

    # One-shot (single pass, then exit)
    python -m backend.app.workers.run_risk_worker --once

Requirements:
    LLM_API_KEY set in .env (optional — without it, rules-only mode)
    ADMIN_EMAIL set in .env (optional — for admin notifications)
"""

from __future__ import annotations

import argparse
import asyncio
import logging
import os
import sys
from datetime import datetime, timezone
from typing import Any

# Add parent directory to path so we can import from backend
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))

from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("risk_worker")


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

def _get_supabase():
    """Create a Supabase client."""
    try:
        from supabase import create_client
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        if not url or not key:
            logger.error("SUPABASE_URL and SUPABASE_KEY must be set in .env")
            sys.exit(1)
        return create_client(url, key)
    except Exception as e:
        logger.error(f"Failed to create Supabase client: {e}")
        sys.exit(1)


async def get_all_fundraisers(db) -> list[dict[str, Any]]:
    """Fetch all fundraisers from the database."""
    try:
        resp = db.table("Fundraiser").select("*").execute()
        return resp.data or []
    except Exception as e:
        logger.error(f"Error fetching fundraisers: {e}")
        return []


async def get_transactions_for_fundraiser(
    db, fundraiser_id: int, limit: int = 50
) -> list[dict[str, Any]]:
    """Fetch recent transactions for a fundraiser, newest first."""
    try:
        resp = (
            db.table("Transactions")
            .select("*")
            .eq("fundraiserID", fundraiser_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return resp.data or []
    except Exception as e:
        logger.error(f"Error fetching transactions for fundraiser {fundraiser_id}: {e}")
        return []


async def get_processed_ids(db) -> set[int]:
    """Get set of transaction IDs already processed by the risk worker."""
    try:
        # Try to get from risk_alerts table (if it exists)
        resp = db.table("risk_alerts").select("transaction_id").execute()
        return {r["transaction_id"] for r in (resp.data or []) if r.get("transaction_id")}
    except Exception:
        # Table might not exist yet — check risk_settings for processed IDs
        try:
            resp = db.table("risk_settings").select("value").eq("key", "processed_ids").execute()
            if resp.data:
                return set(resp.data[0].get("value", []))
        except Exception:
            pass
        return set()


async def save_alert(db, alert, ai_result: dict[str, str]):
    """Persist a risk alert to the database."""
    try:
        # Ensure table exists (run this DDL manually: CREATE TABLE IF NOT EXISTS ...)
        data = {
            "transaction_id": alert.transaction_id,
            "fundraiser_id": alert.fundraiser_id,
            "fundraiser_name": alert.fundraiser_name,
            "amount": alert.transaction_amount,
            "payee": alert.transaction_payee,
            "severity": alert.max_severity,
            "ai_risk": ai_result.get("risk", ""),
            "ai_reason": ai_result.get("reason", ""),
            "ai_action": ai_result.get("action", ""),
            "triggered_rules": [r.rule_name for r in alert.triggered_rules],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        db.table("risk_alerts").insert(data).execute()
        logger.info(f"Saved risk alert for transaction {alert.transaction_id}")
    except Exception as e:
        logger.warning(f"Could not save alert to DB (table may not exist): {e}")
        logger.info(f"Alert data: {alert}")


# ---------------------------------------------------------------------------
# Main processing logic
# ---------------------------------------------------------------------------

async def process_transaction(
    db,
    transaction: dict[str, Any],
    fundraiser: dict[str, Any],
    recent_transactions: list[dict[str, Any]],
) -> bool:
    """Process a single transaction. Returns True if an alert was raised."""
    from workers.risk_detection import check_rules
    from workers.ai_analyzer import analyze_alert
    from workers.risk_notifier import notify_all_parties

    # -- 1. Rule engine --
    alert = check_rules(transaction, fundraiser, recent_transactions)
    if alert is None:
        return False  # No rules triggered, nothing to do

    logger.info(
        f"Rules triggered for txn {transaction.get('transactionID')}: "
        f"{', '.join(r.rule_name for r in alert.triggered_rules)}"
    )

    # -- 2. AI analysis --
    ai_result = await analyze_alert(alert, fundraiser, recent_transactions)
    logger.info(f"AI analysis result: {ai_result.get('risk')} — {ai_result.get('reason', '')[:80]}")

    # -- 3. Save alert --
    await save_alert(db, alert, ai_result)

    # -- 4. Notify (only for medium/high risk) --
    if alert.is_actionable:
        donor_email = transaction.get("email") or transaction.get("payee_email")
        host_email = fundraiser.get("email")
        admin_email = os.getenv("ADMIN_EMAIL")

        notify_results = await notify_all_parties(
            alert, ai_result,
            donor_email=donor_email,
            host_email=host_email,
            admin_email=admin_email,
        )
        logger.info(f"Notifications sent: {notify_results}")

    return True


async def run_once(db) -> int:
    """Single pass: check all fundraisers for unprocessed transactions."""
    fundraisers = await get_all_fundraisers(db)
    processed_ids = await get_processed_ids(db)
    total_alerts = 0

    logger.info(f"Checking {len(fundraisers)} fundraisers...")

    for fundraiser in fundraisers:
        fundraiser_id = fundraiser.get("fundraiserID")
        if not fundraiser_id:
            continue

        transactions = await get_transactions_for_fundraiser(db, fundraiser_id)
        if not transactions:
            continue

        # Find unprocessed transactions
        unprocessed = [t for t in transactions if t.get("transactionID") not in processed_ids]

        if not unprocessed:
            continue

        logger.info(
            f"Fundraiser {fundraiser_id} ({fundraiser.get('name', '?')}): "
            f"{len(unprocessed)} new transaction(s)"
        )

        for txn in reversed(unprocessed):  # process oldest first
            try:
                alerted = await process_transaction(db, txn, fundraiser, transactions)
                if alerted:
                    total_alerts += 1
            except Exception as e:
                logger.error(f"Error processing txn {txn.get('transactionID')}: {e}")

    logger.info(f"Pass complete. {total_alerts} alert(s) raised.")
    return total_alerts


async def run_loop(interval_seconds: int = 60):
    """Run the detection loop indefinitely."""
    db = _get_supabase()
    logger.info(f"Risk worker started. Polling every {interval_seconds}s.")

    while True:
        try:
            await run_once(db)
        except Exception as e:
            logger.error(f"Unhandled error in worker loop: {e}")

        await asyncio.sleep(interval_seconds)


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Risk Detection Worker")
    parser.add_argument(
        "--interval", "-i",
        type=int,
        default=60,
        help="Polling interval in seconds (default: 60)",
    )
    parser.add_argument(
        "--once", "-1",
        action="store_true",
        help="Run a single pass and exit",
    )
    args = parser.parse_args()

    if args.once:
        db = _get_supabase()
        asyncio.run(run_once(db))
    else:
        asyncio.run(run_loop(args.interval))


if __name__ == "__main__":
    main()
