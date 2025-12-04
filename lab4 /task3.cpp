#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
#include <iomanip>
#include <chrono>
#include <ctime>
#include <sstream>
#include <cmath>

using namespace std;
using ll = long long;
using TimePoint = std::chrono::system_clock::time_point;

string now_str() {
    auto now = chrono::system_clock::now();
    time_t t = chrono::system_clock::to_time_t(now);
    char buf[64];
    ctime_r(&t, buf);
    string s(buf);
    if (!s.empty() && s.back() == '\n') s.pop_back();
    return s;
}

enum class ClientType { Regular, Premium };
string clientTypeToStr(ClientType t) { return t==ClientType::Premium ? "Premium" : "Regular"; }

enum class AccountType { Checking, Savings };
string accountTypeToStr(AccountType t) { return t==AccountType::Savings ? "Savings" : "Checking"; }

enum class AccountStatus { Active, Closed };
string accountStatusToStr(AccountStatus s) { return s==AccountStatus::Active ? "Active" : "Closed"; }

struct Transaction {
    ll id;
    TimePoint time;
    string type;
    ll fromAccount;
    ll toAccount;
    double amount;
    string note;

    string toString() const {
        time_t t = chrono::system_clock::to_time_t(time);
        char buf[64];
        ctime_r(&t, buf);
        string ts(buf);
        if (!ts.empty() && ts.back()=='\n') ts.pop_back();
        stringstream ss;
        ss << "Tx#" << id << " [" << ts << "] " << type
           << " amount=" << fixed << setprecision(2) << amount;
        if (fromAccount) ss << " from=" << fromAccount;
        if (toAccount) ss << " to=" << toAccount;
        if (!note.empty()) ss << " note=\"" << note << "\"";
        return ss.str();
    }
};

struct Account {
    ll number;
    AccountType type;
    AccountStatus status;
    double balance;
    ll ownerClientId;
    vector<ll> transactionIds;

    Account() = default;
    Account(ll num, AccountType t, ll ownerId)
        : number(num), type(t), status(AccountStatus::Active), balance(0.0), ownerClientId(ownerId) {}
};

struct Client {
    ll id;
    string name;
    string email;
    string phone;
    ClientType ctype;
    vector<ll> accounts;

    Client() = default;
    Client(ll id_, string name_, string email_, string phone_, ClientType t)
     : id(id_), name(move(name_)), email(move(email_)), phone(move(phone_)), ctype(t) {}
};

class Bank {
private:
    ll nextClientId = 1;
    ll nextAccountNumber = 1000000000LL;
    ll nextTransactionId = 1;

    unordered_map<ll, Client> clients;
    unordered_map<ll, Account> accounts;
    vector<Transaction> transactions;

public:
    Bank() = default;

    // CLIENTS
    ll addClient(const string &name, const string &email, const string &phone, ClientType t) {
        ll id = nextClientId++;
        clients.emplace(id, Client(id, name, email, phone, t));
        cout << "Added client id=" << id << "\n";
        return id;
    }

    bool deleteClient(ll clientId) {
        auto it = clients.find(clientId);
        if (it == clients.end()) {
            cout << "Client not found\n";
            return false;
        }
        for (ll accNum : it->second.accounts) {
            auto ait = accounts.find(accNum);
            if (ait != accounts.end() && ait->second.status == AccountStatus::Active) {
                cout << "Cannot delete client: active accounts exist (account " << accNum << ")\n";
                return false;
            }
        }
        clients.erase(it);
        cout << "Client deleted\n";
        return true;
    }

    Client* findClient(ll clientId) {
        auto it = clients.find(clientId);
        if (it==clients.end()) return nullptr;
        return &it->second;
    }

    void listClients() const {
        if (clients.empty()) {
            cout << "No clients registered.\n";
            return;
        }
        cout << "Clients:\n";
        for (const auto &p : clients) {
            const Client &c = p.second;
            cout << "ID=" << c.id << " | " << c.name << " | " << c.email << " | " << c.phone
                 << " | Type=" << clientTypeToStr(c.ctype)
                 << " | Accounts=" << c.accounts.size() << "\n";
        }
    }

    bool editClient(ll clientId, const string &name, const string &email, const string &phone, ClientType type) {
        auto it = clients.find(clientId);
        if (it==clients.end()) {
            cout << "Client not found\n";
            return false;
        }
        it->second.name = name;
        it->second.email = email;
        it->second.phone = phone;
        it->second.ctype = type;
        cout << "Client updated\n";
        return true;
    }

