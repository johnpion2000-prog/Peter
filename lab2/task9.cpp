#include <iostream>
using namespace std;

struct Account {
    int number;
    double balance;
};

void deposit(Account* acc, double amount) {
    acc->balance += amount;
    cout << "Deposited: $" << amount << endl;
}

void withdraw(Account& acc, double amount) {
    if (amount <= acc.balance) {
        acc.balance -= amount;
        cout << "Withdrawn: $" << amount << endl;
    } else {
        cout << "Error: Insufficient funds!" << endl;
    }
}

int main() {
    Account myAccount = {12345, 1000.0};
    
    cout << "Initial account:" << endl;
    cout << "Account number: " << myAccount.number << endl;
    cout << "Balance: $" << myAccount.balance << endl << endl;
    
    cout << "Using deposit function (pointer):" << endl;
    deposit(&myAccount, 500.0);
    cout << "Current balance: $" << myAccount.balance << endl << endl;
    
    cout << "Using withdraw function (reference):" << endl;
    withdraw(myAccount, 200.0);
    cout << "Current balance: $" << myAccount.balance << endl << endl;
    
    cout << "Trying to withdraw too much:" << endl;
    withdraw(myAccount, 2000.0);
    cout << "Current balance: $" << myAccount.balance << endl;
    
    return 0;
}