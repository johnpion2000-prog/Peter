"""Database setup script for PME Analytics Chatbot.

This script creates a SQLite database with realistic French SME sample data
for analytics and conversational BI use cases.
"""

from __future__ import annotations

import argparse
import random
import sqlite3
from dataclasses import dataclass
from datetime import date, timedelta
from pathlib import Path
from typing import Iterable


DEFAULT_DB_PATH = Path("data") / "pme_analytics.db"
RANDOM_SEED = 42


@dataclass(frozen=True)
class ProductTemplate:
    nom: str
    categorie: str
    prix_unitaire: float
    cout_revient: float
    fournisseur: str


def get_connection(db_path: Path) -> sqlite3.Connection:
    """Create SQLite connection with safe defaults."""
    db_path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(db_path)
    connection.execute("PRAGMA foreign_keys = ON;")
    return connection


def create_schema(connection: sqlite3.Connection) -> None:
    """Create all required tables with keys and constraints."""
    cursor = connection.cursor()

    cursor.executescript(
        """
        DROP TABLE IF EXISTS lignes_vente;
        DROP TABLE IF EXISTS ventes;
        DROP TABLE IF EXISTS produits;
        DROP TABLE IF EXISTS clients;

        CREATE TABLE clients (
            id INTEGER PRIMARY KEY,
            nom TEXT NOT NULL,
            entreprise TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            telephone TEXT NOT NULL,
            ville TEXT NOT NULL,
            date_inscription DATE NOT NULL,
            categorie TEXT NOT NULL
        );

        CREATE TABLE produits (
            id INTEGER PRIMARY KEY,
            nom TEXT NOT NULL,
            categorie TEXT NOT NULL,
            prix_unitaire REAL NOT NULL CHECK (prix_unitaire > 0),
            cout_revient REAL NOT NULL CHECK (cout_revient >= 0),
            fournisseur TEXT NOT NULL
        );

        CREATE TABLE ventes (
            id INTEGER PRIMARY KEY,
            client_id INTEGER NOT NULL,
            date_vente DATE NOT NULL,
            montant_total REAL NOT NULL CHECK (montant_total >= 0),
            statut TEXT NOT NULL CHECK (statut IN ('Payée', 'En attente', 'Facturée', 'Annulée')),
            mode_paiement TEXT NOT NULL CHECK (mode_paiement IN ('Carte bancaire', 'Virement', 'Prélèvement', 'Chèque')),
            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT ON UPDATE CASCADE
        );

        CREATE TABLE lignes_vente (
            id INTEGER PRIMARY KEY,
            vente_id INTEGER NOT NULL,
            produit_id INTEGER NOT NULL,
            quantite INTEGER NOT NULL CHECK (quantite > 0),
            prix_unitaire REAL NOT NULL CHECK (prix_unitaire >= 0),
            remise REAL NOT NULL CHECK (remise >= 0 AND remise <= 100),
            FOREIGN KEY (vente_id) REFERENCES ventes(id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE RESTRICT ON UPDATE CASCADE
        );

        CREATE INDEX idx_clients_ville ON clients(ville);
        CREATE INDEX idx_produits_categorie ON produits(categorie);
        CREATE INDEX idx_ventes_date ON ventes(date_vente);
        CREATE INDEX idx_ventes_statut ON ventes(statut);
        CREATE INDEX idx_lignes_vente_vente_id ON lignes_vente(vente_id);
        CREATE INDEX idx_lignes_vente_produit_id ON lignes_vente(produit_id);
        """
    )
    connection.commit()


