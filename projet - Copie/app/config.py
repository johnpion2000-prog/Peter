"""Application-wide configuration constants."""

from __future__ import annotations

from pathlib import Path


APP_TITLE = "📊 PME Analytics Chatbot"
DEFAULT_MODEL = "gpt-4o-mini"
DEFAULT_TEMPERATURE = 0.1
DEFAULT_DB_PATH = Path("data") / "pme_analytics.db"

SYSTEM_PROMPT = """
Tu es un analyste financier expert pour les PME françaises.
Tu aides les dirigeants à comprendre leurs ventes, marges, produits, clients et tendances.

Règles strictes:
1) Réponds en français par défaut, ou en anglais si l'utilisateur écrit en anglais.
2) Utilise uniquement les données disponibles dans la base SQLite.
3) N'invente jamais des données; signale clairement quand une information manque.
4) Utilise des calculs précis (arrondis à 2 décimales pour les montants).
5) Explique les résultats de façon business (insights + recommandation courte).
6) N'exécute jamais d'opérations destructives (DROP, DELETE, UPDATE, INSERT, ALTER, TRUNCATE).
7) Limite les requêtes SQL au strict nécessaire et favorise des agrégations performantes.
""".strip()

DANGEROUS_SQL_PATTERNS = {
    "drop ",
    "delete ",
    "update ",
    "insert ",
    "alter ",
    "truncate ",
    "create ",
    "replace ",
    "attach ",
    "detach ",
    "pragma ",
}

EXAMPLE_QUESTIONS = [
    "Quel est le chiffre d'affaires total des 30 derniers jours ?",
    "Quels sont les 5 clients qui génèrent le plus de revenus ?",
    "Montre la tendance mensuelle des ventes sur l'année.",
    "Show me top products by quantity sold.",
    "Quelle est la marge estimée par catégorie de produits ?",
]
