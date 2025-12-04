#include <iostream>
#include <unordered_map>
#include <string>
#include <iomanip>
#include <limits>

using namespace std;

// Типы операций и счетов
enum class TransactionType { DEPOSIT, WITHDRAW, TRANSFER };
enum class AccountType { CHECKING, SAVINGS };
enum class AccountStatus { ACTIVE, CLOSED };

using ll = long long;

// ---------------------------
// Класс BankAccount
// ---------------------------
class BankAccount {
private:
    ll ownerClientId;
    AccountType type;
    AccountStatus status;
    double balance;

public:
    static ll nextNumber; // статический счетчик уникальных номеров

    ll accountNumber;

    // Конструктор
    BankAccount(ll ownerId, AccountType t) : ownerClientId(ownerId), type(t), status(AccountStatus::ACTIVE), balance(0) {
        accountNumber = nextNumber++;
    }

    // Методы доступа
    double getBalance() const { return balance; }
    AccountStatus getStatus() const { return status; }

    // Операции
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

ll BankAccount::nextNumber = 1001; // стартовый номер счета

// ---------------------------
// Класс Client
// ---------------------------
struct Client {
    ll clientId;
    string name;
};

// ---------------------------
// Класс Bank
// ---------------------------
class Bank {
private:
    unordered_map<ll, Client> clients;
    unordered_map<ll, BankAccount> accounts;

public:
    // Добавление клиента
    void addClient(ll clientId, const string &name) {
        if (clients.find(clientId) != clients.end()) {
            cout << "Client with ID " << clientId << " already exists.\n";
            return;
        }
        clients[clientId] = Client{clientId, name};
        cout << "Client added successfully.\n";
    }

    // Создание счета
    void createAccount(ll clientId, AccountType type) {
        if (clients.find(clientId) == clients.end()) {
            cout << "Client ID not found.\n";
            return;
        }
        BankAccount account(clientId, type);
        accounts[account.accountNumber] = account;
        cout << "Account created. Account number: " << account.accountNumber << "\n";
    }

    // Пополнение
    void deposit(ll accNum, double amount) {
        auto it = accounts.find(accNum);
        if (it == accounts.end()) { cout << "Account not found.\n"; return; }
        if (!it->second.deposit(amount)) { cout << "Invalid deposit amount.\n"; return; }
        cout << "Deposit successful. New balance: " << fixed << setprecision(2) << it->second.getBalance() << "\n";
    }

    // Снятие
    void withdraw(ll accNum, double amount) {
        auto it = accounts.find(accNum);
        if (it == accounts.end()) { cout << "Account not found.\n"; return; }
        if (!it->second.withdraw(amount)) { cout << "Insufficient funds or invalid amount.\n"; return; }
        cout << "Withdrawal successful. New balance: " << fixed << setprecision(2) << it->second.getBalance() << "\n";
    }

    // Перевод между счетами
    void transfer(ll fromAcc, ll toAcc, double amount) {
        auto itFrom = accounts.find(fromAcc);
        auto itTo = accounts.find(toAcc);
        if (itFrom == accounts.end() || itTo == accounts.end()) { cout << "One or both accounts not found.\n"; return; }
        if (!itFrom->second.withdraw(amount)) { cout << "Insufficient funds or invalid amount.\n"; return; }
        itTo->second.deposit(amount);
        cout << "Transfer successful.\n";
    }

    // Вывод информации о всех счетах
    void printAccounts() const {
        cout << "Accounts list:\n";
        for (const auto &pair : accounts) {
            cout << "Account " << pair.first << ", Balance: " << fixed << setprecision(2) << pair.second.getBalance() << "\n";
        }
    }
};

// ---------------------------
// Консольное меню
// ---------------------------
void showMenu() {
    cout << "\nBank Menu:\n";
    cout << "1. Add client\n";
    cout << "2. Create account\n";
    cout << "3. Deposit\n";
    cout << "4. Withdraw\n";
    cout << "5. Transfer\n";
    cout << "6. Show all accounts\n";
    cout << "0. Exit\n";
    cout << "Choose an option: ";
}

// ---------------------------
// Основной цикл программы
// ---------------------------
int main() {
    Bank bank;
    int choice;

    do {
        showMenu();
        cin >> choice;

        if(cin.fail()) { cin.clear(); cin.ignore(numeric_limits<streamsize>::max(), '\n'); choice = -1; }

        switch(choice) {
            case 1: {
                ll id; string name;
                cout << "Enter client ID and name: "; cin >> id >> ws; getline(cin, name);
                bank.addClient(id, name);
                break;
            }
            case 2: {
                ll id; int type;
                cout << "Enter client ID and account type (0-Checking, 1-Savings): "; cin >> id >> type;
                bank.createAccount(id, static_cast<AccountType>(type));
                break;
            }
            case 3: {
                ll acc; double amount;
                cout << "Enter account number and amount: "; cin >> acc >> amount;
                bank.deposit(acc, amount);
                break;
            }
            case 4: {
                ll acc; double amount;
                cout << "Enter account number and amount: "; cin >> acc >> amount;
                bank.withdraw(acc, amount);
                break;
            }
            case 5: {
                ll from, to; double amount;
                cout << "Enter from account, to account, and amount: "; cin >> from >> to >> amount;
                bank.transfer(from, to, amount);
                break;
            }
            case 6:
                bank.printAccounts();
                break;
            case 0:
                cout << "Exiting program.\n";
                break;
            default:
                cout << "Invalid option.\n";
        }
    } while(choice != 0);

    return 0;
}