def sample_clients() -> list[tuple[str, str, str, str, str, str, str]]:
    """Generate 50 realistic French SME clients."""
    first_names = [
        "Lucas", "Emma", "Nathan", "Chloé", "Hugo", "Léa", "Enzo", "Sarah", "Jules", "Camille",
        "Louis", "Inès", "Gabriel", "Manon", "Arthur", "Zoé", "Raphaël", "Lina", "Noah", "Eva",
    ]
    last_names = [
        "Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau",
        "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fournier",
    ]
    cities = [
        "Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Montpellier", "Strasbourg", "Bordeaux", "Lille",
    ]
    categories = ["PME", "TPE", "Indépendant", "Startup", "Association"]
    company_suffixes = [
        "Solutions",
        "Conseil",
        "Services",
        "Distribution",
        "Tech",
        "Logistique",
        "Digital",
        "Finance",
        "Atelier",
        "Groupe",
    ]

    clients: list[tuple[str, str, str, str, str, str, str]] = []
    seen_emails: set[str] = set()

    base_date = date.today() - timedelta(days=730)

    for idx in range(50):
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        full_name = f"{first_name} {last_name}"

        city = random.choice(cities)
        company = f"{last_name} {random.choice(company_suffixes)}"
        category = random.choices(categories, weights=[0.35, 0.25, 0.15, 0.15, 0.10], k=1)[0]

        email_base = f"{first_name}.{last_name}{idx}".lower().replace("é", "e").replace("è", "e")
        email = f"{email_base}@{company.replace(' ', '').lower()}.fr"
        while email in seen_emails:
            email = f"{email_base}{random.randint(1, 999)}@{company.replace(' ', '').lower()}.fr"
        seen_emails.add(email)

        phone = f"+33 6 {random.randint(10, 99)} {random.randint(10, 99)} {random.randint(10, 99)} {random.randint(10, 99)}"
        signup_date = base_date + timedelta(days=random.randint(0, 730))

        clients.append((full_name, company, email, phone, city, signup_date.isoformat(), category))

    return clients


def sample_products() -> list[ProductTemplate]:
    """Return 20 products with realistic categories and pricing."""
    return [
        ProductTemplate("Ordinateur portable Pro 14", "Informatique", 949.00, 690.00, "TechDistrib"),
        ProductTemplate("Ordinateur portable Business 15", "Informatique", 1099.00, 785.00, "EuroCompute"),
        ProductTemplate("Station de travail Mini", "Informatique", 1290.00, 930.00, "HexaSystèmes"),
        ProductTemplate("Écran 27 pouces IPS", "Périphériques", 279.00, 185.00, "VisualPro"),
        ProductTemplate("Écran UltraWide 34", "Périphériques", 549.00, 389.00, "VisualPro"),
        ProductTemplate("Clavier mécanique AZERTY", "Périphériques", 89.00, 46.00, "KeyFactory"),
        ProductTemplate("Souris ergonomique", "Périphériques", 49.00, 22.00, "KeyFactory"),
        ProductTemplate("Webcam HD", "Périphériques", 79.00, 38.00, "CamVision"),
        ProductTemplate("Casque audio USB", "Périphériques", 99.00, 49.00, "AudioPlus"),
        ProductTemplate("Dock USB-C", "Périphériques", 129.00, 72.00, "PortLink"),
        ProductTemplate("Pack papier A4 x5", "Bureau", 32.00, 18.00, "OfficeSupply"),
        ProductTemplate("Chaise ergonomique", "Bureau", 249.00, 159.00, "MobilierPro"),
        ProductTemplate("Bureau réglable", "Bureau", 399.00, 275.00, "MobilierPro"),
        ProductTemplate("Lampe LED bureau", "Bureau", 45.00, 21.00, "LightCo"),
        ProductTemplate("Imprimante laser", "Bureau", 299.00, 210.00, "PrintCorp"),
        ProductTemplate("Abonnement Suite PME (annuel)", "Logiciels", 199.00, 65.00, "SoftNova"),
        ProductTemplate("Antivirus Entreprise", "Logiciels", 89.00, 28.00, "CyberSafe"),
        ProductTemplate("Sauvegarde Cloud 1 To", "Services", 149.00, 55.00, "CloudHex"),
        ProductTemplate("Installation sur site", "Services", 320.00, 140.00, "Intervention+"),
        ProductTemplate("Contrat maintenance mensuel", "Services", 129.00, 58.00, "Intervention+"),
    ]


def insert_many(connection: sqlite3.Connection, query: str, rows: Iterable[tuple]) -> None:
    """Bulk insert utility with commit."""
    connection.executemany(query, rows)
    connection.commit()


