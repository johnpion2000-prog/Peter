#include "Transaction.h"
#include <iostream>
#include <sstream>
#include <string>

using namespace std;

// Initialisation du compteur statique
int Transaction::transactionCounter = 0;

// Constructeurs
Transaction::Transaction()
    : id(generateTransactionId()), fromAccount(""), toAccount(""),
    amount(0.0), type(TransactionType::DEPOSIT) {
    transactionDate = Date::getCurrentDate();
    transactionCounter++;
}

Transaction::Transaction(const std::string& fromAccount, const std::string& toAccount,
    double amount, TransactionType type)
    : id(generateTransactionId()), fromAccount(fromAccount), toAccount(toAccount),
    amount(amount), type(type) {
    transactionDate = Date::getCurrentDate();
    transactionCounter++;
}

Transaction::Transaction(const std::string& accountNumber, double amount, TransactionType type)
    : id(generateTransactionId()), amount(amount), type(type) {
    if (type == TransactionType::DEPOSIT || type == TransactionType::OPEN_ACCOUNT) {
        toAccount = accountNumber;
    }
    else if (type == TransactionType::WITHDRAWAL || type == TransactionType::CLOSE_ACCOUNT) {
        fromAccount = accountNumber;
    }
    transactionDate = Date::getCurrentDate();
    transactionCounter++;
}

// Getters
int Transaction::getId() const {
    return id;
}

std::string Transaction::getFromAccount() const {
    return fromAccount;
}

std::string Transaction::getToAccount() const {
    return toAccount;
}

double Transaction::getAmount() const {
    return amount;
}

Date Transaction::getTransactionDate() const {
    return transactionDate;
}

TransactionType Transaction::getType() const {
    return type;
}

std::string Transaction::getTypeString() const {
    switch (type) {
    case TransactionType::DEPOSIT: return "Dépôt";
    case TransactionType::WITHDRAWAL: return "Retrait";
    case TransactionType::TRANSFER: return "Transfert";
    case TransactionType::OPEN_ACCOUNT: return "Ouverture de compte";
    case TransactionType::CLOSE_ACCOUNT: return "Fermeture de compte";
    default: return "Opération inconnue";
    }
}

// Méthodes d'affichage
void Transaction::displayInfo() const {
    cout << "=== Informations de la transaction ===" << endl;
    cout << "ID: " << id << endl;
    cout << "Type: " << getTypeString() << endl;

    if (!fromAccount.empty()) {
        cout << "Compte source: " << fromAccount << endl;
    }

    if (!toAccount.empty()) {
        cout << "Compte destination: " << toAccount << endl;
    }

    cout << "Montant: " << amount << " €" << endl;
    cout << "Date: ";
    transactionDate.display();
    cout << "=======================================" << endl;
}

std::string Transaction::toString() const {
    stringstream ss;
    ss << "Transaction #" << id << ": " << getTypeString();

    if (!fromAccount.empty()) {
        ss << " du compte " << fromAccount;
    }

    if (!toAccount.empty()) {
        ss << " vers le compte " << toAccount;
    }

    ss << " - Montant: " << amount << " € (" << transactionDate.toString() << ")";
    return ss.str();
}

// Méthodes statiques
int Transaction::generateTransactionId() {
    return 10000 + transactionCounter;
}

int Transaction::getTotalTransactions() {
    return transactionCounter;
}