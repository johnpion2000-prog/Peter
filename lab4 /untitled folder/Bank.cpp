#include "Bank.h"
#include <algorithm>
#include <fstream>
#include <sstream>
#include <iomanip>

// Constructeur
Bank::Bank(const std::string& name, const std::string& bankCode)
    : name(name), bankCode(bankCode) {
}

// M�thodes priv�es
bool Bank::validateTransaction(const std::string& fromAccount,
    const std::string& toAccount,
    double amount) const {
    // Validation de base
    if (amount <= 0) {
        std::cout << "Le montant doit �tre positif!" << std::endl;
        return false;
    }

    // V�rifier si le compte source existe
    auto fromAcc = findAccount(fromAccount);
    if (!fromAcc) {
        std::cout << "Compte source non trouv�!" << std::endl;
        return false;
    }

    // V�rifier si le compte destinataire existe (sauf pour les retraits)
    auto toAcc = findAccount(toAccount);
    if (toAccount != "" && !toAcc) {
        std::cout << "Compte destinataire non trouv�!" << std::endl;
        return false;
    }

    // V�rifier le statut des comptes
    if (!fromAcc->isActive()) {
        std::cout << "Le compte source n'est pas actif!" << std::endl;
        return false;
    }

    if (toAcc && !toAcc->isActive()) {
        std::cout << "Le compte destinataire n'est pas actif!" << std::endl;
        return false;
    }

    // V�rifier les fonds suffisants pour les retraits/transfers
    if (!fromAcc->canWithdraw(amount)) {
        std::cout << "Fonds insuffisants sur le compte source!" << std::endl;
        return false;
    }

    return true;
}

void Bank::recordTransaction(const std::string& fromAccount,
    const std::string& toAccount,
    double amount,
    TransactionType type) {
    auto transaction = std::make_shared<Transaction>(fromAccount, toAccount, amount, type);
    transactions.push_back(transaction);
}

// Gestion des clients
int Bank::addClient(const std::string& firstName, const std::string& lastName,
    const Address& address, ClientType type) {
    std::shared_ptr<Client> client;

    if (type == ClientType::REGULAR) {
        client = std::make_shared<Client>(firstName, lastName, address);
    }
    else {
        client = std::make_shared<PremiumClient>(firstName, lastName, address);
    }

    clients.push_back(client);
    clientMap[client->getId()] = client;

    // Enregistrer la transaction d'ouverture
    recordTransaction("", "", 0, TransactionType::OPEN_ACCOUNT);

    std::cout << "Client " << client->getFullName()
        << " ajout� avec succ�s! ID: " << client->getId() << std::endl;

    return client->getId();
}

bool Bank::removeClient(int clientId) {
    // V�rifier si le client existe
    auto clientIt = clientMap.find(clientId);
    if (clientIt == clientMap.end()) {
        std::cout << "Client non trouv�!" << std::endl;
        return false;
    }

    // V�rifier les comptes du client
    auto clientAccounts = getClientAccounts(clientId);
    for (const auto& account : clientAccounts) {
        if (account->isActive() && account->getBalance() > 0) {
            std::cout << "Impossible de supprimer le client: compte actif avec solde positif!" << std::endl;
            return false;
        }
    }

    // Fermer tous les comptes du client
    for (const auto& account : clientAccounts) {
        account->close();
    }

    // Supprimer le client
    auto it = std::remove_if(clients.begin(), clients.end(),
        [clientId](const std::shared_ptr<Client>& client) {
            return client->getId() == clientId;
        });

    if (it != clients.end()) {
        clients.erase(it, clients.end());
        clientMap.erase(clientId);

        std::cout << "Client supprim� avec succ�s!" << std::endl;
        return true;
    }

    return false;
}

std::shared_ptr<Client> Bank::findClient(int clientId) const {
    auto it = clientMap.find(clientId);
    if (it != clientMap.end()) {
        return it->second;
    }
    return nullptr;
}