def generate_sales_data(
    connection: sqlite3.Connection,
    min_sales: int = 500,
    max_sales: int = 800,
    days: int = 365,
) -> None:
    """Generate ventes and lignes_vente for the last N days."""
    cursor = connection.cursor()

    cursor.execute("SELECT id FROM clients")
    client_ids = [row[0] for row in cursor.fetchall()]

    cursor.execute("SELECT id, prix_unitaire FROM produits")
    products = cursor.fetchall()

    sale_count = random.randint(min_sales, max_sales)
    today = date.today()

    statuses = ["Payée", "En attente", "Facturée", "Annulée"]
    status_weights = [0.58, 0.14, 0.18, 0.10]
    payment_modes = ["Carte bancaire", "Virement", "Prélèvement", "Chèque"]
    payment_weights = [0.40, 0.35, 0.18, 0.07]

    for _ in range(sale_count):
        client_id = random.choice(client_ids)
        sale_date = today - timedelta(days=random.randint(0, days - 1))
        status = random.choices(statuses, weights=status_weights, k=1)[0]
        payment_mode = random.choices(payment_modes, weights=payment_weights, k=1)[0]

        cursor.execute(
            """
            INSERT INTO ventes (client_id, date_vente, montant_total, statut, mode_paiement)
            VALUES (?, ?, ?, ?, ?)
            """,
            (client_id, sale_date.isoformat(), 0.0, status, payment_mode),
        )
        vente_id = cursor.lastrowid

        lines_count = random.randint(1, 5)
        selected_products = random.sample(products, k=min(lines_count, len(products)))

        total = 0.0
        for produit_id, list_price in selected_products:
            quantity = random.randint(1, 8)
            negotiated_price = round(list_price * random.uniform(0.92, 1.05), 2)

            if status == "Annulée":
                discount = round(random.uniform(0.0, 15.0), 2)
            else:
                discount = round(random.uniform(0.0, 10.0), 2)

            line_total = quantity * negotiated_price * (1 - discount / 100)
            total += line_total

            cursor.execute(
                """
                INSERT INTO lignes_vente (vente_id, produit_id, quantite, prix_unitaire, remise)
                VALUES (?, ?, ?, ?, ?)
                """,
                (vente_id, produit_id, quantity, negotiated_price, discount),
            )

        total = round(total, 2)
        if status == "Annulée":
            total = 0.0

        cursor.execute("UPDATE ventes SET montant_total = ? WHERE id = ?", (total, vente_id))

    connection.commit()


def seed_data(connection: sqlite3.Connection) -> None:
    """Insert generated clients, products, and sales."""
    clients = sample_clients()
    products = sample_products()

    insert_many(
        connection,
        """
        INSERT INTO clients (nom, entreprise, email, telephone, ville, date_inscription, categorie)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        clients,
    )

    insert_many(
        connection,
        """
        INSERT INTO produits (nom, categorie, prix_unitaire, cout_revient, fournisseur)
        VALUES (?, ?, ?, ?, ?)
        """,
        [(p.nom, p.categorie, p.prix_unitaire, p.cout_revient, p.fournisseur) for p in products],
    )

    generate_sales_data(connection)


def print_summary(connection: sqlite3.Connection) -> None:
    """Print a concise seeding summary."""
    cursor = connection.cursor()

    cursor.execute("SELECT COUNT(*) FROM clients")
    clients_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM produits")
    products_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM ventes")
    sales_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM lignes_vente")
    lines_count = cursor.fetchone()[0]

    cursor.execute("SELECT ROUND(SUM(montant_total), 2) FROM ventes WHERE statut != 'Annulée'")
    revenue = cursor.fetchone()[0] or 0.0

    print("Database initialized successfully")
    print(f"   - Clients: {clients_count}")
    print(f"   - Products: {products_count}")
    print(f"   - Sales: {sales_count}")
    print(f"   - Sales lines: {lines_count}")
    print(f"   - Revenue (excluding cancelled): {revenue} EUR")


def parse_args() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(description="Create and seed PME analytics SQLite database")
    parser.add_argument(
        "--db-path",
        type=Path,
        default=DEFAULT_DB_PATH,
        help="Path to SQLite database file",
    )
    return parser.parse_args()


def main() -> None:
    """Create schema and seed data for the SQLite database."""
    args = parse_args()
    random.seed(RANDOM_SEED)

    connection = get_connection(args.db_path)
    try:
        create_schema(connection)
        seed_data(connection)
        print_summary(connection)
    finally:
        connection.close()


if __name__ == "__main__":
    main()