    // ACCOUNTS
    ll openAccount(ll clientId, AccountType atype) {
        auto cit = clients.find(clientId);
        if (cit == clients.end()) {
            cout << "Client not found\n";
            return 0;
        }
        ll accNum = nextAccountNumber++;
        Account acc(accNum, atype, clientId);
        accounts.emplace(accNum, acc);
        cit->second.accounts.push_back(accNum);
        cout << "Opened account " << accNum << " for client " << clientId << "\n";
        return accNum;
    }

    bool closeAccount(ll accountNumber) {
        auto it = accounts.find(accountNumber);
        if (it == accounts.end()) {
            cout << "Account not found\n";
            return false;
        }
        Account &acc = it->second;
        if (acc.status == AccountStatus::Closed) {
            cout << "Account already closed\n";
            return false;
        }
        if (fabs(acc.balance) > 1e-9) {
            cout << "Account balance is not zero. Cannot close.\n";
            return false;
        }
        acc.status = AccountStatus::Closed;
        cout << "Account closed: " << accountNumber << "\n";
        return true;
    }

    vector<Account*> getClientAccounts(ll clientId) {
        vector<Account*> res;
        auto cit = clients.find(clientId);
        if (cit==clients.end()) return res;
        for (ll accNum : cit->second.accounts) {
            auto ait = accounts.find(accNum);
            if (ait != accounts.end()) res.push_back(&ait->second);
        }
        return res;
    }

    Account* findAccount(ll accNum) {
        auto it = accounts.find(accNum);
        if (it==accounts.end()) return nullptr;
        return &it->second;
    }

    void listAllAccounts() const {
        if (accounts.empty()) {
            cout << "No accounts.\n";
            return;
        }
        cout << "Accounts:\n";
        for (const auto &p : accounts) {
            const Account &a = p.second;
            cout << "Acc#" << a.number << " Owner=" << a.ownerClientId
                 << " Type=" << accountTypeToStr(a.type)
                 << " Status=" << accountStatusToStr(a.status)
                 << " Balance=" << fixed << setprecision(2) << a.balance << "\n";
        }
    }

    // TRANSACTIONS
    ll recordTransaction(const string &type, ll fromAcc, ll toAcc, double amount, const string &note="") {
        Transaction tx;
        tx.id = nextTransactionId++;
        tx.time = chrono::system_clock::now();
        tx.type = type;
        tx.fromAccount = fromAcc;
        tx.toAccount = toAcc;
        tx.amount = amount;
        tx.note = note;
        transactions.push_back(tx);
        return tx.id;
    }

    bool deposit(ll accNum, double amount, const string &note="") {
        if (amount <= 0) { cout << "Amount must be > 0\n"; return false; }
        Account* acc = findAccount(accNum);
        if (!acc) { cout << "Account not found\n"; return false; }
        if (acc->status != AccountStatus::Active) { cout << "Account is not active\n"; return false; }
        acc->balance += amount;
        ll txid = recordTransaction("Deposit", 0, accNum, amount, note);
        acc->transactionIds.push_back(txid);
        cout << "Deposited " << fixed << setprecision(2) << amount << " to " << accNum << "\n";
        return true;
    }

    bool withdraw(ll accNum, double amount, const string &note="") {
        if (amount <= 0) { cout << "Amount must be > 0\n"; return false; }
        Account* acc = findAccount(accNum);
        if (!acc) { cout << "Account not found\n"; return false; }
        if (acc->status != AccountStatus::Active) { cout << "Account is not active\n"; return false; }
        if (acc->balance + 1e-9 < amount) { cout << "Insufficient funds\n"; return false; }
        acc->balance -= amount;
        ll txid = recordTransaction("Withdraw", accNum, 0, amount, note);
        acc->transactionIds.push_back(txid);
        cout << "Withdrew " << fixed << setprecision(2) << amount << " from " << accNum << "\n";
        return true;
    }

    bool transfer(ll fromAccNum, ll toAccNum, double amount, const string &note="") {
        if (amount <= 0) { cout << "Amount must be > 0\n"; return false; }
        Account* aFrom = findAccount(fromAccNum);
        Account* aTo = findAccount(toAccNum);
        if (!aFrom || !aTo) { cout << "One or both accounts not found\n"; return false; }
        if (aFrom->status != AccountStatus::Active || aTo->status != AccountStatus::Active) {
            cout << "One or both accounts are not active\n"; return false;
        }
        if (aFrom->balance + 1e-9 < amount) { cout << "Insufficient funds in source account\n"; return false; }
        aFrom->balance -= amount;
        aTo->balance += amount;
        ll txid = recordTransaction("Transfer", fromAccNum, toAccNum, amount, note);
        aFrom->transactionIds.push_back(txid);
        aTo->transactionIds.push_back(txid);
        cout << "Transferred " << fixed << setprecision(2) << amount << " from " << fromAccNum << " to " << toAccNum << "\n";
        return true;
    }

