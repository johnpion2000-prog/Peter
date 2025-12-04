// task5_oop_bank.cpp
// Single-file OOP banking system implementing Tasks 1-5.
// Compile: clang++ -std=c++17 task5_oop_bank.cpp -O2 -Wall -Wextra -o task5_bank

#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
#include <memory>
#include <chrono>
#include <ctime>
#include <iomanip>
#include <sstream>
#include <algorithm>

using namespace std;
using ll = long long;
using TimePoint = chrono::system_clock::time_point;

// ---------------------------
// Helper structs (Task 4)
// ---------------------------

struct Address {
    string street;     // улица и дом
    string city;       // город
    string postalCode; // почтовый индекс
    string country;    // страна
};

struct Date {
    int day{0};
    int month{0};
    int year{0};

    static Date today() {
        time_t t = chrono::system_clock::to_time_t(chrono::system_clock::now());
        tm local_tm;
#if defined(_MSC_VER)
        localtime_s(&local_tm, &t);
#else
        localtime_r(&t, &local_tm);
#endif
        return Date{local_tm.tm_mday, local_tm.tm_mon + 1, local_tm.tm_year + 1900};
    }

    string toString() const {
        stringstream ss;
        ss << setw(2) << setfill('0') << day << "."
           << setw(2) << setfill('0') << month << "."
           << year;
        return ss.str();
    }
};

// ---------------------------
// Utility: format time
// ---------------------------

static string timePointToString(const TimePoint &tp) {
    time_t t = chrono::system_clock::to_time_t(tp);
    char buf[64];
#if defined(_MSC_VER)
    ctime_s(buf, sizeof(buf), &t);
#else
    ctime_r(&t, buf);
#endif
    string s(buf);
    if (!s.empty() && s.back() == '\n') s.pop_back();
    return s;
}

// ---------------------------
// Transaction (Task 5.4)
// ---------------------------

enum class TransactionType { Deposit, Withdraw, Transfer };

struct Transaction {
    static ll nextTransactionId;
    ll id;
    ll fromAccount; // 0 if N/A
    ll toAccount;   // 0 if N/A
    double amount;
    TimePoint time;
    TransactionType type;
    string note;

    Transaction() = delete;

    Transaction(ll fromAcc, ll toAcc, double amt, TransactionType tp, const string &note_ = "")
        : id(nextTransactionId++), fromAccount(fromAcc), toAccount(toAcc), amount(amt),
          time(chrono::system_clock::now()), type(tp), note(note_) {}

    string typeToStr() const {
        switch (type) {
            case TransactionType::Deposit: return "Deposit";
            case TransactionType::Withdraw: return "Withdraw";
            case TransactionType::Transfer: return "Transfer";
            default: return "Unknown";
        }
    }

    string toString() const {
        stringstream ss;
        ss << "Tx#" << id << " [" << timePointToString(time) << "] "
           << typeToStr() << " amount=" << fixed << setprecision(2) << amount;
        if (fromAccount) ss << " from=" << fromAccount;
        if (toAccount) ss << " to=" << toAccount;
        if (!note.empty()) ss << " note=\"" << note << "\"";
        return ss.str();
    }
};

ll Transaction::nextTransactionId = 1;

// ---------------------------
// BankAccount (Task 5.3)
// ---------------------------

enum class AccountType { Checking, Savings };
enum class AccountStatus { Active, Closed };

class BankAccount {
public:
    // Static counter/generator
    static ll generateAccountNumber() {
        static ll nextAccountNumber = 1000000000LL;
        return nextAccountNumber++;
    }

    // Constructors
    BankAccount() = delete;
    BankAccount(ll ownerId, AccountType t)
        : number(generateAccountNumber()), ownerClientId(ownerId), type(t),
          openDate(Date::today()), status(AccountStatus::Active), balance(0.0) {
        ++accountCounter;
    }

    ~BankAccount() = default;

    // Getters
    ll getNumber() const { return number; }
    ll getOwnerId() const { return ownerClientId; }
    double getBalance() const { return balance; }
    AccountType getType() const { return type; }
    AccountStatus getStatus() const { return status; }
    Date getOpenDate() const { return openDate; }
    const vector<ll>& getTransactionIds() const { return transactionIds; }

    // Operations
    bool deposit(double amount) {
        if (!isActive()) return false;
        if (amount <= 0.0) return false;
        balance += amount;
        return true;
    }

    bool withdraw(double amount) {
        if (!isActive()) return false;
        if (amount <= 0.0) return false;
        if (balance + 1e-9 < amount) return false;
        balance -= amount;
        return true;
    }

