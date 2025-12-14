#pragma once
#ifndef BANKACCOUNT_H
#define BANKACCOUNT_H

#include "Date.h"
#include <string>
#include <iostream>
#include <memory>
#include <iomanip>

// Énumérations doivent être déclarées AVANT la classe
enum class AccountType {
    CHECKING,     // Compte courant
    SAVINGS       // Compte épargne
};

enum class AccountStatus {
    ACTIVE,
    CLOSED,
    FROZEN
};

class BankAccount {
private:
    std::string accountNumber;
    int clientId;
    double balance;
    AccountType type;
    Date openingDate;
    AccountStatus status;

    static int accountCounter; // Compteur statique

public:
    // Constructeurs
    BankAccount();
    BankAccount(int clientId, AccountType type, double initialBalance = 0.0);

    // Destructeur
    ~BankAccount();

    // Getters
    std::string getAccountNumber() const;
    int getClientId() const;
    double getBalance() const;
    AccountType getType() const;
    std::string getTypeString() const;
    Date getOpeningDate() const;
    AccountStatus getStatus() const;
    std::string getStatusString() const;

    // Opérations
    bool deposit(double amount);
    bool withdraw(double amount);
    bool transfer(BankAccount& targetAccount, double amount);

    // Gestion du statut
    bool activate();
    bool close();
    bool freeze();

    // Vérifications
    bool isActive() const;
    bool canWithdraw(double amount) const;

    // Affichage
    void displayInfo() const;
    std::string toString() const;

    // Méthodes statiques
    static std::string generateAccountNumber();
    static int getTotalAccounts();

    // Opérateurs
    bool operator==(const BankAccount& other) const;
};

#endif // BANKACCOUNT_H