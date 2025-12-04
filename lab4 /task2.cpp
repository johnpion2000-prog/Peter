// main.cpp
// Этот файл содержит все модули банковской системы

#include <iostream>
#include <vector>
#include <string>
#include <memory>
#include <iomanip>
#include <ctime>
#include <sstream>
#include <limits>

// ==================== Модуль управления клиентами ====================
// Файл: include/Client.h
class Client {
private:
    std::string id;
    std::string name;
    std::string address;
    std::string phoneNumber;

public:
    Client(const std::string& clientId, const std::string& clientName, 
           const std::string& clientAddress, const std::string& clientPhone)
        : id(clientId), name(clientName), address(clientAddress), phoneNumber(clientPhone) {}

    std::string getId() const { return id; }
    std::string getName() const { return name; }
    std::string getAddress() const { return address; }
    std::string getPhoneNumber() const { return phoneNumber; }

    void display() const {
        std::cout << "ID: " << id << "\nИмя: " << name 
                  << "\nАдрес: " << address << "\nТелефон: " << phoneNumber << std::endl;
    }
};

// ==================== Модуль управления счетами ====================
// Файл: include/BankAccount.h

// Предварительное объявление класса Client
class Client;

class BankAccount {
public:
    enum AccountType { CURRENT, SAVINGS, FIXED_DEPOSIT };

private:
    std::string accountNumber;
    Client* owner;
    double balance;
    AccountType type;
    bool active;

public:
    BankAccount(const std::string& accNum, Client* accOwner, AccountType accType, double initialBalance = 0.0)
        : accountNumber(accNum), owner(accOwner), balance(initialBalance), type(accType), active(true) {}

    std::string getAccountNumber() const { return accountNumber; }
    Client* getOwner() const { return owner; }
    double getBalance() const { return balance; }
    AccountType getType() const { return type; }
    bool isActive() const { return active; }

    void deposit(double amount) {
        if (active && amount > 0) {
            balance += amount;
            std::cout << "Внесено " << amount << " на счет " << accountNumber << std::endl;
        } else {
            std::cout << "Ошибка при внесении средств!" << std::endl;
        }
    }

    bool withdraw(double amount) {
        if (active && amount > 0 && balance >= amount) {
            balance -= amount;
            std::cout << "Снято " << amount << " со счета " << accountNumber << std::endl;
            return true;
        } else {
            std::cout << "Ошибка при снятии средств!" << std::endl;
            return false;
        }
    }

    void deactivate() {
        active = false;
        std::cout << "Счет " << accountNumber << " деактивирован." << std::endl;
    }

    void display() const {
        std::string typeStr;
        switch(type) {
            case CURRENT: typeStr = "Текущий"; break;
            case SAVINGS: typeStr = "Сберегательный"; break;
            case FIXED_DEPOSIT: typeStr = "Депозитный"; break;
        }
        std::cout << "Номер счета: " << accountNumber 
                  << "\nВладелец: " << (owner ? owner->getName() : "Неизвестно")
                  << "\nТип счета: " << typeStr
                  << "\nБаланс: " << balance
                  << "\nСтатус: " << (active ? "Активен" : "Неактивен") << std::endl;
    }
};

// ==================== Модуль транзакций ====================
// Файл: include/Transaction.h

class Transaction {
public:
    enum TransactionType { DEPOSIT, WITHDRAWAL, TRANSFER };

private:
    std::string transactionId;
    TransactionType type;
    double amount;
    std::string fromAccount;
    std::string toAccount;
    std::string timestamp;

    static std::string generateTransactionId() {
        static int counter = 0;
        return "TXN" + std::to_string(++counter);
    }

    static std::string getCurrentTimestamp() {
        std::time_t now = std::time(nullptr);
        char buffer[20];
        std::strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M:%S", std::localtime(&now));
        return std::string(buffer);
    }

public:
    Transaction(TransactionType txnType, double txnAmount, 
                const std::string& fromAcc = "", const std::string& toAcc = "")
        : type(txnType), amount(txnAmount), fromAccount(fromAcc), toAccount(toAcc) {
        transactionId = generateTransactionId();
        timestamp = getCurrentTimestamp();
    }