std::shared_ptr<Client> Bank::findClient(const std::string& firstName,
    const std::string& lastName) const {
    for (const auto& client : clients) {
        if (client->getFirstName() == firstName && client->getLastName() == lastName) {
            return client;
        }
    }
    return nullptr;
}

std::vector<std::shared_ptr<Client>> Bank::getAllClients() const {
    return clients;
}

std::vector<std::shared_ptr<Client>> Bank::getClientsByType(ClientType type) const {
    std::vector<std::shared_ptr<Client>> result;
    for (const auto& client : clients) {
        if (client->getType() == type) {
            result.push_back(client);
        }
    }
    return result;
}

// Gestion des comptes
std::string Bank::openAccount(int clientId, AccountType type, double initialBalance) {
    // V�rifier si le client existe
    auto client = findClient(clientId);
    if (!client) {
        std::cout << "Client non trouv�!" << std::endl;
        return "";
    }

    // Cr�er le compte
    auto account = std::make_shared<BankAccount>(clientId, type, initialBalance);
    accounts.push_back(account);
    accountMap[account->getAccountNumber()] = account;

    // Enregistrer la transaction
    recordTransaction("", account->getAccountNumber(), initialBalance, TransactionType::OPEN_ACCOUNT);

    std::cout << "Compte ouvert avec succ�s! Num�ro: " << account->getAccountNumber()
        << " Solde initial: " << initialBalance << std::endl;

    return account->getAccountNumber();
}

bool Bank::closeAccount(const std::string& accountNumber) {
    auto account = findAccount(accountNumber);
    if (!account) {
        std::cout << "Compte non trouv�!" << std::endl;
        return false;
    }

    // V�rifier le solde
    if (account->getBalance() != 0) {
        std::cout << "Impossible de fermer le compte: solde non nul!" << std::endl;
        return false;
    }

    // Fermer le compte
    if (account->close()) {
        // Enregistrer la transaction
        recordTransaction(accountNumber, "", 0, TransactionType::CLOSE_ACCOUNT);

        std::cout << "Compte ferm� avec succ�s!" << std::endl;
        return true;
    }

    return false;
}

std::shared_ptr<BankAccount> Bank::findAccount(const std::string& accountNumber) const {
    auto it = accountMap.find(accountNumber);
    if (it != accountMap.end()) {
        return it->second;
    }
    return nullptr;
}

std::vector<std::shared_ptr<BankAccount>> Bank::getClientAccounts(int clientId) const {
    std::vector<std::shared_ptr<BankAccount>> result;
    for (const auto& account : accounts) {
        if (account->getClientId() == clientId) {
            result.push_back(account);
        }
    }
    return result;
}

std::vector<std::shared_ptr<BankAccount>> Bank::getAllAccounts() const {
    return accounts;
}

std::vector<std::shared_ptr<BankAccount>> Bank::getAccountsByType(AccountType type) const {
    std::vector<std::shared_ptr<BankAccount>> result;
    for (const auto& account : accounts) {
        if (account->getType() == type) {
            result.push_back(account);
        }
    }
    return result;
}

// Op�rations bancaires
bool Bank::deposit(const std::string& accountNumber, double amount) {
    if (!validateTransaction("", accountNumber, amount)) {
        return false;
    }

    auto account = findAccount(accountNumber);
    if (!account) return false;

    if (account->deposit(amount)) {
        recordTransaction("", accountNumber, amount, TransactionType::DEPOSIT);
        return true;
    }

    return false;
}

bool Bank::withdraw(const std::string& accountNumber, double amount) {
    if (!validateTransaction(accountNumber, "", amount)) {
        return false;
    }

    auto account = findAccount(accountNumber);
    if (!account) return false;

    if (account->withdraw(amount)) {
        recordTransaction(accountNumber, "", amount, TransactionType::WITHDRAWAL);
        return true;
    }

    return false;
}

