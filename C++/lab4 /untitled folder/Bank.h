#ifndef BANK_H
#define BANK_H

#include "Client.h"
#include "PremiumClient.h"
#include "BankAccount.h"
#include "Transaction.h"
#include <vector>
#include <memory>
#include <unordered_map>
#include <string>

class Bank {
private:
    std::string name;
    std::string bankCode;

    // Collections d'objets
    std::vector<std::shared_ptr<Client>> clients;
    std::vector<std::shared_ptr<BankAccount>> accounts;
    std::vector<std::shared_ptr<Transaction>> transactions;

    // Recherche rapide par ID
    std::unordered_map<int, std::shared_ptr<Client>> clientMap;
    std::unordered_map<std::string, std::shared_ptr<BankAccount>> accountMap;

    // Méthodes auxiliaires
    bool validateTransaction(const std::string& fromAccount,
        const std::string& toAccount,
        double amount) const;
    void recordTransaction(const std::string& fromAccount,
        const std::string& toAccount,
        double amount,
        TransactionType type);

public:
    // Constructeur
    Bank(const std::string& name = "Banque", const std::string& bankCode = "001");

    // Gestion des clients
    int addClient(const std::string& firstName, const std::string& lastName,
        const Address& address, ClientType type = ClientType::REGULAR);
    bool removeClient(int clientId);
    std::shared_ptr<Client> findClient(int clientId) const;
    std::shared_ptr<Client> findClient(const std::string& firstName,
        const std::string& lastName) const;
    std::vector<std::shared_ptr<Client>> getAllClients() const;
    std::vector<std::shared_ptr<Client>> getClientsByType(ClientType type) const;

    // Gestion des comptes
    std::string openAccount(int clientId, AccountType type, double initialBalance = 0.0);
    bool closeAccount(const std::string& accountNumber);
    std::shared_ptr<BankAccount> findAccount(const std::string& accountNumber) const;
    std::vector<std::shared_ptr<BankAccount>> getClientAccounts(int clientId) const;
    std::vector<std::shared_ptr<BankAccount>> getAllAccounts() const;
    std::vector<std::shared_ptr<BankAccount>> getAccountsByType(AccountType type) const;

    // Opérations bancaires
    bool deposit(const std::string& accountNumber, double amount);
    bool withdraw(const std::string& accountNumber, double amount);
    bool transfer(const std::string& fromAccount, const std::string& toAccount, double amount);

    // Affichage des informations
    void displayBankInfo() const;
    void displayAllClients() const;
    void displayAllAccounts() const;
    void displayAccountInfo(const std::string& accountNumber) const;
    void displayClientInfo(int clientId) const;
    void displayTransactionHistory() const;
    void displayAccountTransactions(const std::string& accountNumber) const;

    // Statistiques
    int getTotalClients() const;
    int getTotalAccounts() const;
    int getActiveAccountsCount() const;
    int getPremiumClientsCount() const;
    double getTotalBankBalance() const;

    // Getters
    std::string getName() const;
    std::string getBankCode() const;

    // Sauvegarde et chargement
    bool saveToFile(const std::string& filename) const;
    bool loadFromFile(const std::string& filename);
};

#endif // BANK_H