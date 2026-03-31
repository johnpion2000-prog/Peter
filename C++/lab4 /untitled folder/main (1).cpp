// main.cpp - À LA RACINE du projet
#include <iostream>
#include <string>
#include "Address.h"
#include "Bank.h"

using namespace std;

int main() {
    cout << "=== SYSTEME BANCAIRE ===" << endl;

    // Test 1 : Adresse
    Address addr("123 Rue de la Paix", "Paris", "75001", "France");
    cout << "Adresse test: " << addr.toString() << endl;

    // Test 2 : Banque
    Bank bank("Banque de France", "001");
    cout << "Banque: " << bank.getName() << endl;

    // Test 3 : Client
    int clientId = bank.addClient("Jean", "Dupont", addr);
    cout << "Client ajoute avec ID: " << clientId << endl;

    // Test 4 : Compte
    string compte = bank.openAccount(clientId, AccountType::CHECKING, 1000.0);
    if (!compte.empty()) {
        cout << "Compte ouvert: " << compte << endl;
    }

    cout << "\n=== FIN DU PROGRAMME ===" << endl;
    return 0;
}