bool Bank::transfer(const std::string& fromAccount, const std::string& toAccount, double amount) {
    if (!validateTransaction(fromAccount, toAccount, amount)) {
        return false;
    }

    auto fromAcc = findAccount(fromAccount);
    auto toAcc = findAccount(toAccount);

    if (!fromAcc || !toAcc) return false;

    if (fromAcc->transfer(*toAcc, amount)) {
        recordTransaction(fromAccount, toAccount, amount, TransactionType::TRANSFER);
        return true;
    }

    return false;
}

// Affichage des informations
void Bank::displayBankInfo() const {
    std::cout << "========================================\n";
    std::cout << "         INFORMATIONS SUR LA BANQUE\n";
    std::cout << "========================================\n";
    std::cout << "Nom: " << name << std::endl;
    std::cout << "Code banque: " << bankCode << std::endl;
    std::cout << "----------------------------------------\n";
    std::cout << "STATISTIQUES:\n";
    std::cout << "Nombre total de clients: " << getTotalClients() << std::endl;
    std::cout << "Clients premium: " << getPremiumClientsCount() << std::endl;
    std::cout << "Nombre total de comptes: " << getTotalAccounts() << std::endl;
    std::cout << "Comptes actifs: " << getActiveAccountsCount() << std::endl;
    std::cout << "Solde total de la banque: " << std::fixed << std::setprecision(2)
        << getTotalBankBalance() << " �" << std::endl;
    std::cout << "Transactions effectu�es: " << transactions.size() << std::endl;
    std::cout << "========================================\n";
}

void Bank::displayAllClients() const {
    std::cout << "========================================\n";
    std::cout << "           LISTE DES CLIENTS\n";
    std::cout << "========================================\n";

    if (clients.empty()) {
        std::cout << "Aucun client enregistr�.\n";
    }
    else {
        for (const auto& client : clients) {
            std::cout << client->toString() << std::endl;
        }
    }

    std::cout << "========================================\n";
}

void Bank::displayAllAccounts() const {
    std::cout << "========================================\n";
    std::cout << "           LISTE DES COMPTES\n";
    std::cout << "========================================\n";

    if (accounts.empty()) {
        std::cout << "Aucun compte ouvert.\n";
    }
    else {
        for (const auto& account : accounts) {
            std::cout << account->toString() << std::endl;
        }
    }

    std::cout << "========================================\n";
}

void Bank::displayAccountInfo(const std::string& accountNumber) const {
    auto account = findAccount(accountNumber);
    if (account) {
        account->displayInfo();

        // Afficher aussi les informations du client
        auto client = findClient(account->getClientId());
        if (client) {
            std::cout << "\nInformations du client:\n";
            std::cout << "Nom: " << client->getFullName() << std::endl;
            std::cout << "ID: " << client->getId() << std::endl;
        }
    }
    else {
        std::cout << "Compte non trouv�!" << std::endl;
    }
}

void Bank::displayClientInfo(int clientId) const {
    auto client = findClient(clientId);
    if (client) {
        client->displayInfo();

        // Afficher les comptes du client
        auto clientAccounts = getClientAccounts(clientId);
        if (!clientAccounts.empty()) {
            std::cout << "\nCOMPTES DU CLIENT:\n";
            for (const auto& account : clientAccounts) {
                std::cout << "  - " << account->toString() << std::endl;
            }
        }
        else {
            std::cout << "\nCe client n'a aucun compte.\n";
        }
    }
    else {
        std::cout << "Client non trouv�!" << std::endl;
    }
}

void Bank::displayTransactionHistory() const {
    std::cout << "========================================\n";
    std::cout << "     HISTORIQUE DES TRANSACTIONS\n";
    std::cout << "========================================\n";

    if (transactions.empty()) {
        std::cout << "Aucune transaction enregistr�e.\n";
    }
    else {
        for (const auto& transaction : transactions) {
            std::cout << transaction->toString() << std::endl;
        }
    }

    std::cout << "========================================\n";
}