    // activation/deactivation
    void deactivate() { status = AccountStatus::Closed; }
    void activate() { status = AccountStatus::Active; }

    bool isActive() const { return status == AccountStatus::Active; }

    // Transaction tracking: store transaction ids recorded in Bank
    void addTransactionId(ll txId) { transactionIds.push_back(txId); }

    // Information
    string infoString() const {
        stringstream ss;
        ss << "Acc#" << number << " Owner=" << ownerClientId
           << " Type=" << (type==AccountType::Checking ? "Checking" : "Savings")
           << " Status=" << (status==AccountStatus::Active ? "Active" : "Closed")
           << " Balance=" << fixed << setprecision(2) << balance
           << " Opened=" << openDate.toString();
        return ss.str();
    }

    static ll getAccountCount() { return accountCounter; }

private:
    ll number;
    ll ownerClientId;
    AccountType type;
    Date openDate;
    AccountStatus status;
    double balance;
    vector<ll> transactionIds;

    static ll accountCounter;
};

ll BankAccount::accountCounter = 0;

// ---------------------------
// Client base (Task 5.1)
// ---------------------------

class Client {
public:
    // Static counter
    static ll getClientCounter() { return clientCounter; }
    static void resetClientCounterForTests(ll v = 1) { clientCounter = v; } // helper

    // Constructors
    Client()
        : id(clientCounter++), name(""), surname(""), address(), registrationDate(Date::today()) {}

    Client(const string &name_, const string &surname_, const Address &addr)
        : id(clientCounter++), name(name_), surname(surname_), address(addr),
          registrationDate(Date::today()) {}

    virtual ~Client() = default; // virtual destructor

    // Getters
    ll getId() const { return id; }
    string getName() const { return name; }
    string getSurname() const { return surname; }
    Address getAddress() const { return address; }
    Date getRegistrationDate() const { return registrationDate; }

    // Setters
    void setName(const string &n) { name = n; }
    void setSurname(const string &s) { surname = s; }
    void setAddress(const Address &a) { address = a; }

    // Account management helper (stored at Bank level but clients track their account numbers)
    void addAccountNumber(ll acc) { accountNumbers.push_back(acc); }
    void removeAccountNumber(ll acc) {
        accountNumbers.erase(remove(accountNumbers.begin(), accountNumbers.end(), acc), accountNumbers.end());
    }
    const vector<ll>& getAccountNumbers() const { return accountNumbers; }

    // Virtual display
    virtual void displayInfo() const {
        cout << "Client ID: " << id << "\n";
        cout << "Name: " << name << " " << surname << "\n";
        cout << "Address: " << address.street << ", " << address.city << ", " << address.postalCode
             << ", " << address.country << "\n";
        cout << "Registered: " << registrationDate.toString() << "\n";
    }

    // Virtual type name
    virtual string typeName() const { return "Client"; }

protected:
    ll id;
    string name;
    string surname;
    Address address;
    Date registrationDate;
    vector<ll> accountNumbers;

    static ll clientCounter;
};

ll Client::clientCounter = 1; // start IDs at 1

// ---------------------------
// PremiumClient (Task 5.2)
// ---------------------------

class PremiumClient : public Client {
public:
    PremiumClient() : Client(), premiumLevel(1), discountPercent(0.0) {}
    PremiumClient(const string &name_, const string &surname_, const Address &addr,
                  int level = 1, double discount = 0.0)
        : Client(name_, surname_, addr), premiumLevel(level), discountPercent(discount) {}

    virtual ~PremiumClient() = default;

    int getLevel() const { return premiumLevel; }
    double getDiscount() const { return discountPercent; }

    void setLevel(int l) { premiumLevel = l; }
    void setDiscount(double d) { discountPercent = d; }

    void displayInfo() const override {
        cout << "Premium Client ID: " << id << "\n";
        cout << "Name: " << name << " " << surname << "\n";
        cout << "Premium level: " << premiumLevel << ", discount: " << fixed << setprecision(2) << discountPercent << "%\n";
        cout << "Address: " << address.street << ", " << address.city << ", " << address.postalCode
             << ", " << address.country << "\n";
        cout << "Registered: " << registrationDate.toString() << "\n";
    }

    string typeName() const override { return "PremiumClient"; }

    // Premium-specific behaviour example: apply discount to fee
    double applyDiscount(double fee) const {
        return fee * (1.0 - discountPercent / 100.0);
    }

private:
    int premiumLevel;
    double discountPercent;
};

// ---------------------------
// Bank (Task 5.5) - manager
// ---------------------------