    void listAllTransactions() const {
        if (transactions.empty()) {
            cout << "No transactions\n";
            return;
        }
        cout << "Transactions (" << transactions.size() << "):\n";
        for (const auto &tx : transactions) {
            cout << tx.toString() << "\n";
        }
    }

    void showAccountTransactions(ll accNum) const {
        auto it = accounts.find(accNum);
        if (it==accounts.end()) {
            cout << "Account not found\n"; return;
        }
        const Account &acc = it->second;
        if (acc.transactionIds.empty()) { cout << "No transactions for this account\n"; return; }
        cout << "Transactions for account " << accNum << ":\n";
        for (ll tid : acc.transactionIds) {
            if (tid > 0 && tid <= (ll)transactions.size()) {
                cout << transactions[tid-1].toString() << "\n";
            }
        }
    }

    // REPORTS
    void bankOverview() const {
        cout << "=== Bank Overview ===\n";
        cout << "Total clients: " << clients.size() << "\n";
        size_t openAccounts = 0;
        double totalBalance = 0.0;
        for (const auto &p : accounts) {
            const Account &a = p.second;
            if (a.status == AccountStatus::Active) openAccounts++;
            totalBalance += a.balance;
        }
        cout << "Open accounts: " << openAccounts << "\n";
        cout << "Total funds in bank: " << fixed << setprecision(2) << totalBalance << "\n";
    }

    void listRegisteredClients() const { listClients(); }

    void listOpenedAccounts() const {
        cout << "Opened accounts (active):\n";
        bool any=false;
        for (const auto &p : accounts) {
            const Account &a = p.second;
            if (a.status == AccountStatus::Active) {
                any=true;
                cout << "Acc#" << a.number << " Owner=" << a.ownerClientId
                     << " Type=" << accountTypeToStr(a.type)
                     << " Balance=" << fixed << setprecision(2) << a.balance << "\n";
            }
        }
        if (!any) cout << "No active accounts\n";
    }

    void statsActiveClientsAndAccounts() const {
        size_t activeClients = 0;
        for (const auto &p : clients) {
            bool ok = false;
            for (ll accNum : p.second.accounts) {
                auto ait = accounts.find(accNum);
                if (ait != accounts.end() && ait->second.status == AccountStatus::Active) { ok = true; break; }
            }
            if (ok) activeClients++;
        }
        size_t activeAccounts = 0;
        for (const auto &p : accounts) if (p.second.status == AccountStatus::Active) activeAccounts++;
        cout << "Active clients: " << activeClients << "\n";
        cout << "Active accounts: " << activeAccounts << "\n";
    }

    void printClientDetails(ll clientId) const {
        auto it = clients.find(clientId);
        if (it==clients.end()) {
            cout << "Client not found\n"; return;
        }
        const Client &c = it->second;
        cout << "Client ID=" << c.id << " Name=" << c.name << " Email=" << c.email
             << " Phone=" << c.phone << " Type=" << clientTypeToStr(c.ctype) << "\n";
        if (c.accounts.empty()) { cout << "  No accounts\n"; return; }
        cout << "  Accounts:\n";
        for (ll accNum : c.accounts) {
            auto ait = accounts.find(accNum);
            if (ait==accounts.end()) {
                cout << "   Acc#" << accNum << " (not found in bank data)\n";
            } else {
                const Account &a = ait->second;
                cout << "   Acc#" << a.number << " Type=" << accountTypeToStr(a.type)
                     << " Status=" << accountStatusToStr(a.status)
                     << " Balance=" << fixed << setprecision(2) << a.balance << "\n";
            }
        }
    }
};

// MENU
int menuChoice() {
    cout << "\n=== Menu ===\n";
    cout << "1 Add client\n2 Delete client\n3 Find client\n4 List all clients\n5 Edit client\n";
    cout << "6 Open account\n7 Close account\n8 List accounts for client\n9 Find account\n10 List all accounts\n";
    cout << "11 Deposit\n12 Withdraw\n13 Transfer\n14 Show account transactions\n15 Show all transactions\n";
    cout << "16 Bank overview & reports\n0 Exit\nChoice: ";
    int c;
    if (!(cin >> c)) { cin.clear(); string s; getline(cin,s); return -1; }
    return c;
}

