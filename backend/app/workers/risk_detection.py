"""
Risk Detection — Rule Engine

A lightweight rule engine that screens transactions for suspicious patterns.
This module is completely standalone — it does not modify any existing code.

When a transaction triggers a rule, it returns a structured alert that can
then be passed to AI analysis for deeper evaluation.

Usage:
    from workers.risk_detection import RuleEngine, check_rules

    engine = RuleEngine()
    alerts = engine.check_rules(transaction_data, fundraiser_data, recent_transactions)
"""

from __future__ import annotations

import statistics
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Any


# ---------------------------------------------------------------------------
# Data types
# ---------------------------------------------------------------------------

@dataclass
class RuleResult:
    """Result of a rule check."""
    rule_name: str
    triggered: bool
    severity: str  # "low" | "medium" | "high"
    message: str
    details: dict[str, Any] = field(default_factory=dict)


@dataclass
class RiskAlert:
    """Complete alert produced when one or more rules fire."""
    transaction_id: int | None
    fundraiser_id: int
    fundraiser_name: str
    triggered_rules: list[RuleResult]
    transaction_amount: float
    transaction_payee: str
    transaction_description: str | None
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    @property
    def max_severity(self) -> str:
        levels = {"low": 0, "medium": 1, "high": 2}
        return max(self.triggered_rules, key=lambda r: levels.get(r.severity, 0)).severity

    @property
    def is_actionable(self) -> bool:
        return self.max_severity in ("medium", "high")


# ---------------------------------------------------------------------------
# Default configuration (can be overridden via env or DB later)
# ---------------------------------------------------------------------------

DEFAULT_RULES = {
    "LARGE_DONATION": {
        "enabled": True,
        "multiplier": 5.0,          # trigger if amount > avg * multiplier
        "min_abs_amount": 100.0,    # only fire if also above this absolute value
        "severity": "high",
    },
    "HIGH_FREQUENCY": {
        "enabled": True,
        "window_seconds": 60,       # look-back window
        "max_count": 3,             # trigger if more than this many txns in window
        "severity": "medium",
    },
    "DUPLICATE_AMOUNT": {
        "enabled": True,
        "consecutive_count": 3,     # trigger if N consecutive txns have same amount
        "severity": "medium",
    },
    "DAILY_LIMIT": {
        "enabled": True,
        "threshold_ratio": 0.5,     # trigger if daily total > target * ratio
        "severity": "high",
    },
}


# ---------------------------------------------------------------------------
# Rule Engine
# ---------------------------------------------------------------------------