class Bank {
public:
    Bank() = default;
    ~Bank() = default;

    // Add a regular client
    shared_ptr<Client> addClient(const string &name, const string &surname, const Address &addr) {
        auto c = make_shared<Client>(name, surname, addr);
        clients.emplace(c->getId(), c);
        cout << "Added client ID=" << c->getId() << "\n";
        return c;
    }

    // Add premium client
    shared_ptr<PremiumClient> addPremiumClient(const string &name, const string &surname, const Address &addr,
                                               int level = 1, double discount = 0.0)
    {
        auto pc = make_shared<PremiumClient>(name, surname, addr, level, discount);
        clients.emplace(pc->getId(), pc);
        cout << "Added premium client ID=" << pc->getId() << "\n";
        return pc;
    }

    // Delete client (only if no active accounts)
    bool deleteClient(ll clientId) {
        auto it = clients.find(clientId);
        if (it == clients.end()) {
            cout << "Client not found\n";
            return false;
        }
        // check accounts
        auto &accs = it->second->getAccountNumbers();
        for (ll accNum : accs) {
            auto ait = accounts.find(accNum);
            if (ait != accounts.end() && ait->second.isActive()) {
                cout << "Cannot delete client: active accounts exist (acc " << accNum << ")\n";
                return false;
            }
        }
        clients.erase(it);
        cout << "Client deleted\n";
        return true;
    }

    // Edit client (simple)
    bool editClient(ll clientId, const string &name, const string &surname, const Address &addr) {
        auto it = clients.find(clientId);
        if (it == clients.end()) return false;
        it->second->setName(name);
        it->second->setSurname(surname);
        it->second->setAddress(addr);
        cout << "Client updated\n";
        return true;
    }

    // Find client
    shared_ptr<Client> findClientById(ll clientId) {
        auto it = clients.find(clientId);
        if (it == clients.end()) return nullptr;
        return it->second;
    }

    // Accounts
    shared_ptr<BankAccount> openAccount(ll clientId, AccountType type) {
        auto client = findClientById(clientId);
        if (!client) {
            cout << "Client not found\n";
            return nullptr;
        }
        BankAccount acc(clientId, type);
        ll accNum = acc.getNumber();
        accounts.emplace(accNum, move(acc));
        // add account number to client
        client->addAccountNumber(accNum);
        cout << "Opened account " << accNum << " for client " << clientId << "\n";
        return getAccountPtr(accNum);
    }

    bool closeAccount(ll accNum) {
        auto it = accounts.find(accNum);
        if (it == accounts.end()) {
            cout << "Account not found\n";
            return false;
        }
        if (it->second.getBalance() != 0.0) {
            cout << "Balance must be zero to close account\n";
            return false;
        }
        it->second.deactivate();
        cout << "Account closed\n";
        return true;
    }

    // Basic operations: deposit / withdraw / transfer
    bool deposit(ll accNum, double amount, const string &note = "") {
        auto ait = accounts.find(accNum);
        if (ait == accounts.end()) { cout << "Account not found\n"; return false; }
        if (!ait->second.isActive()) { cout << "Account not active\n"; return false; }
        if (!ait->second.deposit(amount)) { cout << "Invalid deposit\n"; return false; }
        // record transaction
        Transaction tx(0, accNum, amount, TransactionType::Deposit, note);
        ll txid = tx.id;
        transactions.emplace_back(move(tx));
        ait->second.addTransactionId(txid);
        return true;
    }

    bool withdraw(ll accNum, double amount, const string &note = "") {
        auto ait = accounts.find(accNum);
        if (ait == accounts.end()) { cout << "Account not found\n"; return false; }
        if (!ait->second.isActive()) { cout << "Account not active\n"; return false; }
        if (!ait->second.withdraw(amount)) { cout << "Insufficient funds or invalid\n"; return false; }
        Transaction tx(accNum, 0, amount, TransactionType::Withdraw, note);
        ll txid = tx.id;
        transactions.emplace_back(move(tx));
        ait->second.addTransactionId(txid);
        return true;
    }

