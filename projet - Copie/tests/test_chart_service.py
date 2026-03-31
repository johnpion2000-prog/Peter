"""Unit tests for chart intent detection and chart building services."""

from __future__ import annotations

import unittest

import pandas as pd

from app.services.chart_service import build_plot, chart_intent_for_question


class TestChartIntentForQuestion(unittest.TestCase):
    """Validate chart intent routing for French and English questions."""

    def test_detects_monthly_trend_intent(self) -> None:
        question = "Montre-moi la tendance mensuelle du chiffre d'affaires"

        intent = chart_intent_for_question(question)

        self.assertIsNotNone(intent)
        self.assertEqual(intent["kind"], "line")
        self.assertEqual(intent["x"], "periode")
        self.assertEqual(intent["y"], "chiffre_affaires")

    def test_detects_top_product_intent_in_english(self) -> None:
        question = "Show me the best product performance"

        intent = chart_intent_for_question(question)

        self.assertIsNotNone(intent)
        self.assertEqual(intent["kind"], "bar")
        self.assertEqual(intent["x"], "produit")
        self.assertEqual(intent["y"], "quantite_vendue")

    def test_detects_status_distribution_intent(self) -> None:
        question = "Give me the sales status distribution"

        intent = chart_intent_for_question(question)

        self.assertIsNotNone(intent)
        self.assertEqual(intent["kind"], "pie")
        self.assertEqual(intent["names"], "statut")
        self.assertEqual(intent["values"], "nombre_ventes")

    def test_detects_city_client_intent(self) -> None:
        question = "Top customers by city"

        intent = chart_intent_for_question(question)

        self.assertIsNotNone(intent)
        self.assertEqual(intent["kind"], "bar")
        self.assertEqual(intent["x"], "ville")
        self.assertEqual(intent["y"], "chiffre_affaires")

    def test_returns_none_when_no_intent_matches(self) -> None:
        question = "What is the refund policy?"

        intent = chart_intent_for_question(question)

        self.assertIsNone(intent)


class TestBuildPlot(unittest.TestCase):
    """Validate Plotly figure creation for supported chart types."""

    def test_builds_line_chart(self) -> None:
        dataframe = pd.DataFrame(
            {
                "periode": ["2025-01", "2025-02"],
                "chiffre_affaires": [1200.50, 1340.00],
            }
        )
        chart_config = {
            "kind": "line",
            "x": "periode",
            "y": "chiffre_affaires",
            "title": "Monthly revenue trend",
        }

        figure = build_plot(dataframe, chart_config)

        self.assertIsNotNone(figure)
        self.assertEqual(figure.data[0].type, "scatter")
        self.assertEqual(figure.layout.title.text, "Monthly revenue trend")

    def test_builds_bar_chart(self) -> None:
        dataframe = pd.DataFrame(
            {
                "produit": ["Stylo", "Carnet"],
                "quantite_vendue": [50, 35],
            }
        )
        chart_config = {
            "kind": "bar",
            "x": "produit",
            "y": "quantite_vendue",
            "title": "Top products",
        }

        figure = build_plot(dataframe, chart_config)

        self.assertIsNotNone(figure)
        self.assertEqual(figure.data[0].type, "bar")
        self.assertEqual(figure.layout.title.text, "Top products")

    def test_builds_pie_chart(self) -> None:
        dataframe = pd.DataFrame(
            {
                "statut": ["Validée", "Annulée"],
                "nombre_ventes": [120, 15],
            }
        )
        chart_config = {
            "kind": "pie",
            "names": "statut",
            "values": "nombre_ventes",
            "title": "Sales by status",
        }

        figure = build_plot(dataframe, chart_config)

        self.assertIsNotNone(figure)
        self.assertEqual(figure.data[0].type, "pie")
        self.assertEqual(figure.layout.title.text, "Sales by status")

    def test_returns_none_for_unknown_chart_kind(self) -> None:
        dataframe = pd.DataFrame({"x": [1], "y": [2]})
        chart_config = {
            "kind": "heatmap",
            "x": "x",
            "y": "y",
            "title": "Unsupported chart",
        }

        figure = build_plot(dataframe, chart_config)

        self.assertIsNone(figure)


if __name__ == "__main__":
    unittest.main()
