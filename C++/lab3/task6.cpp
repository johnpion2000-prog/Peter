#include <iostream>
#include <string>
using namespace std;

class BankAccount {
private:
    string accountNumber;
    string ownerName;
    double balance;
    static int totalAccounts;
    static double totalBankBalance;
    const double MIN_BALANCE = 10.0;

public:
    BankAccount(string accNum, string owner, double initialBalance) 
        : accountNumber(accNum), ownerName(owner), balance(initialBalance) {
        totalAccounts++;
        totalBankBalance += balance;
    }

    ~BankAccount() {
        totalAccounts--;
        totalBankBalance -= balance;
    }

    void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            totalBankBalance += amount;
        }
    }

    bool withdraw(double amount) {
        if (amount > 0 && (balance - amount) >= MIN_BALANCE) {
            balance -= amount;
            totalBankBalance -= amount;
            return true;
        }
        return false;
    }

    void displayAccountInfo() const {
        cout << "Account: " << accountNumber << endl;
        cout << "Owner: " << ownerName << endl;
        cout << "Balance: " << balance << endl;
    }

    static int getTotalAccounts() {
        return totalAccounts;
    }

    static double getTotalBankBalance() {
        return totalBankBalance;
    }

    static double getAverageBalance() {
        return totalAccounts > 0 ? totalBankBalance / totalAccounts : 0;
    }
};

int BankAccount::totalAccounts = 0;
double BankAccount::totalBankBalance = 0;

int main() {
    cout << "Initial state:" << endl;
    cout << "Total accounts: " << BankAccount::getTotalAccounts() << endl;
    cout << "Total balance: " << BankAccount::getTotalBankBalance() << endl;

    BankAccount account1("12345", "John Doe", 1000);
    BankAccount account2("67890", "Jane Smith", 500);

    cout << "\nAfter creating 2 accounts:" << endl;
    cout << "Total accounts: " << BankAccount::getTotalAccounts() << endl;
    cout << "Total balance: " << BankAccount::getTotalBankBalance() << endl;
    cout << "Average balance: " << BankAccount::getAverageBalance() << endl;

    cout << "\nAccount operations:" << endl;
    account1.deposit(200);
    account2.withdraw(100);

    cout << "After operations:" << endl;
    cout << "Total balance: " << BankAccount::getTotalBankBalance() << endl;

    {
        BankAccount account3("11111", "Bob Johnson", 300);
        cout << "\nWith 3 accounts:" << endl;
        cout << "Total accounts: " << BankAccount::getTotalAccounts() << endl;
        cout << "Total balance: " << BankAccount::getTotalBankBalance() << endl;
    }

    cout << "\nAfter account3 destroyed:" << endl;
    cout << "Total accounts: " << BankAccount::getTotalAccounts() << endl;
    cout << "Total balance: " << BankAccount::getTotalBankBalance() << endl;

    return 0;
}