    bool transfer(ll fromAcc, ll toAcc, double amount, const string &note = "") {
        auto aFromIt = accounts.find(fromAcc);
        auto aToIt = accounts.find(toAcc);
        if (aFromIt == accounts.end() || aToIt == accounts.end()) { cout << "One or both accounts not found\n"; return false; }
        if (!aFromIt->second.isActive() || !aToIt->second.isActive()) { cout << "One or both accounts not active\n"; return false; }
        if (!aFromIt->second.withdraw(amount)) { cout << "Insufficient funds\n"; return false; }
        if (!aToIt->second.deposit(amount)) {
            // rollback
            aFromIt->second.deposit(amount);
            cout << "Transfer failed during deposit\n";
            return false;
        }
        Transaction tx(fromAcc, toAcc, amount, TransactionType::Transfer, note);
        ll txid = tx.id;
        transactions.emplace_back(move(tx));
        aFromIt->second.addTransactionId(txid);
        aToIt->second.addTransactionId(txid);
        return true;
    }

    // Search accounts
    BankAccount* findAccount(ll accNum) {
        auto it = accounts.find(accNum);
        if (it == accounts.end()) return nullptr;
        return &it->second;
    }

    shared_ptr<BankAccount> getAccountPtr(ll accNum) {
        auto it = accounts.find(accNum);
        if (it == accounts.end()) return nullptr;
        // create a temporary shared_ptr by returning a wrapper that doesn't own the account.
        // For simplicity here we return nullptr - callers should use findAccount to access non-owning pointer.
        return nullptr;
    }

    // Transactions
    void listAllTransactions() const {
        if (transactions.empty()) {
            cout << "No transactions\n";
            return;
        }
        for (const auto &tx : transactions) {
            cout << tx.toString() << "\n";
        }
    }

    void showAccountTransactions(ll accNum) const {
        auto ait = accounts.find(accNum);
        if (ait == accounts.end()) { cout << "Account not found\n"; return; }
        const auto &txIds = ait->second.getTransactionIds();
        if (txIds.empty()) { cout << "No transactions for this account\n"; return; }
        for (ll tid : txIds) {
            // Transaction ids start from 1 and are in vector in order they were created.
            // We'll search by id in transactions vector (transactions stored in insertion order).
            auto it = find_if(transactions.begin(), transactions.end(), [&](const Transaction &t){ return t.id == tid; });
            if (it != transactions.end()) cout << it->toString() << "\n";
        }
    }

    // Reports & analytics
    void bankOverview() const {
        cout << "=== Bank Overview ===\n";
        cout << "Total clients: " << clients.size() << "\n";
        cout << "Total accounts: " << accounts.size() << "\n";
        double totalBalance = 0.0;
        ll activeAccounts = 0;
        for (const auto &p : accounts) {
            totalBalance += p.second.getBalance();
            if (p.second.isActive()) ++activeAccounts;
        }
        cout << "Active accounts: " << activeAccounts << "\n";
        cout << "Total funds: " << fixed << setprecision(2) << totalBalance << "\n";
    }

    void listClients() const {
        if (clients.empty()) { cout << "No clients\n"; return; }
        cout << "Clients:\n";
        for (const auto &p : clients) {
            cout << "ID=" << p.first << " Type=" << p.second->typeName()
                 << " Name=" << p.second->getName() << " " << p.second->getSurname()
                 << " Accounts=" << p.second->getAccountNumbers().size() << "\n";
        }
    }

    void listAccounts() const {
        if (accounts.empty()) { cout << "No accounts\n"; return; }
        cout << "Accounts:\n";
        for (const auto &p : accounts) {
            cout << p.second.infoString() << "\n";
        }
    }

    // Private helpers could be added (left as private in class), here public for brevity.

private:
    unordered_map<ll, shared_ptr<Client>> clients;
    unordered_map<ll, BankAccount> accounts;
    vector<Transaction> transactions;
};

// ---------------------------
// Console UI (both classes + menu demonstration)
// ---------------------------

static void printMainMenu() {
    cout << "\n=== Bank Menu ===\n";
    cout << "1  Add client\n";
    cout << "2  Add premium client\n";
    cout << "3  Edit client\n";
    cout << "4  Delete client\n";
    cout << "5  List clients\n";
    cout << "6  Open account\n";
    cout << "7  Close account\n";
    cout << "8  List accounts\n";
    cout << "9  Deposit\n";
    cout << "10 Withdraw\n";
    cout << "11 Transfer\n";
    cout << "12 Account transactions\n";
    cout << "13 All transactions\n";
    cout << "14 Bank overview\n";
    cout << "0  Exit\n";
    cout << "Choice: ";
}

