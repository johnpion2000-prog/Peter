"""Chart intent detection and rendering services."""

from __future__ import annotations

from typing import Any

import pandas as pd
import plotly.express as px


def chart_intent_for_question(question: str) -> dict[str, str] | None:
    """Auto-detect common chart intents and map them to SQL queries."""
    normalized_question = question.lower()

    if any(token in normalized_question for token in ["mensuel", "mois", "monthly", "month", "tendance", "trend"]):
        return {
            "kind": "line",
            "sql": """
                SELECT strftime('%Y-%m', date_vente) AS periode,
                       ROUND(SUM(montant_total), 2) AS chiffre_affaires
                FROM ventes
                WHERE statut != 'Annulée'
                GROUP BY strftime('%Y-%m', date_vente)
                ORDER BY periode;
            """,
            "x": "periode",
            "y": "chiffre_affaires",
            "title": "Évolution mensuelle du chiffre d'affaires",
        }

    if any(token in normalized_question for token in ["top produit", "best product", "produits", "product", "plus vendu"]):
        return {
            "kind": "bar",
            "sql": """
                SELECT p.nom AS produit,
                       SUM(lv.quantite) AS quantite_vendue
                FROM lignes_vente lv
                JOIN ventes v ON v.id = lv.vente_id
                JOIN produits p ON p.id = lv.produit_id
                WHERE v.statut != 'Annulée'
                GROUP BY p.nom
                ORDER BY quantite_vendue DESC
                LIMIT 10;
            """,
            "x": "produit",
            "y": "quantite_vendue",
            "title": "Top 10 produits par quantité vendue",
        }

    if any(token in normalized_question for token in ["statut", "status", "répartition", "distribution", "pie", "camembert"]):
        return {
            "kind": "pie",
            "sql": """
                SELECT statut, COUNT(*) AS nombre_ventes
                FROM ventes
                GROUP BY statut
                ORDER BY nombre_ventes DESC;
            """,
            "names": "statut",
            "values": "nombre_ventes",
            "title": "Répartition des ventes par statut",
        }

    if any(token in normalized_question for token in ["ville", "city", "client", "customers"]):
        return {
            "kind": "bar",
            "sql": """
                SELECT c.ville,
                       ROUND(SUM(v.montant_total), 2) AS chiffre_affaires
                FROM ventes v
                JOIN clients c ON c.id = v.client_id
                WHERE v.statut != 'Annulée'
                GROUP BY c.ville
                ORDER BY chiffre_affaires DESC
                LIMIT 10;
            """,
            "x": "ville",
            "y": "chiffre_affaires",
            "title": "Top villes par chiffre d'affaires",
        }

    return None


def build_plot(dataframe: pd.DataFrame, chart_config: dict[str, str]) -> Any:
    """Build a Plotly chart from the chart config."""
    chart_kind = chart_config["kind"]

    if chart_kind == "line":
        return px.line(
            dataframe,
            x=chart_config["x"],
            y=chart_config["y"],
            title=chart_config["title"],
            markers=True,
        )

    if chart_kind == "bar":
        return px.bar(
            dataframe,
            x=chart_config["x"],
            y=chart_config["y"],
            title=chart_config["title"],
        )

    if chart_kind == "pie":
        return px.pie(
            dataframe,
            names=chart_config["names"],
            values=chart_config["values"],
            title=chart_config["title"],
        )

    return None
