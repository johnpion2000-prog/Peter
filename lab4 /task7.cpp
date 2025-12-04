#include <iostream>
#include <unordered_map>
#include <string>

using namespace std;

using ll = long long;

enum class AccountType { SAVINGS, CHECKING };
enum class AccountStatus { ACTIVE, CLOSED };

class BankAccount {
private:
    ll accountNumber;
    ll ownerClientId;
    double balance;
    AccountType type;
    AccountStatus status;

    static ll nextNumber;

public:
    BankAccount(ll ownerId, AccountType t)
        : accountNumber(nextNumber++), ownerClientId(ownerId), balance(0), type(t), status(AccountStatus::ACTIVE) {}

    ll getAccountNumber() const { return accountNumber; }
    double getBalance() const { return balance; }
    AccountStatus getStatus() const { return status; }

    bool deposit(double amount) {
        if (amount <= 0) return false;
        balance += amount;
        return true;
    }

    bool withdraw(double amount) {
        if (amount <= 0 || amount > balance) return false;
        balance -= amount;
        return true;
    }
};

ll BankAccount::nextNumber = 1001;

class Client {
public:
    ll clientId;
    string name;

    Client(ll id, const string &n) : clientId(id), name(n) {}
};

class Bank {
private:
    unordered_map<ll, Client> clients;
    unordered_map<ll, BankAccount> accounts;

public:
    bool addClient(ll clientId, const string &name) {
        if (clients.find(clientId) != clients.end()) {
            cerr << "Ошибка: клиент с ID " << clientId << " уже существует.\n";
            return false;
        }
        clients.emplace(clientId, Client(clientId, name));
        return true;
    }

    bool addAccount(ll clientId, AccountType type) {
        if (clients.find(clientId) == clients.end()) {
            cerr << "Ошибка: клиент с ID " << clientId << " не существует.\n";
            return false;
        }
        BankAccount acc(clientId, type);
        accounts.emplace(acc.getAccountNumber(), acc);
        cout << "Создан счет " << acc.getAccountNumber() << " для клиента " << clientId << "\n";
        return true;
    }

    bool depositToAccount(ll accNum, double amount) {
        auto it = accounts.find(accNum);
        if (it == accounts.end()) {
            cerr << "Ошибка: счет " << accNum << " не найден.\n";
            return false;
        }
        if (!it->second.deposit(amount)) {
            cerr << "Ошибка: некорректная сумма депозита.\n";
            return false;
        }
        return true;
    }

    bool withdrawFromAccount(ll accNum, double amount) {
        auto it = accounts.find(accNum);
        if (it == accounts.end()) {
            cerr << "Ошибка: счет " << accNum << " не найден.\n";
            return false;
        }
        if (!it->second.withdraw(amount)) {
            cerr << "Ошибка: недостаточно средств или некорректная сумма.\n";
            return false;
        }
        return true;
    }

    bool transfer(ll fromAcc, ll toAcc, double amount) {
        auto itFrom = accounts.find(fromAcc);
        auto itTo = accounts.find(toAcc);

        if (itFrom == accounts.end() || itTo == accounts.end()) {
            cerr << "Ошибка: один из счетов не существует.\n";
            return false;
        }

        if (!itFrom->second.withdraw(amount)) {
            cerr << "Ошибка: недостаточно средств для перевода.\n";
            return false;
        }

        itTo->second.deposit(amount);
        return true;
    }

    void printAccountInfo(ll accNum) {
        auto it = accounts.find(accNum);
        if (it == accounts.end()) {
            cerr << "Ошибка: счет " << accNum << " не найден.\n";
            return;
        }
        cout << "Счет " << accNum << ", Баланс: " << it->second.getBalance() << "\n";
    }

    void printAllAccounts() {
        for (const auto &pair : accounts) {
            cout << "Счет " << pair.first << ", Баланс: " << pair.second.getBalance() << "\n";
        }
    }
};

int main() {
    Bank bank;

    bank.addClient(1, "Иван Иванов");
    bank.addClient(2, "Петр Петров");

    bank.addAccount(1, AccountType::SAVINGS);
    bank.addAccount(1, AccountType::CHECKING);
    bank.addAccount(2, AccountType::SAVINGS);

    bank.depositToAccount(1001, 500);
    bank.depositToAccount(1002, 1000);
    bank.depositToAccount(1003, 750);

    bank.transfer(1002, 1003, 300); // перевод

    bank.withdrawFromAccount(1001, 200);

    bank.printAllAccounts();

    return 0;
}