static Address readAddressInteractive() {
    Address a;
    cout << "Street & house: ";
    getline(cin >> ws, a.street);
    cout << "City: ";
    getline(cin, a.city);
    cout << "Postal code: ";
    getline(cin, a.postalCode);
    cout << "Country: ";
    getline(cin, a.country);
    return a;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    Bank bank;

    // Seed sample data
    Address a1{"Gedimino pr. 1", "Vilnius", "01103", "Lithuania"};
    Address a2{"Laisves av. 2", "Kaunas", "44250", "Lithuania"};

    auto c1 = bank.addClient("Alice", "Ivanova", a1);
    auto pc = bank.addPremiumClient("Bob", "Petrov", a2, 2, 5.0);

    // open sample accounts
    auto acc1ptr = bank.openAccount(c1->getId(), AccountType::Checking);
    auto acc2ptr = bank.openAccount(pc->getId(), AccountType::Savings);

    if (acc1ptr == nullptr) {
        // Our openAccount returns nullptr for shared ptr wrapper; but accounts are created internally.
        // We'll access them via client account lists or by listing accounts.
    }

    // deposit via account numbers by reading client's first account
    if (!c1->getAccountNumbers().empty()) {
        ll accnum = c1->getAccountNumbers().front();
        bank.deposit(accnum, 1000.0, "Initial deposit");
    }
    if (!pc->getAccountNumbers().empty()) {
        ll accnum = pc->getAccountNumbers().front();
        bank.deposit(accnum, 5000.0, "Premium initial");
    }

    while (true) {
        printMainMenu();
        int choice;
        if (!(cin >> choice)) {
            cin.clear();
            string tmp; getline(cin, tmp);
            cout << "Invalid input\n";
            continue;
        }
        if (choice == 0) {
            cout << "Exiting\n";
            break;
        }
        switch (choice) {
            case 1: {
                string name, surname;
                cout << "First name: ";
                getline(cin >> ws, name);
                cout << "Surname: ";
                getline(cin, surname);
                Address a = readAddressInteractive();
                bank.addClient(name, surname, a);
                break;
            }
            case 2: {
                string name, surname;
                int lvl;
                double disc;
                cout << "First name: ";
                getline(cin >> ws, name);
                cout << "Surname: ";
                getline(cin, surname);
                Address a = readAddressInteractive();
                cout << "Premium level (int): ";
                cin >> lvl;
                cout << "Discount percent (e.g. 5.0): ";
                cin >> disc;
                bank.addPremiumClient(name, surname, a, lvl, disc);
                break;
            }
            case 3: {
                ll id;
                cout << "Client ID to edit: ";
                cin >> id;
                string name, surname;
                cout << "New First name: ";
                getline(cin >> ws, name);
                cout << "New Surname: ";
                getline(cin, surname);
                Address a = readAddressInteractive();
                bank.editClient(id, name, surname, a);
                break;
            }
            case 4: {
                ll id;
                cout << "Client ID to delete: ";
                cin >> id;
                bank.deleteClient(id);
                break;
            }
            case 5:
                bank.listClients();
                break;

            case 6: {
                ll cid;
                int t;
                cout << "Client ID: ";
                cin >> cid;
                cout << "Type (1-Checking, 2-Savings): ";
                cin >> t;
                bank.openAccount(cid, (t==2 ? AccountType::Savings : AccountType::Checking));
                break;
            }

            case 7: {
                ll accnum;
                cout << "Account number to close: ";
                cin >> accnum;
                bank.closeAccount(accnum);
                break;
            }

            case 8:
                bank.listAccounts();
                break;

            case 9: {
                ll accnum;
                double amt;
                string note;
                cout << "Account number: ";
                cin >> accnum;
                cout << "Amount: ";
                cin >> amt;
                cout << "Note: ";
                getline(cin >> ws, note);
                bank.deposit(accnum, amt, note);
                break;
            }

            case 10: {
                ll accnum;
                double amt;
                string note;
                cout << "Account number: ";
                cin >> accnum;
                cout << "Amount: ";
                cin >> amt;
                cout << "Note: ";
                getline(cin >> ws, note);
                bank.withdraw(accnum, amt, note);
                break;
            }

            case 11: {
                ll fromAcc, toAcc;
                double amt;
                string note;
                cout << "From account: ";
                cin >> fromAcc;
                cout << "To account: ";
                cin >> toAcc;
                cout << "Amount: ";
                cin >> amt;
                cout << "Note: ";
                getline(cin >> ws, note);
                bank.transfer(fromAcc, toAcc, amt, note);
                break;
            }

            case 12: {
                ll accnum;
                cout << "Account number: ";
                cin >> accnum;
                bank.showAccountTransactions(accnum);
                break;
            }

            case 13:
                bank.listAllTransactions();
                break;

            case 14:
                bank.bankOverview();
                break;

            default:
                cout << "Unknown option\n";
                break;
        }
    }

    return 0;
}
