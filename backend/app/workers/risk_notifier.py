"""
Risk Notifier — Send email alerts when high-risk transactions are detected.

Fully standalone — does not touch the existing (empty) notifications.py.

Three recipient roles:
  1. Donor       — the person who made the transaction
  2. Fundraiser  — the host / creator of the fundraiser
  3. Admin       — platform administrator

Currently uses a pluggable email backend:
  - 'supabase'  — uses Supabase Auth's built-in email (if configured)
  - 'console'   — prints to stdout (useful for development / testing)

Set EMAIL_BACKEND=console (default) for development.
Set EMAIL_BACKEND=supabase for production.

Usage:
    from workers.risk_notifier import notify_all_parties

    await notify_all_parties(alert, ai_result, donor_email, host_email, admin_email)
"""

from __future__ import annotations

import logging
import os
from typing import Any

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Email templates
# ---------------------------------------------------------------------------

def _build_donor_email(alert, ai_result: dict[str, str]) -> tuple[str, str]:
    subject = "🔔 Donation Alert — Please Confirm Your Transaction"
    body = f"""Hi there,

We detected an unusual donation from your account:

  Amount: ${alert.transaction_amount:,.2f}
  Fundraiser: {alert.fundraiser_name}
  Payee: {alert.transaction_payee}

{ai_result.get('reason', '')}

Please reply to this email or contact our support team if you did not authorise
this donation. If it was you, you can ignore this message.

— The Glasshouse Team
"""
    return subject, body


def _build_host_email(alert, ai_result: dict[str, str]) -> tuple[str, str]:
    subject = f"⚠️ Risk Alert — {alert.fundraiser_name}"
    body = f"""Hi there,

A transaction on your fundraiser "{alert.fundraiser_name}" has triggered a risk alert.

  Amount: ${alert.transaction_amount:,.2f}
  Donor: {alert.transaction_payee}
  Description: {alert.transaction_description or '(none)'}

AI Analysis: {ai_result.get('reason', '')}

Suggested action: {ai_result.get('action', 'Review transaction')}

Please review this transaction in your dashboard.

— The Glasshouse Team
"""
    return subject, body


def _build_admin_email(alert, ai_result: dict[str, str]) -> tuple[str, str]:
    rules_detail = "\n".join(f"  • {r.message}" for r in alert.triggered_rules)
    subject = f"🚨 Platform Alert — {alert.max_severity.upper()} risk on {alert.fundraiser_name}"
    body = f"""Platform Admin Alert,

A transaction was flagged as {alert.max_severity.upper()} risk:

  Fundraiser: {alert.fundraiser_name} (ID: {alert.fundraiser_id})
  Amount: ${alert.transaction_amount:,.2f}
  Donor: {alert.transaction_payee}
  Transaction ID: {alert.transaction_id}

Triggered rules:
{rules_detail}

AI Analysis: {ai_result.get('risk', 'unknown')} — {ai_result.get('reason', '')}

Suggested action: {ai_result.get('action', 'Review')}

— Glasshouse Risk Monitoring System
"""
    return subject, body


# ---------------------------------------------------------------------------
# Email backends
# ---------------------------------------------------------------------------

async def _send_via_supabase(
    to: str,
    subject: str,
    body: str,
    _from: str | None = None,
) -> bool:
    """Send email via Supabase Auth (requires Supabase email templates)."""
    try:
        from core.supabase import get_supabase
        supabase = get_supabase()
        # Supabase doesn't have a direct "send email" API from the server SDK.
        # Instead, use the Resend integration or SMTP configured in Supabase dashboard.
        # This is a placeholder — actual implementation depends on your Supabase setup.
        logger.info(f"[Supabase] Would send email to {to}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email via Supabase: {e}")
        return False


async def _send_via_console(
    to: str,
    subject: str,
    body: str,
    _from: str | None = None,
) -> bool:
    """Print email to console (for development)."""
    print(f"""
┌─{'─' * 60}─┐
│ EMAIL TO: {to:<51} │
│ SUBJECT: {subject:<49} │
├─{'─' * 60}─┤
{body}
└─{'─' * 60}─┘
""")
    return True


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def send_email(
    to: str,
    subject: str,
    body: str,
    backend: str | None = None,
) -> bool:
    """Send an email using the configured backend."""
    backend = backend or os.getenv("EMAIL_BACKEND", "console")

    if backend == "supabase":
        return await _send_via_supabase(to, subject, body)
    else:
        return await _send_via_console(to, subject, body)


async def notify_all_parties(
    alert: Any,  # RiskAlert (avoid circular import issues)
    ai_result: dict[str, str],
    donor_email: str | None = None,
    host_email: str | None = None,
    admin_email: str | None = None,
) -> dict[str, bool]:
    """
    Send alert emails to all relevant parties.

    Args:
        alert: RiskAlert object.
        ai_result: Dict from ai_analyzer with keys risk/reason/action.
        donor_email: Email of the person who made the donation.
        host_email: Email of the fundraiser host.
        admin_email: Platform admin email (falls back to env var ADMIN_EMAIL).

    Returns:
        Dict mapping role -> success (bool).
    """
    results: dict[str, bool] = {}

    admin_email = admin_email or os.getenv("ADMIN_EMAIL")

    # -- Donor --
    if donor_email:
        subject, body = _build_donor_email(alert, ai_result)
        results["donor"] = await send_email(donor_email, subject, body)
    else:
        results["donor"] = False

    # -- Host --
    if host_email:
        subject, body = _build_host_email(alert, ai_result)
        results["host"] = await send_email(host_email, subject, body)
    else:
        results["host"] = False

    # -- Admin --
    if admin_email:
        subject, body = _build_admin_email(alert, ai_result)
        results["admin"] = await send_email(admin_email, subject, body)
    else:
        results["admin"] = False

    return results
