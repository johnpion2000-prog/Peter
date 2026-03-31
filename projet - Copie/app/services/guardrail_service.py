"""Guardrail and language utilities for chatbot safety."""

from __future__ import annotations

import re

from app.config import DANGEROUS_SQL_PATTERNS


def looks_like_unsafe_request(question: str) -> bool:
    """Return True when a question appears to request destructive SQL actions."""
    normalized_question = f" {question.strip().lower()} "
    return any(pattern in normalized_question for pattern in DANGEROUS_SQL_PATTERNS)


def detect_language(question: str) -> str:
    """Detect if a question is likely English; default to French."""
    english_markers = {
        "what",
        "show",
        "sales",
        "revenue",
        "top",
        "month",
        "customer",
        "product",
    }
    tokens = set(re.findall(r"[a-zA-Z]+", question.lower()))

    if len(tokens.intersection(english_markers)) >= 2:
        return "en"
    return "fr"