ClientType readClientTypeFromInt(int v) {
    return (v==2 ? ClientType::Premium : ClientType::Regular);
}
AccountType readAccountTypeFromInt(int v) {
    return (v==2 ? AccountType::Savings : AccountType::Checking);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    Bank bank;

    // Seed sample data
    ll c1 = bank.addClient("Alice Ivanova", "alice@example.com", "+37060000001", ClientType::Regular);
    ll c2 = bank.addClient("Bob Petrov", "bob@example.com", "+37060000002", ClientType::Premium);

    ll a1 = bank.openAccount(c1, AccountType::Checking);
    ll a2 = bank.openAccount(c1, AccountType::Savings);
    ll a3 = bank.openAccount(c2, AccountType::Checking);

    bank.deposit(a1, 1000.0, "Initial deposit");
    bank.deposit(a2, 5000.0, "Initial savings");
    bank.deposit(a3, 2000.0, "Bob initial");

    // Menu loop
    while (true) {
        int choice = menuChoice();
        if (choice == 0) {
            cout << "Bye\n"; break;
        }
        switch (choice) {
            case 1: {
                string name,email,phone;
                int t;
                cout << "Name: "; getline(cin >> ws, name);
                cout << "Email: "; getline(cin, email);
                cout << "Phone: "; getline(cin, phone);
                cout << "Type (1-Regular, 2-Premium): "; cin >> t;
                bank.addClient(name,email,phone, readClientTypeFromInt(t));
                break;
            }
            case 2: {
                ll id; cout << "Client ID to delete: "; cin >> id;
                bank.deleteClient(id);
                break;
            }
            case 3: {
                ll id; cout << "Client ID: "; cin >> id;
                bank.printClientDetails(id);
                break;
            }
            case 4:
                bank.listRegisteredClients();
                break;
            case 5: {
                ll id; cout << "Client ID: "; cin >> id;
                string name,email,phone; int t;
                cout << "New Name: "; getline(cin >> ws, name);
                cout << "New Email: "; getline(cin, email);
                cout << "New Phone: "; getline(cin, phone);
                cout << "Type (1-Regular, 2-Premium): "; cin >> t;
                bank.editClient(id, name, email, phone, readClientTypeFromInt(t));
                break;
            }
            case 6: {
                ll cid; int at;
                cout << "Client ID: "; cin >> cid;
                cout << "Account type (1-Checking, 2-Savings): "; cin >> at;
                bank.openAccount(cid, readAccountTypeFromInt(at));
                break;
            }
            case 7: {
                ll acc; cout << "Account number to close: "; cin >> acc;
                bank.closeAccount(acc);
                break;
            }
            case 8: {
                ll cid; cout << "Client ID: "; cin >> cid;
                auto v = bank.getClientAccounts(cid);
                if (v.empty()) cout << "No accounts or client not found\n";
                else {
                    for (auto a : v) {
                        cout << "Acc#" << a->number << " Type=" << accountTypeToStr(a->type)
                             << " Status=" << accountStatusToStr(a->status)
                             << " Balance=" << fixed << setprecision(2) << a->balance << "\n";
                    }
                }
                break;
            }
            case 9: {
                ll acc; cout << "Account number: "; cin >> acc;
                Account* a = bank.findAccount(acc);
                if (!a) cout << "Account not found\n";
                else {
                    cout << "Acc#" << a->number << " Owner=" << a->ownerClientId
                         << " Type=" << accountTypeToStr(a->type)
                         << " Status=" << accountStatusToStr(a->status)
                         << " Balance=" << fixed << setprecision(2) << a->balance << "\n";
                }
                break;
            }
            case 10:
                bank.listAllAccounts();
                break;
            case 11: {
                ll acc; double amt; string note;
                cout << "Account: "; cin >> acc;
                cout << "Amount: "; cin >> amt;
                cout << "Note: "; getline(cin >> ws, note);
                bank.deposit(acc, amt, note);
                break;
            }
            case 12: {
                ll acc; double amt; string note;
                cout << "Account: "; cin >> acc;
                cout << "Amount: "; cin >> amt;
                cout << "Note: "; getline(cin >> ws, note);
                bank.withdraw(acc, amt, note);
                break;
            }
            case 13: {
                ll from,to; double amt; string note;
                cout << "From account: "; cin >> from;
                cout << "To account: "; cin >> to;
                cout << "Amount: "; cin >> amt;
                cout << "Note: "; getline(cin >> ws, note);
                bank.transfer(from,to,amt,note);
                break;
            }
            case 14: {
                ll acc; cout << "Account: "; cin >> acc;
                bank.showAccountTransactions(acc);
                break;
            }
            case 15:
                bank.listAllTransactions();
                break;
            case 16:
                bank.bankOverview();
                bank.listOpenedAccounts();
                bank.statsActiveClientsAndAccounts();
                break;
            default:
                cout << "Unknown choice\n";
                break;
        }
    }

    return 0;
}