    void display() const {
        std::string typeStr;
        switch(type) {
            case DEPOSIT: typeStr = "Внесение"; break;
            case WITHDRAWAL: typeStr = "Снятие"; break;
            case TRANSFER: typeStr = "Перевод"; break;
        }
        std::cout << "ID транзакции: " << transactionId 
                  << "\nТип: " << typeStr
                  << "\nСумма: " << amount
                  << "\nОткуда: " << (fromAccount.empty() ? "Не указано" : fromAccount)
                  << "\nКуда: " << (toAccount.empty() ? "Не указано" : toAccount)
                  << "\nВремя: " << timestamp << std::endl;
    }

    std::string getTransactionId() const { return transactionId; }
    TransactionType getType() const { return type; }
    double getAmount() const { return amount; }
    std::string getFromAccount() const { return fromAccount; }
    std::string getToAccount() const { return toAccount; }
    std::string getTimestamp() const { return timestamp; }
};

// ==================== Модуль банковских операций ====================
// Файл: include/Bank.h

// Предварительные объявления
class Client;
class BankAccount;
class Transaction;

class Bank {
private:
    std::vector<std::unique_ptr<Client>> clients;
    std::vector<std::unique_ptr<BankAccount>> accounts;
    std::vector<std::unique_ptr<Transaction>> transactions;

    Client* findClientById(const std::string& clientId) {
        for (auto& client : clients) {
            if (client->getId() == clientId) {
                return client.get();
            }
        }
        return nullptr;
    }

    BankAccount* findAccountByNumber(const std::string& accountNumber) {
        for (auto& account : accounts) {
            if (account->getAccountNumber() == accountNumber) {
                return account.get();
            }
        }
        return nullptr;
    }

public:
    // Клиенты
    void addClient(const std::string& clientId, const std::string& name, 
                   const std::string& address, const std::string& phone) {
        if (findClientById(clientId)) {
            std::cout << "Клиент с ID " << clientId << " уже существует." << std::endl;
            return;
        }
        clients.push_back(std::make_unique<Client>(clientId, name, address, phone));
        std::cout << "Клиент " << name << " добавлен." << std::endl;
    }

    void listClients() const {
        if (clients.empty()) {
            std::cout << "Нет клиентов." << std::endl;
            return;
        }
        for (const auto& client : clients) {
            client->display();
            std::cout << "------------------------" << std::endl;
        }
    }

    // Счета
    void createAccount(const std::string& accountNumber, const std::string& clientId, 
                       BankAccount::AccountType type, double initialBalance = 0.0) {
        Client* client = findClientById(clientId);
        if (!client) {
            std::cout << "Клиент с ID " << clientId << " не найден." << std::endl;
            return;
        }
        if (findAccountByNumber(accountNumber)) {
            std::cout << "Счет с номером " << accountNumber << " уже существует." << std::endl;
            return;
        }
        accounts.push_back(std::make_unique<BankAccount>(accountNumber, client, type, initialBalance));
        std::cout << "Счет " << accountNumber << " создан." << std::endl;
    }

    void listAccounts() const {
        if (accounts.empty()) {
            std::cout << "Нет счетов." << std::endl;
            return;
        }
        for (const auto& account : accounts) {
            account->display();
            std::cout << "------------------------" << std::endl;
        }
    }

    // Транзакции
    void deposit(const std::string& accountNumber, double amount) {
        BankAccount* account = findAccountByNumber(accountNumber);
        if (!account) {
            std::cout << "Счет не найден." << std::endl;
            return;
        }
        if (!account->isActive()) {
            std::cout << "Счет не активен." << std::endl;
            return;
        }
        account->deposit(amount);
        transactions.push_back(std::make_unique<Transaction>(Transaction::DEPOSIT, amount, "", accountNumber));
    }

    void withdraw(const std::string& accountNumber, double amount) {
        BankAccount* account = findAccountByNumber(accountNumber);
        if (!account) {
            std::cout << "Счет не найден." << std::endl;
            return;
        }
        if (!account->isActive()) {
            std::cout << "Счет не активен." << std::endl;
            return;
        }
        if (account->withdraw(amount)) {
            transactions.push_back(std::make_unique<Transaction>(Transaction::WITHDRAWAL, amount, accountNumber, ""));
        }
    }