void Bank::displayAccountTransactions(const std::string& accountNumber) const {
    std::cout << "========================================\n";
    std::cout << "  TRANSACTIONS DU COMPTE " << accountNumber << "\n";
    std::cout << "========================================\n";

    bool found = false;
    for (const auto& transaction : transactions) {
        if (transaction->getFromAccount() == accountNumber ||
            transaction->getToAccount() == accountNumber) {
            std::cout << transaction->toString() << std::endl;
            found = true;
        }
    }

    if (!found) {
        std::cout << "Aucune transaction trouv�e pour ce compte.\n";
    }

    std::cout << "========================================\n";
}

// Statistiques
int Bank::getTotalClients() const {
    return clients.size();
}

int Bank::getTotalAccounts() const {
    return accounts.size();
}

int Bank::getActiveAccountsCount() const {
    int count = 0;
    for (const auto& account : accounts) {
        if (account->isActive()) {
            count++;
        }
    }
    return count;
}

int Bank::getPremiumClientsCount() const {
    int count = 0;
    for (const auto& client : clients) {
        if (client->getType() == ClientType::PREMIUM) {
            count++;
        }
    }
    return count;
}

double Bank::getTotalBankBalance() const {
    double total = 0.0;
    for (const auto& account : accounts) {
        total += account->getBalance();
    }
    return total;
}

// Getters
std::string Bank::getName() const {
    return name;
}

std::string Bank::getBankCode() const {
    return bankCode;
}

// Sauvegarde et chargement (impl�mentation de base)
bool Bank::saveToFile(const std::string& filename) const {
    std::ofstream file(filename);
    if (!file.is_open()) {
        std::cout << "Erreur: impossible d'ouvrir le fichier " << filename << std::endl;
        return false;
    }

    // Sauvegarde simplifi�e pour l'exemple
    file << "BANK:" << name << ":" << bankCode << "\n";

    for (const auto& client : clients) {
        file << "CLIENT:" << client->getId() << ":"
            << client->getFirstName() << ":" << client->getLastName() << "\n";
    }

    for (const auto& account : accounts) {
        file << "ACCOUNT:" << account->getAccountNumber() << ":"
            << account->getClientId() << ":" << account->getBalance() << "\n";
    }

    file.close();
    std::cout << "Donn�es sauvegard�es dans " << filename << std::endl;
    return true;
}

bool Bank::loadFromFile(const std::string& filename) {
    std::ifstream file(filename);
    if (!file.is_open()) {
        std::cout << "Erreur: impossible d'ouvrir le fichier " << filename << std::endl;
        return false;
    }

    std::string line;
    while (std::getline(file, line)) {
        std::stringstream ss(line);
        std::string type;
        std::getline(ss, type, ':');

        if (type == "BANK") {
            std::getline(ss, name, ':');
            std::getline(ss, bankCode, ':');
        }
        else if (type == "CLIENT") {
            std::string idStr, firstName, lastName;
            std::getline(ss, idStr, ':');
            std::getline(ss, firstName, ':');
            std::getline(ss, lastName, ':');

            // Pour simplifier, on ne recharge pas l'adresse
            Address addr("", "", "", "");
            addClient(firstName, lastName, addr, ClientType::REGULAR);
        }
        else if (type == "ACCOUNT") {
            std::string accountNumber, clientIdStr, balanceStr;
            std::getline(ss, accountNumber, ':');
            std::getline(ss, clientIdStr, ':');
            std::getline(ss, balanceStr, ':');

            // Note: cette impl�mentation est simplifi�e
            // Dans une vraie application, il faudrait g�rer la recr�ation des objets
        }
    }

    file.close();
    std::cout << "Donn�es charg�es depuis " << filename << std::endl;
    return true;
}