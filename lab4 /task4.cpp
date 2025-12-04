#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <iomanip>
#include <sstream>
#include <cmath>
#include <chrono>

using namespace std;
using ll = long long;
using TimePoint = std::chrono::system_clock::time_point;

// ===============================================
// STRUCTURES FROM TASK 4
// ===============================================

struct Address {
    string street;     // улица и дом
    string city;       // город
    string postalCode; // индекс
    string country;    // страна
};

struct Date {
    int day;
    int month;
    int year;
};

// ===============================================
// HELPER FUNCTIONS
// ===============================================

string now_str() {
    auto now = chrono::system_clock::now();
    time_t t = chrono::system_clock::to_time_t(now);
    char buf[64];
    ctime_r(&t, buf);
    string s(buf);
    if (!s.empty() && s.back() == '\n') s.pop_back();
    return s;
}

// ENUMS
enum class ClientType { Regular, Premium };
string clientTypeToStr(ClientType t) { return t == ClientType::Premium ? "Premium" : "Regular"; }

enum class AccountType { Checking, Savings };
string accountTypeToStr(AccountType t) { return t == AccountType::Savings ? "Savings" : "Checking"; }

enum class AccountStatus { Active, Closed };
string accountStatusToStr(AccountStatus s) { return s == AccountStatus::Active ? "Active" : "Closed"; }

// ===============================================
// TRANSACTION
// ===============================================

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
        if (!ts.empty() && ts.back() == '\n') ts.pop_back();

        stringstream ss;
        ss << "Tx#" << id << " [" << ts << "] " << type
           << " amount=" << fixed << setprecision(2) << amount;
        if (fromAccount) ss << " from=" << fromAccount;
        if (toAccount) ss << " to=" << toAccount;
        if (!note.empty()) ss << " note=\"" << note << "\"";
        return ss.str();
    }
};

// ===============================================
// ACCOUNT
// ===============================================

struct Account {
    ll number;
    AccountType type;
    AccountStatus status;
    double balance;
    ll ownerClientId;
    vector<ll> transactionIds;

    Account() = default;
    Account(ll num, AccountType t, ll ownerId)
            : number(num), type(t), status(AccountStatus::Active),
              balance(0.0), ownerClientId(ownerId) {}
};

// ===============================================
// CLIENT (UPDATED FOR TASK 4)
// ===============================================

struct Client {
    ll id;
    string name;
    string email;
    string phone;
    ClientType ctype;

    Address address;
    Date birthdate;

    vector<ll> accounts;

    Client() = default;

    Client(ll id_, string name_, string email_, string phone_, ClientType t,
           const Address& addr, const Date& bd)
            : id(id_), name(move(name_)), email(move(email_)), phone(move(phone_)),
              ctype(t), address(addr), birthdate(bd) {}
};

