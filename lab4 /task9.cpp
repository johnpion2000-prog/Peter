#include <iostream>
#include <unordered_map>
#include <iomanip>
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

    string getTypeString() const {
        return type == AccountType::SAVINGS ? "Сбережения" : "Текущий";
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
        cout << fixed << setprecision(2);
        cout << "Счет " << accNum
             << " (" << it->second.getTypeString() << ")"
             << ", Баланс: " << it->second.getBalance() << "\n";
    }

    void printAllAccounts() {
        cout << fixed << setprecision(2);
        cout << "Все счета банка:\n";
        for (const auto &pair : accounts) {
            cout << "Счет " << pair.first
                 << " (" << pair.second.getTypeString() << ")"
                 << ", Баланс: " << pair.second.getBalance() << "\n";
        }
    }
};

void showMenu() {
    cout << "\n=== Меню банка ===\n";
    cout << "1. Добавить клиента\n";
    cout << "2. Создать счет\n";
    cout << "3. Депозит\n";
    cout << "4. Снятие\n";
    cout << "5. Перевод\n";
    cout << "6. Показать счет\n";
    cout << "7. Показать все счета\n";
    cout << "0. Выход\n";
    cout << "Выберите действие: ";
}

int main() {
    Bank bank;
    int choice;

    while (true) {
        showMenu();
        cin >> choice;

        if (cin.fail()) { // обработка некорректного ввода
            cin.clear();
            cin.ignore(1000, '\n');
            cout << "Ошибка ввода! Попробуйте снова.\n";
            continue;
        }

        if (choice == 0) break;

        ll clientId, accNum, fromAcc, toAcc;
        double amount;
        string name;
        int typeChoice;

        switch (choice) {
        case 1:
            cout << "Введите ID клиента: ";
            cin >> clientId;
            cin.ignore();
            cout << "Введите имя клиента: ";
            getline(cin, name);
            bank.addClient(clientId, name);
            break;
        case 2:
            cout << "Введите ID клиента: ";
            cin >> clientId;
            cout << "Выберите тип счета (0-Сбережения, 1-Текущий): ";
            cin >> typeChoice;
            bank.addAccount(clientId, typeChoice == 0 ? AccountType::SAVINGS : AccountType::CHECKING);
            break;
        case 3:
            cout << "Введите номер счета: ";
            cin >> accNum;
            cout << "Введите сумму депозита: ";
            cin >> amount;
            bank.depositToAccount(accNum, amount);
            break;
        case 4:
            cout << "Введите номер счета: ";
            cin >> accNum;
            cout << "Введите сумму снятия: ";
            cin >> amount;
            bank.withdrawFromAccount(accNum, amount);
            break;
        case 5:
            cout << "Введите номер счета отправителя: ";
            cin >> fromAcc;
            cout << "Введите номер счета получателя: ";
            cin >> toAcc;
            cout << "Введите сумму перевода: ";
            cin >> amount;
            bank.transfer(fromAcc, toAcc, amount);
            break;
        case 6:
            cout << "Введите номер счета: ";
            cin >> accNum;
            bank.printAccountInfo(accNum);
            break;
        case 7:
            bank.printAllAccounts();
            break;
        default:
            cout << "Неверный выбор. Попробуйте снова.\n";
        }
    }

    cout << "Выход из программы. До свидания!\n";
    return 0;
}