class RuleEngine:
    """Evaluates a set of configurable rules against a transaction."""

    def __init__(self, rules_config: dict | None = None):
        self.rules = rules_config or DEFAULT_RULES

    # -- Public API ---------------------------------------------------------

    def check_rules(
        self,
        transaction: dict[str, Any],
        fundraiser: dict[str, Any],
        recent_transactions: list[dict[str, Any]],
    ) -> RiskAlert | None:
        """
        Run all enabled rules against *transaction*.

        Args:
            transaction: The new transaction dict (must include
                'amount', 'payee', and optionally 'transactionID'/'description').
            fundraiser: The parent fundraiser dict (must include
                'fundraiserID', 'name', 'target_amount', 'current_amount').
            recent_transactions: List of recent transactions for this fundraiser
                (used for frequency & duplicate checks). Should be sorted newest-first.

        Returns:
            A RiskAlert if at least one rule triggered, else None.
        """
        results: list[RuleResult] = []

        amount = float(transaction.get("amount", 0))
        payee = transaction.get("payee", "")
        txn_id = transaction.get("transactionID")

        # -- Gather stats ---------------------------------------------------
        all_amounts = [float(t.get("amount", 0)) for t in recent_transactions if t.get("amount")]
        all_amounts.append(amount)

        avg_amount = statistics.mean(all_amounts) if all_amounts else amount

        # -- 1. LARGE_DONATION ----------------------------------------------
        cfg = self.rules.get("LARGE_DONATION", {})
        if cfg.get("enabled", True):
            threshold = max(avg_amount * cfg.get("multiplier", 5.0), cfg.get("min_abs_amount", 100.0))
            if amount >= threshold:
                results.append(RuleResult(
                    rule_name="LARGE_DONATION",
                    triggered=True,
                    severity=cfg.get("severity", "high"),
                    message=(
                        f"Single donation of ${amount:,.2f} is {amount / avg_amount:.1f}x "
                        f"the average donation (${avg_amount:,.2f})."
                    ),
                    details={"amount": amount, "avg_amount": avg_amount, "threshold": threshold},
                ))

        # -- 2. HIGH_FREQUENCY ----------------------------------------------
        cfg = self.rules.get("HIGH_FREQUENCY", {})
        if cfg.get("enabled", True):
            window_seconds = cfg.get("window_seconds", 60)
            max_count = cfg.get("max_count", 3)
            now = datetime.now(timezone.utc)
            cutoff = now - timedelta(seconds=window_seconds)

            # Count transactions in the window (including current)
            # Use the transaction's timestamp if available, else assume "now"
            recent_count = 1  # count the current transaction
            for t in recent_transactions:
                ts = t.get("created_at") or t.get("timestamp") or t.get("date")
                if ts:
                    try:
                        t_time = datetime.fromisoformat(str(ts).replace("Z", "+00:00"))
                        if t_time >= cutoff:
                            recent_count += 1
                    except (ValueError, TypeError):
                        pass  # unparseable date, skip

            if recent_count > max_count:
                results.append(RuleResult(
                    rule_name="HIGH_FREQUENCY",
                    triggered=True,
                    severity=cfg.get("severity", "medium"),
                    message=(
                        f"{recent_count} donations in the last {window_seconds}s "
                        f"(max allowed: {max_count})."
                    ),
                    details={"count_in_window": recent_count, "window_seconds": window_seconds},
                ))

        # -- 3. DUPLICATE_AMOUNT --------------------------------------------
        cfg = self.rules.get("DUPLICATE_AMOUNT", {})
        if cfg.get("enabled", True):
            consecutive = cfg.get("consecutive_count", 3)
            # Check the new amount against the most recent (consecutive - 1) txns
            recent_amounts = [float(t.get("amount", 0)) for t in recent_transactions[:consecutive - 1]]
            matching = sum(1 for a in recent_amounts if abs(a - amount) < 0.01) + 1  # +1 for current
            if matching >= consecutive:
                results.append(RuleResult(
                    rule_name="DUPLICATE_AMOUNT",
                    triggered=True,
                    severity=cfg.get("severity", "medium"),
                    message=f"{matching} consecutive donations of exactly ${amount:,.2f}.",
                    details={"amount": amount, "consecutive_count": matching},
                ))

        # -- 4. DAILY_LIMIT -------------------------------------------------
        cfg = self.rules.get("DAILY_LIMIT", {})
        if cfg.get("enabled", True):
            threshold_ratio = cfg.get("threshold_ratio", 0.5)
            target = float(fundraiser.get("target_amount", 0))
            if target > 0:
                today = datetime.now(timezone.utc).date()
                today_total = amount  # start with current txn
                for t in recent_transactions:
                    ts = t.get("created_at") or t.get("timestamp") or t.get("date")
                    if ts:
                        try:
                            t_date = datetime.fromisoformat(str(ts).replace("Z", "+00:00")).date()
                            if t_date == today:
                                today_total += float(t.get("amount", 0))
                        except (ValueError, TypeError):
                            pass

                if today_total > target * threshold_ratio:
                    results.append(RuleResult(
                        rule_name="DAILY_LIMIT",
                        triggered=True,
                        severity=cfg.get("severity", "high"),
                        message=(
                            f"Today's total (${today_total:,.2f}) exceeds "
                            f"{threshold_ratio * 100:.0f}% of target (${target:,.2f})."
                        ),
                        details={
                            "daily_total": today_total,
                            "target": target,
                            "threshold_ratio": threshold_ratio,
                        },
                    ))

        # -- Return ---------------------------------------------------------
        if results:
            return RiskAlert(
                transaction_id=txn_id,
                fundraiser_id=fundraiser.get("fundraiserID"),
                fundraiser_name=fundraiser.get("name", "Unknown"),
                triggered_rules=results,
                transaction_amount=amount,
                transaction_payee=payee,
                transaction_description=transaction.get("description"),
            )
        return None


# ---------------------------------------------------------------------------
# Convenience function
# ---------------------------------------------------------------------------

def check_rules(
    transaction: dict[str, Any],
    fundraiser: dict[str, Any],
    recent_transactions: list[dict[str, Any]],
    rules_config: dict | None = None,
) -> RiskAlert | None:
    """One-shot convenience wrapper."""
    engine = RuleEngine(rules_config)
    return engine.check_rules(transaction, fundraiser, recent_transactions)