// ===============================================
// BANK SYSTEM
// ===============================================

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

    // ---------------------------------------------------------
    // CLIENTS
    // ---------------------------------------------------------

    ll addClient(const string &name, const string &email, const string &phone,
                 ClientType t, const Address& addr, const Date& bd)
    {
        ll id = nextClientId++;
        clients.emplace(id, Client(id, name, email, phone, t, addr, bd));
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

    void listClients() const {
        if (clients.empty()) {
            cout << "No clients registered.\n";
            return;
        }
        cout << "Clients:\n";
        for (const auto &p : clients) {
            const Client &c = p.second;
            cout << "ID=" << c.id << " | " << c.name << " | " << c.email
                 << " | " << c.phone << " | Type=" << clientTypeToStr(c.ctype)
                 << " | Accounts=" << c.accounts.size() << "\n";
        }
    }

    bool editClient(ll id, const string &name, const string &email,
                    const string &phone, ClientType type,
                    const Address &addr, const Date &bd)
    {
        auto it = clients.find(id);
        if (it == clients.end()) {
            cout << "Client not found\n";
            return false;
        }

        Client &c = it->second;

        c.name = name;
        c.email = email;
        c.phone = phone;
        c.ctype = type;

        c.address = addr;
        c.birthdate = bd;

        cout << "Client updated\n";
        return true;
    }

    // ---------------------------------------------------------
    // ACCOUNTS
    // ---------------------------------------------------------

    ll openAccount(ll clientId, AccountType atype) {
        auto cit = clients.find(clientId);
        if (cit == clients.end()) {
            cout << "Client not found\n";
            return 0;
        }
        ll accNum = nextAccountNumber++;
        accounts.emplace(accNum, Account(accNum, atype, clientId));
        cit->second.accounts.push_back(accNum);
        cout << "Opened account " << accNum << "\n";
        return accNum;
    }

    bool closeAccount(ll accNum) {
        auto it = accounts.find(accNum);
        if (it == accounts.end()) {
            cout << "Account not found\n";
            return false;
        }
        if (it->second.balance != 0.0) {
            cout << "Account balance is not zero\n";
            return false;
        }
        it->second.status = AccountStatus::Closed;
        cout << "Account closed\n";
        return true;
    }

    Account* findAccount(ll accNum) {
        auto it = accounts.find(accNum);
        return it == accounts.end() ? nullptr : &it->second;
    }

    vector<Account*> getClientAccounts(ll clientId) {
        vector<Account*> res;
        auto cit = clients.find(clientId);
        if (cit == clients.end()) return res;
        for (ll accNum : cit->second.accounts) {
            auto ait = accounts.find(accNum);
            if (ait != accounts.end()) res.push_back(&ait->second);
        }
        return res;
    }

    void listAllAccounts() const {
        cout << "Accounts:\n";
        for (const auto &p : accounts) {
            const Account &a = p.second;
            cout << "Acc#" << a.number << " Owner=" << a.ownerClientId
                 << " Type=" << accountTypeToStr(a.type)
                 << " Status=" << accountStatusToStr(a.status)
                 << " Balance=" << fixed << setprecision(2) << a.balance << "\n";
        }
    }

    // ---------------------------------------------------------
    // TRANSACTIONS
    // ---------------------------------------------------------

    ll recordTransaction(const string &type, ll fromAcc, ll toAcc,
                         double amount, const string &note = "")
    {
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

    bool deposit(ll accNum, double amt, const string &note="") {
        if (amt <= 0) {
            cout << "Amount must be > 0\n";
            return false;
        }
        Account *acc = findAccount(accNum);
        if (!acc) { cout << "Account not found\n"; return false; }
        if (acc->status != AccountStatus::Active) {
            cout << "Account inactive\n"; return false;
        }
        acc->balance += amt;
        acc->transactionIds.push_back(recordTransaction("Deposit", 0, accNum, amt, note));
        cout << "Deposited\n";
        return true;
    }

    bool withdraw(ll accNum, double amt, const string &note="") {
        if (amt <= 0) {
            cout << "Amount must be > 0\n";
            return false;
        }
        Account *acc = findAccount(accNum);
        if (!acc) { cout << "Account not found\n"; return false; }
        if (acc->status != AccountStatus::Active) {
            cout << "Account inactive\n"; return false;
        }
        if (acc->balance < amt) {
            cout << "Insufficient funds\n"; return false;
        }
        acc->balance -= amt;
        acc->transactionIds.push_back(recordTransaction("Withdraw", accNum, 0, amt, note));
        cout << "Withdrawn\n";
        return true;
    }

    bool transfer(ll fromAcc, ll toAcc, double amt, const string &note="") {
        if (amt <= 0) {
            cout << "Amount must be > 0\n";
            return false;
        }
        Account *a = findAccount(fromAcc);
        Account *b = findAccount(toAcc);
        if (!a || !b) {
            cout << "One or both accounts not found\n"; return false;
        }
        if (a->balance < amt) {
            cout << "Insufficient funds\n"; return false;
        }
        a->balance -= amt;
        b->balance += amt;

        ll txid = recordTransaction("Transfer", fromAcc, toAcc, amt, note);
        a->transactionIds.push_back(txid);
        b->transactionIds.push_back(txid);

        cout << "Transferred\n";
        return true;
    }

    void listAllTransactions() const {
        for (auto &tx : transactions)
            cout << tx.toString() << "\n";
    }

    void showAccountTransactions(ll acc) const {
        auto it = accounts.find(acc);
        if (it == accounts.end()) {
            cout << "Account not found\n"; return;
        }
        if (it->second.transactionIds.empty()) {
            cout << "No transactions\n"; return;
        }
        for (ll id : it->second.transactionIds)
            cout << transactions[id - 1].toString() << "\n";
    }

    // ---------------------------------------------------------
    // REPORTS
    // ---------------------------------------------------------

    void printClientDetails(ll clientId) const {
        auto it = clients.find(clientId);
        if (it == clients.end()) {
            cout << "Client not found\n"; return;
        }
        const Client &c = it->second;

        cout << "\n--- CLIENT INFO ---\n";
        cout << "Name: " << c.name << "\n";
        cout << "Email: " << c.email << "\n";
        cout << "Phone: " << c.phone << "\n";
        cout << "Type: " << clientTypeToStr(c.ctype) << "\n";

        cout << "Address: " << c.address.street << ", " << c.address.city
             << ", " << c.address.postalCode << ", " << c.address.country << "\n";

        cout << "Birthdate: " << c.birthdate.day << "." << c.birthdate.month
             << "." << c.birthdate.year << "\n";

        cout << "Accounts:\n";
        for (ll acc : c.accounts) {
            auto a = accounts.find(acc);
            if (a != accounts.end()) {
                cout << "  Acc#" << a->second.number
                     << " Type=" << accountTypeToStr(a->second.type)
                     << " Balance=" << a->second.balance << "\n";
            }
        }
    }

    void bankOverview() const {
        cout << "Total clients: " << clients.size() << "\n";
        cout << "Total accounts: " << accounts.size() << "\n";
        double total = 0;
        for (auto &p : accounts) total += p.second.balance;
        cout << "Total balance: " << total << "\n";
    }
};

// ========================================================================
// MENU HELPERS
// ========================================================================

int menuChoice() {
    cout << "\n=== Menu ===\n";
    cout << "1 Add client\n2 Delete client\n3 Find client\n4 List clients\n5 Edit client\n";
    cout << "6 Open account\n7 Close account\n8 List client accounts\n9 Find account\n10 List all accounts\n";
    cout << "11 Deposit\n12 Withdraw\n13 Transfer\n14 Account transactions\n15 All transactions\n";
    cout << "16 Bank overview\n0 Exit\nChoice: ";
    int c;
    cin >> c;
    return c;
}

ClientType readClientTypeFromInt(int v) {
    return (v == 2 ? ClientType::Premium : ClientType::Regular);
}
AccountType readAccountTypeFromInt(int v) {
    return (v == 2 ? AccountType::Savings : AccountType::Checking);
}

// ========================================================================
// MAIN
// ========================================================================

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    Bank bank;

    // Preload some data
    Address a1 = {"Street 1", "Vilnius", "00001", "Lithuania"};
    Date d1 = {1, 1, 1990};

    Address a2 = {"Street 9", "Kaunas", "00002", "Lithuania"};
    Date d2 = {5, 8, 1985};

    ll c1 = bank.addClient("Alice", "alice@mail", "111", ClientType::Regular, a1, d1);
    ll c2 = bank.addClient("Bob", "bob@mail", "222", ClientType::Premium, a2, d2);

    ll acc1 = bank.openAccount(c1, AccountType::Checking);
    ll acc2 = bank.openAccount(c2, AccountType::Savings);

    bank.deposit(acc1, 500);
    bank.deposit(acc2, 2000);

    while (true) {
        int ch = menuChoice();
        if (ch == 0) break;

        switch (ch) {

            // ADD CLIENT
            case 1: {
                string name,email,phone;
                int t;

                Address addr;
                Date bd;

                cout << "Name: ";
                getline(cin >> ws, name);
                cout << "Email: ";
                getline(cin, email);
                cout << "Phone: ";
                getline(cin, phone);
                cout << "Type (1-Regular, 2-Premium): ";
                cin >> t;

                cout << "Street & house: ";
                getline(cin >> ws, addr.street);
                cout << "City: ";
                getline(cin, addr.city);
                cout << "Postal code: ";
                getline(cin, addr.postalCode);
                cout << "Country: ";
                getline(cin, addr.country);

                cout << "Birthdate (day month year): ";
                cin >> bd.day >> bd.month >> bd.year;

                bank.addClient(name, email, phone, readClientTypeFromInt(t), addr, bd);
                break;
            }

            case 2: {
                ll id;
                cout << "ID: ";
                cin >> id;
                bank.deleteClient(id);
                break;
            }

            case 3: {
                ll id;
                cout << "ID: ";
                cin >> id;
                bank.printClientDetails(id);
                break;
            }

            case 4:
                bank.listClients();
                break;

            case 5: {
                ll id; cout << "ID: "; cin >> id;

                string name,email,phone; int t;
                Address addr;
                Date bd;

                cout << "New name: ";
                getline(cin >> ws, name);
                cout << "New email: ";
                getline(cin, email);
                cout << "New phone: ";
                getline(cin, phone);
                cout << "Type (1-Regular, 2-Premium): ";
                cin >> t;

                cout << "Street & house: ";
                getline(cin >> ws, addr.street);
                cout << "City: ";
                getline(cin, addr.city);
                cout << "Postal code: ";
                getline(cin, addr.postalCode);
                cout << "Country: ";
                getline(cin, addr.country);

                cout << "Birthdate (day month year): ";
                cin >> bd.day >> bd.month >> bd.year;

                bank.editClient(id, name, email, phone, readClientTypeFromInt(t), addr, bd);
                break;
            }

            case 6: {
                ll cid;
                int t;
                cout << "Client ID: "; cin >> cid;
                cout << "Account type (1-Checking, 2-Savings): "; cin >> t;
                bank.openAccount(cid, readAccountTypeFromInt(t));
                break;
            }

            case 7: {
                ll acc;
                cout << "Account: ";
                cin >> acc;
                bank.closeAccount(acc);
                break;
            }

            case 8: {
                ll cid;
                cout << "Client ID: "; cin >> cid;
                auto v = bank.getClientAccounts(cid);
                for (auto a : v) {
                    cout << "Acc#" << a->number << " " << accountTypeToStr(a->type)
                         << " Bal=" << a->balance << "\n";
                }
                break;
            }

            case 9: {
                ll acc; cout << "Account: "; cin >> acc;
                if (auto a = bank.findAccount(acc)) {
                    cout << "Acc#" << a->number << " Owner=" << a->ownerClientId
                         << " Balance=" << a->balance << "\n";
                } else cout << "Not found\n";
                break;
            }

            case 10:
                bank.listAllAccounts();
                break;

            case 11: {
                ll acc; double amt;
                string note;
                cout << "Acc: "; cin >> acc;
                cout << "Amt: "; cin >> amt;
                cout << "Note: ";
                getline(cin >> ws, note);
                bank.deposit(acc, amt, note);
                break;
            }

            case 12: {
                ll acc; double amt;
                string note;
                cout << "Acc: "; cin >> acc;
                cout << "Amt: "; cin >> amt;
                cout << "Note: ";
                getline(cin >> ws, note);
                bank.withdraw(acc, amt, note);
                break;
            }

            case 13: {
                ll a,b; double amt;
                string note;
                cout << "From: "; cin >> a;
                cout << "To: "; cin >> b;
                cout << "Amt: "; cin >> amt;
                cout << "Note: ";
                getline(cin >> ws, note);
                bank.transfer(a,b,amt,note);
                break;
            }

            case 14: {
                ll acc; cout << "Acc: "; cin >> acc;
                bank.showAccountTransactions(acc);
                break;
            }

            case 15:
                bank.listAllTransactions();
                break;

            case 16:
                bank.bankOverview();
                break;

            default:
                cout << "Unknown\n";
        }
    }

    return 0;
}