    void transfer(const std::string& fromAccount, const std::string& toAccount, double amount) {
        BankAccount* from = findAccountByNumber(fromAccount);
        BankAccount* to = findAccountByNumber(toAccount);
        if (!from || !to) {
            std::cout << "Один из счетов не найден." << std::endl;
            return;
        }
        if (!from->isActive() || !to->isActive()) {
            std::cout << "Один из счетов не активен." << std::endl;
            return;
        }
        if (from->withdraw(amount)) {
            to->deposit(amount);
            transactions.push_back(std::make_unique<Transaction>(Transaction::TRANSFER, amount, fromAccount, toAccount));
            std::cout << "Перевод выполнен успешно." << std::endl;
        } else {
            std::cout << "Перевод не выполнен." << std::endl;
        }
    }

    void listTransactions() const {
        if (transactions.empty()) {
            std::cout << "Нет транзакций." << std::endl;
            return;
        }
        for (const auto& transaction : transactions) {
            transaction->display();
            std::cout << "------------------------" << std::endl;
        }
    }
};

// ==================== Главный исполнительный модуль ====================
// Файл: src/main.cpp

void displayMenu() {
    std::cout << "\n=== Упрощенная банковская система ===\n";
    std::cout << "1. Добавить клиента\n";
    std::cout << "2. Список клиентов\n";
    std::cout << "3. Создать счет\n";
    std::cout << "4. Список счетов\n";
    std::cout << "5. Внести средства\n";
    std::cout << "6. Снять средства\n";
    std::cout << "7. Перевести средства\n";
    std::cout << "8. Список транзакций\n";
    std::cout << "9. Выход\n";
    std::cout << "Выберите операцию: ";
}

int main() {
    Bank bank;
    int choice;

    do {
        displayMenu();
        std::cin >> choice;

        // Очистка буфера ввода
        std::cin.clear();
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

        switch(choice) {
            case 1: {
                std::string id, name, address, phone;
                std::cout << "Введите ID клиента: ";
                std::getline(std::cin, id);
                std::cout << "Введите имя клиента: ";
                std::getline(std::cin, name);
                std::cout << "Введите адрес клиента: ";
                std::getline(std::cin, address);
                std::cout << "Введите телефон клиента: ";
                std::getline(std::cin, phone);
                bank.addClient(id, name, address, phone);
                break;
            }
            case 2:
                bank.listClients();
                break;
            case 3: {
                std::string accNum, clientId;
                int type;
                double initialBalance;
                std::cout << "Введите номер счета: ";
                std::getline(std::cin, accNum);
                std::cout << "Введите ID клиента: ";
                std::getline(std::cin, clientId);
                std::cout << "Выберите тип счета (0 - Текущий, 1 - Сберегательный, 2 - Депозитный): ";
                std::cin >> type;
                std::cout << "Введите начальный баланс: ";
                std::cin >> initialBalance;
                bank.createAccount(accNum, clientId, static_cast<BankAccount::AccountType>(type), initialBalance);
                std::cin.ignore();
                break;
            }
            case 4:
                bank.listAccounts();
                break;
            case 5: {
                std::string accNum;
                double amount;
                std::cout << "Введите номер счета: ";
                std::getline(std::cin, accNum);
                std::cout << "Введите сумму для внесения: ";
                std::cin >> amount;
                bank.deposit(accNum, amount);
                std::cin.ignore();
                break;
            }
            case 6: {
                std::string accNum;
                double amount;
                std::cout << "Введите номер счета: ";
                std::getline(std::cin, accNum);
                std::cout << "Введите сумму для снятия: ";
                std::cin >> amount;
                bank.withdraw(accNum, amount);
                std::cin.ignore();
                break;
            }
            case 7: {
                std::string fromAcc, toAcc;
                double amount;
                std::cout << "Введите номер счета отправителя: ";
                std::getline(std::cin, fromAcc);
                std::cout << "Введите номер счета получателя: ";
                std::getline(std::cin, toAcc);
                std::cout << "Введите сумму перевода: ";
                std::cin >> amount;
                bank.transfer(fromAcc, toAcc, amount);
                std::cin.ignore();
                break;
            }
            case 8:
                bank.listTransactions();
                break;
            case 9:
                std::cout << "Выход из системы.\n";
                break;
            default:
                std::cout << "Неверный выбор. Попробуйте снова.\n";
        }
    } while (choice != 9);

    return 0;
}