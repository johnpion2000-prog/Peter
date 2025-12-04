#include <iostream>
#include <string>
#include <unordered_map>
#include <vector>
#include <memory>

using namespace std;

using ll = long long;

enum class AccountType { Standard, Savings };

// ================= BankAccount =================
class BankAccount {
private:
    ll number;
    ll ownerClientId;
    AccountType type;
    double balance;
    static ll nextNumber;

public:
    BankAccount(ll ownerId, AccountType t)
        : number(nextNumber++), ownerClientId(ownerId), type(t), balance(0) {}

    ll getNumber() const { return number; }
    ll getOwnerId() const { return ownerClientId; }
    double getBalance() const { return balance; }

    void deposit(double amount) { balance += amount; }
    bool withdraw(double amount) {
        if (amount > balance) return false;
        balance -= amount;
        return true;
    }
};

// Initialize static member
ll BankAccount::nextNumber = 1000000000LL;

// ================= Client =================
class Client {
private:
    ll id;
    string name;
    static ll nextId;

public:
    Client(const string &name) : id(nextId++), name(name) {}

    ll getId() const { return id; }
    string getName() const { return name; }
};

// Initialize static member
ll Client::nextId = 1;

// ================= Bank =================
class Bank {
private:
    unordered_map<ll, shared_ptr<Client>> clients;
    unordered_map<ll, BankAccount> accounts;

public:
    void addClient(const string &name) {
        auto client = make_shared<Client>(name);
        clients[client->getId()] = client;
    }

    void addAccount(ll clientId, AccountType type) {
        // Create account and insert it using its own number as key
        BankAccount acc(clientId, type);
        ll accNum = acc.getNumber();
        accounts.emplace(accNum, move(acc));
    }

    void printClientAccounts(ll clientId) {
        auto it = clients.find(clientId);
        if (it == clients.end()) {
            cout << "Client not found.\n";
            return;
        }

        cout << "Accounts for client " << it->second->getName() << ":\n";
        for (const auto &pair : accounts) {
            const BankAccount &acc = pair.second;
            if (acc.getOwnerId() == clientId) {
                cout << "  Account " << acc.getNumber()
                     << ", Balance: " << acc.getBalance() << "\n";
            }
        }
    }
};

// ================= Main =================
int main() {
    Bank bank;

    // Add clients
    bank.addClient("Alice");
    bank.addClient("Bob");

    // Add accounts
    bank.addAccount(1, AccountType::Standard);
    bank.addAccount(1, AccountType::Savings);
    bank.addAccount(2, AccountType::Standard);

    // Print accounts
    bank.printClientAccounts(1);
    bank.printClientAccounts(2);

    return 0;
}
