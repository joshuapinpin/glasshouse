"""
AI Analyzer — Deep analysis for suspicious transactions.

Takes a RiskAlert produced by the rule engine and sends it to an LLM API
for deeper contextual analysis to reduce false positives.

Currently supports OpenAI-compatible APIs. Set the following env vars:
    LLM_API_KEY      (required) — Your API key
    LLM_API_URL      (optional) — Defaults to https://api.openai.com/v1/chat/completions
    LLM_MODEL        (optional) — Defaults to "gpt-4o-mini"

Usage:
    from workers.ai_analyzer import analyze_alert

    result = await analyze_alert(alert, fundraiser, recent_txns)
    # result == {"risk": "high"|"low"|"none", "reason": "...", "action": "..."}
"""

from __future__ import annotations

import json
import os
from typing import Any

import httpx

from workers.risk_detection import RiskAlert

# ---------------------------------------------------------------------------
# Defaults
# ---------------------------------------------------------------------------

DEFAULT_API_URL = "https://api.openai.com/v1/chat/completions"
DEFAULT_MODEL = "gpt-4o-mini"
SYSTEM_PROMPT = (
    "You are a fraud risk analyst for a donation platform. "
    "Analyze the transaction context and determine if there is real risk. "
    "Respond ONLY with a JSON object containing exactly three keys:\n"
    '  - "risk": one of "high", "low", or "none"\n'
    '  - "reason": a short human-readable explanation (1-2 sentences)\n'
    '  - "action": what should be done next, e.g. "notify all parties", '
    '"flag for manual review", or "no action needed"\n\n'
    "Be conservative — only flag as 'high' if there is a clear reason to suspect "
    "fraud, money laundering, or account compromise."
)


# ---------------------------------------------------------------------------
# Build prompt
# ---------------------------------------------------------------------------

def _build_prompt(
    alert: RiskAlert,
    fundraiser: dict[str, Any],
    recent_transactions: list[dict[str, Any]],
) -> str:
    """Construct the user message for the LLM."""

    rules_summary = "\n".join(
        f"  - [{r.severity.upper()}] {r.message}"
        for r in alert.triggered_rules
    )

    recent_lines = "\n".join(
        f"  {t.get('created_at', t.get('date', '?'))[:19]:24s} "
        f"${float(t.get('amount', 0)):>8.2f}  "
        f"{t.get('payee', t.get('description', '?'))[:40]}"
        for t in recent_transactions[:15]  # keep prompt reasonable
    )

    return f"""## Fundraiser
- Name: {fundraiser.get('name', 'Unknown')}
- Target: ${float(fundraiser.get('target_amount', 0)):,.2f}
- Current: ${float(fundraiser.get('current_amount', 0)):,.2f}

## New transaction
- Amount: ${alert.transaction_amount:,.2f}
- Payee/Sender: {alert.transaction_payee}
- Description: {alert.transaction_description or '(none)'}

## Triggered rules
{rules_summary}

## Recent transactions (newest first)
{recent_lines if recent_lines else '  (none)'}

---

Analyze the risk level of this new transaction given the context above.
Respond with JSON only."""


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def analyze_alert(
    alert: RiskAlert,
    fundraiser: dict[str, Any],
    recent_transactions: list[dict[str, Any]],
    *,
    api_key: str | None = None,
    api_url: str | None = None,
    model: str | None = None,
    client: httpx.AsyncClient | None = None,
) -> dict[str, str]:
    """
    Send a RiskAlert to the LLM for deep analysis.

    Returns a dict with keys "risk", "reason", and "action".

    If the API call fails or the response is unparseable, returns a fallback
    that preserves the alert's original severity.
    """
    key = api_key or os.getenv("LLM_API_KEY")
    if not key:
        return _no_key_fallback(alert)

    url = api_url or os.getenv("LLM_API_URL") or DEFAULT_API_URL
    model_name = model or os.getenv("LLM_MODEL") or DEFAULT_MODEL

    prompt = _build_prompt(alert, fundraiser, recent_transactions)

    payload = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.1,
        "max_tokens": 300,
    }

    close_client = False
    if client is None:
        client = httpx.AsyncClient(timeout=30.0)
        close_client = True

    try:
        resp = await client.post(
            url,
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json=payload,
        )
        resp.raise_for_status()
        data = resp.json()
        content = data["choices"][0]["message"]["content"].strip()

        # Try to parse JSON from the response
        result = _extract_json(content)
        if result and all(k in result for k in ("risk", "reason", "action")):
            return result  # type: ignore[typeddict-unknown-key]

        # Fallback: parse line-by-line
        return _parse_fallback(content, alert)

    except Exception as exc:
        return {
            "risk": alert.max_severity,
            "reason": f"AI analysis unavailable ({type(exc).__name__}). "
                      f"Falling back to rule-engine severity.",
            "action": "notify all parties" if alert.is_actionable else "no action needed",
        }
    finally:
        if close_client:
            await client.aclose()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _extract_json(text: str) -> dict | None:
    """Try to extract a JSON object from the LLM response."""
    # Look for ```json ... ``` blocks
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0]
    elif "```" in text:
        text = text.split("```")[1].split("```")[0]

    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


def _parse_fallback(content: str, alert: RiskAlert) -> dict[str, str]:
    """Simple keyword-based fallback when JSON parsing fails."""
    lower = content.lower()
    if "high risk" in lower or "high" in lower:
        risk = "high"
    elif "low risk" in lower or "low" in lower:
        risk = "low"
    else:
        risk = alert.max_severity

    return {
        "risk": risk,
        "reason": content[:200],
        "action": "notify all parties" if risk == "high" else "flag for manual review",
    }


def _no_key_fallback(alert: RiskAlert) -> dict[str, str]:
    """Returned when LLM_API_KEY is not configured."""
    return {
        "risk": alert.max_severity,
        "reason": (
            "LLM_API_KEY not configured. "
            "Risk assessment based on rule engine only."
        ),
        "action": "notify all parties" if alert.is_actionable else "no action needed",
    }
