"""
Risk Detection Demo - Simulates transactions to test the rule engine.
No database required.
"""

import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from backend.app.workers.risk_detection import RuleEngine


def demo_rule_engine():
    engine = RuleEngine()

    print("=" * 70)
    print("TEST: Rule Engine Demo")
    print("=" * 70)

    fundraiser = {
        "fundraiserID": 1,
        "name": "Help Build School",
        "target_amount": 50000.0,
        "current_amount": 12350.0,
        "email": "host@example.com",
    }

    normal_history = [
        {"transactionID": 1, "amount": 50.0, "payee": "alice@test.com"},
        {"transactionID": 2, "amount": 30.0, "payee": "bob@test.com"},
        {"transactionID": 3, "amount": 45.0, "payee": "carol@test.com"},
        {"transactionID": 4, "amount": 25.0, "payee": "dave@test.com"},
        {"transactionID": 5, "amount": 60.0, "payee": "eve@test.com"},
        {"transactionID": 6, "amount": 35.0, "payee": "frank@test.com"},
        {"transactionID": 7, "amount": 40.0, "payee": "grace@test.com"},
        {"transactionID": 8, "amount": 55.0, "payee": "henry@test.com"},
        {"transactionID": 9, "amount": 20.0, "payee": "iris@test.com"},
        {"transactionID": 10, "amount": 50.0, "payee": "jack@test.com"},
    ]

    # --- Scenario 1: Normal ---
    print("\n" + "-" * 70)
    print("[SCENARIO 1] Normal donation $45 (should NOT trigger any rule)")
    normal_txn = {"transactionID": 11, "amount": 45.0, "payee": "kate@test.com"}
    result = engine.check_rules(normal_txn, fundraiser, normal_history)
    if result is None:
        print("  [PASS] No rules triggered")
    else:
        for r in result.triggered_rules:
            print(f"  [FAIL] Triggered: {r.rule_name} - {r.message}")

    # --- Scenario 2: Large donation ---
    print("\n" + "-" * 70)
    print("[SCENARIO 2] Large donation $5,000 (avg $41, 121x multiplier)")
    large_txn = {"transactionID": 12, "amount": 5000.0, "payee": "whale@test.com"}
    result = engine.check_rules(large_txn, fundraiser, normal_history)
    if result:
        print(f"  Risk level: {result.max_severity}")
        for r in result.triggered_rules:
            print(f"  [TRIGGERED] {r.rule_name}: {r.message}")

    # --- Scenario 3: High frequency ---
    print("\n" + "-" * 70)
    print("[SCENARIO 3] High frequency (4th donation within 60s)")
    from datetime import datetime, timedelta, timezone
    now = datetime.now(timezone.utc)
    recent_high_freq = [
        {"transactionID": 13, "amount": 30.0, "payee": "bot1@test.com", "created_at": (now - timedelta(seconds=10)).isoformat()},
        {"transactionID": 14, "amount": 30.0, "payee": "bot2@test.com", "created_at": (now - timedelta(seconds=20)).isoformat()},
        {"transactionID": 15, "amount": 30.0, "payee": "bot3@test.com", "created_at": (now - timedelta(seconds=30)).isoformat()},
    ]
    freq_txn = {"transactionID": 16, "amount": 30.0, "payee": "bot4@test.com"}
    result = engine.check_rules(freq_txn, fundraiser, recent_high_freq)
    if result:
        print(f"  Risk level: {result.max_severity}")
        for r in result.triggered_rules:
            print(f"  [TRIGGERED] {r.rule_name}: {r.message}")

    # --- Scenario 4: Duplicate amount ---
    print("\n" + "-" * 70)
    print("[SCENARIO 4] Duplicate amount (3 consecutive $50)")
    recent_dup = [
        {"transactionID": 17, "amount": 50.0, "payee": "dup1@test.com"},
        {"transactionID": 18, "amount": 50.0, "payee": "dup2@test.com"},
    ]
    dup_txn = {"transactionID": 19, "amount": 50.0, "payee": "dup3@test.com"}
    result = engine.check_rules(dup_txn, fundraiser, recent_dup)
    if result:
        print(f"  Risk level: {result.max_severity}")
        for r in result.triggered_rules:
            print(f"  [TRIGGERED] {r.rule_name}: {r.message}")

    # --- Scenario 5: All rules at once ---
    print("\n" + "-" * 70)
    print("[SCENARIO 5] All rules triggered simultaneously")
    extreme_recent = [
        {"transactionID": 20, "amount": 5000.0, "payee": "ext1@test.com", "created_at": (now - timedelta(seconds=5)).isoformat()},
        {"transactionID": 21, "amount": 5000.0, "payee": "ext2@test.com", "created_at": (now - timedelta(seconds=10)).isoformat()},
        {"transactionID": 22, "amount": 30000.0, "payee": "ext3@test.com", "created_at": (now - timedelta(seconds=30)).isoformat()},
    ]
    extreme_txn = {"transactionID": 23, "amount": 5000.0, "payee": "ext4@test.com"}
    result = engine.check_rules(extreme_txn, fundraiser, extreme_recent)
    if result:
        print(f"  Risk level: {result.max_severity}")
        for r in result.triggered_rules:
            print(f"  [TRIGGERED] {r.rule_name}: {r.message}")

    print("\n" + "=" * 70)
    print("[DONE] Rule engine demo complete!")
    print("=" * 70)


async def demo_ai_analyzer():
    from dotenv import load_dotenv
    load_dotenv()

    api_key = os.getenv("LLM_API_KEY")
    if not api_key:
        print("\n" + "=" * 70)
        print("[SKIP] AI analysis demo skipped (LLM_API_KEY not set)")
        print("  To test AI, add to .env:")
        print("    LLM_API_KEY=your-api-key")
        print("=" * 70)
        return

    from backend.app.workers.risk_detection import check_rules
    from backend.app.workers.ai_analyzer import analyze_alert

    print("\n" + "=" * 70)
    print("[TEST] AI Analysis Demo")
    print("=" * 70)

    fundraiser = {
        "fundraiserID": 1,
        "name": "Help Build School",
        "target_amount": 50000.0,
        "current_amount": 12350.0,
        "email": "host@example.com",
    }

    recent = [
        {"transactionID": 1, "amount": 50.0, "payee": "a@test.com"},
        {"transactionID": 2, "amount": 30.0, "payee": "b@test.com"},
        {"transactionID": 3, "amount": 45.0, "payee": "c@test.com"},
    ]

    txn = {"transactionID": 99, "amount": 5000.0, "payee": "bigdonor@test.com", "description": "Hope kids get books"}
    alert = check_rules(txn, fundraiser, recent)

    if alert:
        print(f"\n[SEND] Sending to AI analysis...")
        print(f"  Amount: ${alert.transaction_amount:,.2f} from {alert.transaction_payee}")
        print(f"  Rules: {', '.join(r.rule_name for r in alert.triggered_rules)}")

        ai_result = await analyze_alert(alert, fundraiser, recent)

        print(f"\n[RESULT] AI Analysis:")
        print(f"  Risk: {ai_result.get('risk', '?')}")
        print(f"  Reason: {ai_result.get('reason', '?')}")
        print(f"  Action: {ai_result.get('action', '?')}")

    print("\n" + "=" * 70)
    print("[DONE] AI analysis demo complete!")
    print("=" * 70)


if __name__ == "__main__":
    demo_rule_engine()
    asyncio.run(demo_ai_analyzer())
