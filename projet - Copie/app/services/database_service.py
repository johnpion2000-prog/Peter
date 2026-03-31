"""Database utility services for PME Analytics Chatbot."""

from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any

import pandas as pd


def ensure_database_exists(db_path: Path) -> bool:
    """Return True when the SQLite database file exists."""
    return db_path.exists() and db_path.is_file()


def get_database_stats(db_path: Path) -> dict[str, Any]:
    """Fetch high-level KPI values displayed in the sidebar."""
    connection = sqlite3.connect(db_path)
    try:
        cursor = connection.cursor()
        stats: dict[str, Any] = {}

        cursor.execute("SELECT COUNT(*) FROM clients")
        stats["clients"] = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM produits")
        stats["produits"] = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM ventes")
        stats["ventes"] = cursor.fetchone()[0]

        cursor.execute(
            "SELECT ROUND(COALESCE(SUM(montant_total), 0), 2) FROM ventes WHERE statut != 'Annulée'"
        )
        stats["chiffre_affaires"] = cursor.fetchone()[0]

        return stats
    finally:
        connection.close()


def run_read_query(db_path: Path, sql_query: str) -> pd.DataFrame:
    """Execute a read-only SQL query and return a DataFrame."""
    connection = sqlite3.connect(db_path)
    try:
        return pd.read_sql_query(sql_query, connection)
    finally:
        connection.close()
