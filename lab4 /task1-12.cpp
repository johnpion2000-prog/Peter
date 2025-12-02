#include <iostream>
#include <string>
#include <vector>
#include <memory>
#include <ctime>
#include <iomanip>
#include <sstream>
#include <algorithm>
#include <random>
#include <limits>
#include <map>

// ============================================
// STRUCTURES
// ============================================

// 4.1. Structure "Address"
struct Address {
    std::string street;
    std::string city;
    std::string postalCode;
    std::string country;
    
    Address() : street(""), city(""), postalCode(""), country("") {}
    Address(const std::string& st, const std::string& ct, 
            const std::string& pc, const std::string& cn)
        : street(st), city(ct), postalCode(pc), country(cn) {}
    
    void display() const {
        std::cout << street << ", " << city << ", " 
                  << postalCode << ", " << country;
    }
    
    std::string toString() const {
        return street + ", " + city + ", " + postalCode + ", " + country;
    }
};

// 4.2. Structure "Date"
struct Date {
    int day;
    int month;
    int year;
    
    Date() : day(1), month(1), year(2000) {}
    Date(int d, int m, int y) : day(d), month(m), year(y) {}
    
    static Date getCurrentDate() {
        std::time_t now = std::time(nullptr);
        std::tm* localTime = std::localtime(&now);
        return Date(localTime->tm_mday, localTime->tm_mon + 1, localTime->tm_year + 1900);
    }
    
    std::string toString() const {
        std::ostringstream oss;
        oss << std::setw(2) << std::setfill('0') << day << "/"
            << std::setw(2) << std::setfill('0') << month << "/"
            << year;
        return oss.str();
    }
    
    void display() const {
        std::cout << toString();
    }
};

// ============================================
// ENUMS
// ============================================

enum class AccountType {
    SAVINGS,
    CHECKING
};

enum class TransactionType {
    DEPOSIT,
    WITHDRAWAL,
    TRANSFER
};

enum class CustomerType {
    REGULAR,
    PREMIUM
};

// ============================================
// CLASS DECLARATIONS
// ============================================

class Transaction;
class Account;
class Customer;

// ============================================
// CLASS: TRANSACTION
// ============================================

class Transaction {
private:
    std::string transactionID;
    std::string fromAccount;
    std::string toAccount;
    TransactionType type;
    double amount;
    Date date;
    std::string description;
    
    static int transactionCounter;  // Static counter
    
    std::string generateID() {
        static std::random_device rd;
        static std::mt19937 gen(rd());
        static std::uniform_int_distribution<> dis(1000, 9999);
        return "TXN" + std::to_string(++transactionCounter) + std::to_string(dis(gen));
    }
    
    std::string typeToString() const {
        switch(type) {
            case TransactionType::DEPOSIT: return "DEPOSIT";
            case TransactionType::WITHDRAWAL: return "WITHDRAWAL";
            case TransactionType::TRANSFER: return "TRANSFER";
            default: return "UNKNOWN";
        }
    }
    
public:
    // Constructors - FIXED: order matches declaration order
    Transaction() : transactionID(""), fromAccount(""), toAccount(""), 
                    type(TransactionType::DEPOSIT), amount(0.0), 
                    date(Date::getCurrentDate()), description("") {
        transactionID = generateID();
    }
    
    Transaction(const std::string& from, const std::string& to,
                TransactionType t, double amt, const std::string& desc = "")
        : fromAccount(from), toAccount(to), type(t), amount(amt), 
          date(Date::getCurrentDate()), description(desc) {
        transactionID = generateID();
    }
    
    // Getters
    std::string getTransactionID() const { return transactionID; }
    std::string getFromAccount() const { return fromAccount; }
    std::string getToAccount() const { return toAccount; }
    TransactionType getType() const { return type; }
    std::string getTypeString() const { return typeToString(); }
    double getAmount() const { return amount; }
    Date getDate() const { return date; }
    std::string getDescription() const { return description; }
    
    // Display methods
    void display() const {
        std::cout << "\n════════════════════════════════════════════\n";
        std::cout << "Transaction ID: " << transactionID << "\n";
        std::cout << "Type: " << typeToString() << "\n";
        std::cout << "Date: "; date.display(); std::cout << "\n";
        
        if(!fromAccount.empty())
            std::cout << "From Account: " << fromAccount << "\n";
        if(!toAccount.empty())
            std::cout << "To Account: " << toAccount << "\n";
        
        std::cout << "Amount: $" << std::fixed << std::setprecision(2) << amount << "\n";
        if(!description.empty())
            std::cout << "Description: " << description << "\n";
        std::cout << "════════════════════════════════════════════\n";
    }
    
    void displayShort() const {
        std::cout << std::left << std::setw(12) << transactionID
                  << std::setw(15) << typeToString()
                  << std::setw(12) << date.toString()
                  << "$" << std::right << std::setw(10) << std::fixed << std::setprecision(2) << amount;
        
        if(!description.empty())
            std::cout << "  " << description;
        std::cout << "\n";
    }
    
    // Static methods
    static int getTransactionCount() { return transactionCounter; }
    static void resetCounter() { transactionCounter = 0; }
};

// Initialize static member
int Transaction::transactionCounter = 0;

// ============================================
// CLASS: ACCOUNT
// ============================================

class Account {
private:
    std::string accountNumber;
    std::string customerID;
    AccountType type;
    double balance;
    Date openingDate;
    bool isActive;
    std::vector<Transaction> transactions;
    
    static int accountCounter;  // Static counter
    
    std::string generateAccountNumber() {
        std::string prefix = (type == AccountType::SAVINGS) ? "SAV" : "CHK";
        // FIXED: Avoid unsequenced modification
        int currentCounter = ++accountCounter;
        std::string counterStr = std::to_string(currentCounter);
        std::string paddedCounter = std::string(7 - counterStr.length(), '0') + counterStr;
        return prefix + paddedCounter;
    }
    
    std::string typeToString() const {
        return (type == AccountType::SAVINGS) ? "Savings" : "Checking";
    }
    
public:
    // Constructors
    Account() : accountNumber(""), customerID(""), type(AccountType::SAVINGS), 
                balance(0.0), openingDate(Date::getCurrentDate()), isActive(true) {
        accountNumber = generateAccountNumber();
    }
    
    Account(const std::string& custID, AccountType accType, double initialBalance = 0.0)
        : customerID(custID), type(accType), balance(initialBalance),
          openingDate(Date::getCurrentDate()), isActive(true) {
        accountNumber = generateAccountNumber();
        
        // Record initial deposit if any
        if(initialBalance > 0) {
            Transaction initialDeposit("", accountNumber, TransactionType::DEPOSIT, 
                                      initialBalance, "Initial deposit");
            transactions.push_back(initialDeposit);
        }
    }
    
    // Getters
    std::string getAccountNumber() const { return accountNumber; }
    std::string getCustomerID() const { return customerID; }
    AccountType getAccountType() const { return type; }
    std::string getAccountTypeString() const { return typeToString(); }
    double getBalance() const { return balance; }
    Date getOpeningDate() const { return openingDate; }
    bool getIsActive() const { return isActive; }
    const std::vector<Transaction>& getTransactions() const { return transactions; }
    
    // Account operations
    bool deposit(double amount, const std::string& description = "") {
        if(amount <= 0 || !isActive) {
            std::cout << "Error: Invalid deposit amount or account is inactive!\n";
            return false;
        }
        
        balance += amount;
        Transaction deposit("", accountNumber, TransactionType::DEPOSIT, amount, description);
        transactions.push_back(deposit);
        
        std::cout << "Successfully deposited $" << amount << "\n";
        return true;
    }
    
    bool withdraw(double amount, const std::string& description = "") {
        if(amount <= 0 || !isActive) {
            std::cout << "Error: Invalid withdrawal amount or account is inactive!\n";
            return false;
        }
        
        if(amount > balance) {
            std::cout << "Error: Insufficient funds! Available: $" << balance << "\n";
            return false;
        }
        
        balance -= amount;
        Transaction withdrawal(accountNumber, "", TransactionType::WITHDRAWAL, amount, description);
        transactions.push_back(withdrawal);
        
        std::cout << "Successfully withdrew $" << amount << "\n";
        return true;
    }
    
    bool transfer(Account& targetAccount, double amount, const std::string& description = "") {
        if(amount <= 0 || !isActive || !targetAccount.isActive) {
            std::cout << "Error: Invalid transfer amount or account is inactive!\n";
            return false;
        }
        
        if(amount > balance) {
            std::cout << "Error: Insufficient funds for transfer!\n";
            return false;
        }
        
        if(accountNumber == targetAccount.accountNumber) {
            std::cout << "Error: Cannot transfer to the same account!\n";
            return false;
        }
        
        // Withdraw from this account
        balance -= amount;
        Transaction withdrawTrans(accountNumber, "", TransactionType::WITHDRAWAL, 
                                 amount, "Transfer to " + targetAccount.accountNumber);
        transactions.push_back(withdrawTrans);
        
        // Deposit to target account
        targetAccount.balance += amount;
        Transaction depositTrans("", targetAccount.accountNumber, TransactionType::DEPOSIT,
                                amount, "Transfer from " + accountNumber);
        targetAccount.transactions.push_back(depositTrans);
        
        // Create transfer transaction record
        Transaction transferTrans(accountNumber, targetAccount.accountNumber, 
                                 TransactionType::TRANSFER, amount, description);
        transactions.push_back(transferTrans);
        targetAccount.transactions.push_back(transferTrans);
        
        std::cout << "Successfully transferred $" << amount 
                  << " to account " << targetAccount.accountNumber << "\n";
        return true;
    }
    
    // Account management
    void activate() { isActive = true; }
    void deactivate() { isActive = false; }
    bool closeAccount() {
        if(balance != 0.0) {
            std::cout << "Error: Cannot close account with non-zero balance!\n";
            return false;
        }
        isActive = false;
        return true;
    }
    
    // Display methods
    void displayInfo() const {
        std::cout << "\n════════════════════════════════════════════\n";
        std::cout << "ACCOUNT INFORMATION\n";
        std::cout << "════════════════════════════════════════════\n";
        std::cout << "Account Number: " << accountNumber << "\n";
        std::cout << "Customer ID: " << customerID << "\n";
        std::cout << "Type: " << typeToString() << "\n";
        std::cout << "Balance: $" << std::fixed << std::setprecision(2) << balance << "\n";
        std::cout << "Opening Date: "; openingDate.display(); std::cout << "\n";
        std::cout << "Status: " << (isActive ? "Active" : "Closed") << "\n";
        std::cout << "Number of Transactions: " << transactions.size() << "\n";
        std::cout << "════════════════════════════════════════════\n";
    }
    
    void displayTransactionHistory() const {
        if(transactions.empty()) {
            std::cout << "No transactions found.\n";
            return;
        }
        
        std::cout << "\n══════════════════════════════════════════════════════════════════════\n";
        std::cout << "TRANSACTION HISTORY for Account: " << accountNumber << "\n";
        std::cout << "══════════════════════════════════════════════════════════════════════\n";
        std::cout << std::left << std::setw(12) << "ID"
                  << std::setw(15) << "Type"
                  << std::setw(12) << "Date"
                  << std::setw(12) << "Amount"
                  << "Description\n";
        std::cout << "──────────────────────────────────────────────────────────────────────────\n";
        
        for(const auto& trans : transactions) {
            trans.displayShort();
        }
        std::cout << "══════════════════════════════════════════════════════════════════════\n";
    }
    
    // Static methods
    static int getAccountCount() { return accountCounter; }
    static void resetCounter() { accountCounter = 0; }
    
    // Validation
    static bool isValidAccountNumber(const std::string& accNum) {
        if(accNum.length() != 10) return false;
        if(accNum.substr(0, 3) != "SAV" && accNum.substr(0, 3) != "CHK") return false;
        
        for(size_t i = 3; i < accNum.length(); i++) {
            if(!isdigit(accNum[i])) return false;
        }
        
        return true;
    }
};

// Initialize static member
int Account::accountCounter = 0;

// ============================================
// BASE CLASS: CUSTOMER
// ============================================

class Customer {
protected:
    std::string customerID;
    std::string firstName;
    std::string lastName;
    Address address;
    Date registrationDate;
    CustomerType type;
    
    static int customerCounter;  // Static counter
    
    std::string generateCustomerID() {
        // FIXED: Avoid unsequenced modification
        int currentCounter = ++customerCounter;
        std::string counterStr = std::to_string(currentCounter);
        std::string paddedCounter = std::string(6 - counterStr.length(), '0') + counterStr;
        return "CUST" + paddedCounter;
    }
    
public:
    // Constructors - FIXED: order matches declaration order
    Customer() : customerID(""), firstName(""), lastName(""), 
                 address(Address()), registrationDate(Date::getCurrentDate()), 
                 type(CustomerType::REGULAR) {
        customerID = generateCustomerID();
    }
    
    Customer(const std::string& fname, const std::string& lname, 
             const Address& addr, CustomerType custType = CustomerType::REGULAR)
        : firstName(fname), lastName(lname), address(addr), 
          registrationDate(Date::getCurrentDate()), type(custType) {
        customerID = generateCustomerID();
    }
    
    // Virtual destructor
    virtual ~Customer() {}
    
    // Getters
    std::string getCustomerID() const { return customerID; }
    std::string getFirstName() const { return firstName; }
    std::string getLastName() const { return lastName; }
    std::string getFullName() const { return firstName + " " + lastName; }
    Address getAddress() const { return address; }
    Date getRegistrationDate() const { return registrationDate; }
    CustomerType getCustomerType() const { return type; }
    std::string getCustomerTypeString() const {
        return (type == CustomerType::REGULAR) ? "Regular" : "Premium";
    }
    
    // Setters
    void setFirstName(const std::string& fname) { firstName = fname; }
    void setLastName(const std::string& lname) { lastName = lname; }
    void setAddress(const Address& addr) { address = addr; }
    
    // Virtual methods (polymorphism)
    virtual void displayInfo() const {
        std::cout << "\n════════════════════════════════════════════\n";
        std::cout << "CUSTOMER INFORMATION\n";
        std::cout << "════════════════════════════════════════════\n";
        std::cout << "Customer ID: " << customerID << "\n";
        std::cout << "Name: " << getFullName() << "\n";
        std::cout << "Type: " << getCustomerTypeString() << "\n";
        std::cout << "Address: "; address.display(); std::cout << "\n";
        std::cout << "Registration Date: "; registrationDate.display(); std::cout << "\n";
        std::cout << "════════════════════════════════════════════\n";
    }
    
    virtual void displayShort() const {
        std::cout << std::left << std::setw(10) << customerID
                  << std::setw(20) << getFullName()
                  << std::setw(15) << getCustomerTypeString()
                  << std::setw(12) << registrationDate.toString() << "\n";
    }
    
    // Static methods
    static int getCustomerCount() { return customerCounter; }
    static void resetCounter() { customerCounter = 0; }
    
    // Validation
    static bool isValidCustomerID(const std::string& custID) {
        if(custID.length() != 10) return false;
        if(custID.substr(0, 4) != "CUST") return false;
        
        for(size_t i = 4; i < custID.length(); i++) {
            if(!isdigit(custID[i])) return false;
        }
        
        return true;
    }
};

// Initialize static member
int Customer::customerCounter = 0;

// ============================================
// DERIVED CLASS: PREMIUM CUSTOMER
// ============================================

class PremiumCustomer : public Customer {
private:
    int premiumLevel;
    double discountPercentage;
    
public:
    // Constructors
    PremiumCustomer() : Customer(), premiumLevel(1), discountPercentage(10.0) {
        type = CustomerType::PREMIUM;
    }
    
    PremiumCustomer(const std::string& fname, const std::string& lname, 
                   const Address& addr, int level = 1, double discount = 10.0)
        : Customer(fname, lname, addr, CustomerType::PREMIUM),
          premiumLevel(level), discountPercentage(discount) {}
    
    // Getters for additional attributes
    int getPremiumLevel() const { return premiumLevel; }
    double getDiscountPercentage() const { return discountPercentage; }
    
    // Setters
    void setPremiumLevel(int level) { 
        if(level >= 1 && level <= 3) premiumLevel = level; 
    }
    
    void setDiscountPercentage(double discount) { 
        if(discount >= 0 && discount <= 50) discountPercentage = discount; 
    }
    
    // Override virtual methods (polymorphism)
    void displayInfo() const override {
        std::cout << "\n════════════════════════════════════════════\n";
        std::cout << "CUSTOMER INFORMATION\n";
        std::cout << "════════════════════════════════════════════\n";
        std::cout << "Customer ID: " << customerID << "\n";
        std::cout << "Name: " << getFullName() << "\n";
        std::cout << "Type: " << getCustomerTypeString() << "\n";
        std::cout << "Address: "; address.display(); std::cout << "\n";
        std::cout << "Registration Date: "; registrationDate.display(); std::cout << "\n";
        std::cout << "Premium Level: " << premiumLevel << "\n";
        std::cout << "Discount: " << discountPercentage << "%\n";
        std::cout << "════════════════════════════════════════════\n";
    }
    
    void displayShort() const override {
        Customer::displayShort();
    }
    
    // Premium-specific methods
    double calculateDiscountedFee(double originalFee) const {
        return originalFee * (1 - discountPercentage / 100.0);
    }
    
    std::string getPremiumBenefits() const {
        switch(premiumLevel) {
            case 1: return "Priority Support, Basic Benefits";
            case 2: return "Priority Support, Enhanced Benefits, Fee Waivers";
            case 3: return "Dedicated Manager, All Benefits, Maximum Discounts";
            default: return "Standard Benefits";
        }
    }
};

// ============================================
// CLASS: BANK (MANAGER)
// ============================================

class Bank {
private:
    std::string bankName;
    std::vector<std::shared_ptr<Customer>> customers;
    std::vector<std::shared_ptr<Account>> accounts;
    std::vector<Transaction> allTransactions;
    
    // Private helper methods (encapsulation)
    std::shared_ptr<Customer> findCustomerByID(const std::string& customerID) {
        for(const auto& customer : customers) {
            if(customer->getCustomerID() == customerID) {
                return customer;
            }
        }
        return nullptr;
    }
    
    std::shared_ptr<Account> findAccountByNumber(const std::string& accountNumber) {
        for(const auto& account : accounts) {
            if(account->getAccountNumber() == accountNumber) {
                return account;
            }
        }
        return nullptr;
    }
    
    bool customerHasActiveAccounts(const std::string& customerID) {
        for(const auto& account : accounts) {
            if(account->getCustomerID() == customerID && account->getIsActive()) {
                return true;
            }
        }
        return false;
    }
    
public:
    Bank(const std::string& name) : bankName(name) {
        std::cout << "=== " << bankName << " Banking System Initialized ===\n";
    }
    
    ~Bank() {
        std::cout << "=== " << bankName << " Banking System Shutdown ===\n";
    }
    
    // ============================================
    // CUSTOMER MANAGEMENT
    // ============================================
    
    std::shared_ptr<Customer> addCustomer(const std::string& firstName, const std::string& lastName,
                                         const Address& address, CustomerType type = CustomerType::REGULAR) {
        std::shared_ptr<Customer> newCustomer;
        
        if(type == CustomerType::PREMIUM) {
            newCustomer = std::make_shared<PremiumCustomer>(firstName, lastName, address);
        } else {
            newCustomer = std::make_shared<Customer>(firstName, lastName, address);
        }
        
        customers.push_back(newCustomer);
        std::cout << "Customer added successfully! ID: " << newCustomer->getCustomerID() << "\n";
        return newCustomer;
    }
    
    bool removeCustomer(const std::string& customerID) {
        // Check if customer exists
        auto customer = findCustomerByID(customerID);
        if(!customer) {
            std::cout << "Error: Customer not found!\n";
            return false;
        }
        
        // Check if customer has active accounts
        if(customerHasActiveAccounts(customerID)) {
            std::cout << "Error: Cannot delete customer with active accounts!\n";
            return false;
        }
        
        // Remove customer
        auto it = std::remove_if(customers.begin(), customers.end(),
            [&](const std::shared_ptr<Customer>& cust) {
                return cust->getCustomerID() == customerID;
            });
        
        if(it != customers.end()) {
            customers.erase(it, customers.end());
            std::cout << "Customer removed successfully!\n";
            return true;
        }
        
        return false;
    }
    
    std::shared_ptr<Customer> getCustomer(const std::string& customerID) {
        return findCustomerByID(customerID);
    }
    
    void displayAllCustomers() const {
        if(customers.empty()) {
            std::cout << "No customers registered.\n";
            return;
        }
        
        std::cout << "\n══════════════════════════════════════════════════════════════════════\n";
        std::cout << "                         ALL CUSTOMERS\n";
        std::cout << "══════════════════════════════════════════════════════════════════════\n";
        std::cout << std::left << std::setw(10) << "ID"
                  << std::setw(20) << "Name"
                  << std::setw(15) << "Type"
                  << std::setw(12) << "Reg. Date" << "\n";
        std::cout << "──────────────────────────────────────────────────────────────────────────\n";
        
        for(const auto& customer : customers) {
            customer->displayShort();
        }
        std::cout << "══════════════════════════════════════════════════════════════════════\n";
        std::cout << "Total Customers: " << customers.size() << "\n";
    }
    
    // ============================================
    // ACCOUNT MANAGEMENT
    // ============================================
    
    std::shared_ptr<Account> createAccount(const std::string& customerID, 
                                          AccountType accountType, 
                                          double initialDeposit = 0.0) {
        // Check if customer exists
        auto customer = findCustomerByID(customerID);
        if(!customer) {
            std::cout << "Error: Customer not found!\n";
            return nullptr;
        }
        
        // Validate initial deposit
        if(initialDeposit < 0) {
            std::cout << "Error: Initial deposit cannot be negative!\n";
            return nullptr;
        }
        
        // Create account
        auto newAccount = std::make_shared<Account>(customerID, accountType, initialDeposit);
        accounts.push_back(newAccount);
        
        std::cout << "Account created successfully! Number: " 
                  << newAccount->getAccountNumber() << "\n";
        return newAccount;
    }
    
    bool closeAccount(const std::string& accountNumber) {
        auto account = findAccountByNumber(accountNumber);
        if(!account) {
            std::cout << "Error: Account not found!\n";
            return false;
        }
        
        if(account->closeAccount()) {
            std::cout << "Account closed successfully!\n";
            return true;
        }
        
        return false;
    }
    
    std::shared_ptr<Account> getAccount(const std::string& accountNumber) {
        return findAccountByNumber(accountNumber);
    }
    
    void displayAllAccounts() const {
        if(accounts.empty()) {
            std::cout << "No accounts created.\n";
            return;
        }
        
        std::cout << "\n══════════════════════════════════════════════════════════════════════\n";
        std::cout << "                          ALL ACCOUNTS\n";
        std::cout << "══════════════════════════════════════════════════════════════════════\n";
        std::cout << std::left << std::setw(12) << "Account No"
                  << std::setw(12) << "Customer ID"
                  << std::setw(12) << "Type"
                  << std::setw(12) << "Balance"
                  << std::setw(12) << "Status" << "\n";
        std::cout << "──────────────────────────────────────────────────────────────────────────\n";
        
        for(const auto& account : accounts) {
            std::cout << std::left << std::setw(12) << account->getAccountNumber()
                      << std::setw(12) << account->getCustomerID()
                      << std::setw(12) << account->getAccountTypeString()
                      << "$" << std::right << std::setw(11) << std::fixed << std::setprecision(2) << account->getBalance()
                      << std::left << "  " << std::setw(10) << (account->getIsActive() ? "Active" : "Closed") << "\n";
        }
        std::cout << "══════════════════════════════════════════════════════════════════════\n";
        std::cout << "Total Accounts: " << accounts.size() << "\n";
        std::cout << "Active Accounts: " << std::count_if(accounts.begin(), accounts.end(),
            [](const std::shared_ptr<Account>& acc) { return acc->getIsActive(); }) << "\n";
    }
    
    void displayCustomerAccounts(const std::string& customerID) const {
        bool found = false;
        
        std::cout << "\n══════════════════════════════════════════════════════════════════════\n";
        std::cout << "                    ACCOUNTS FOR CUSTOMER: " << customerID << "\n";
        std::cout << "══════════════════════════════════════════════════════════════════════\n";
        
        for(const auto& account : accounts) {
            if(account->getCustomerID() == customerID) {
                account->displayInfo();
                found = true;
            }
        }
        
        if(!found) {
            std::cout << "No accounts found for this customer.\n";
        }
    }
    
    // ============================================
    // BANKING OPERATIONS
    // ============================================
    
    bool deposit(const std::string& accountNumber, double amount, const std::string& description = "") {
        auto account = findAccountByNumber(accountNumber);
        if(!account) {
            std::cout << "Error: Account not found!\n";
            return false;
        }
        
        return account->deposit(amount, description);
    }
    
    bool withdraw(const std::string& accountNumber, double amount, const std::string& description = "") {
        auto account = findAccountByNumber(accountNumber);
        if(!account) {
            std::cout << "Error: Account not found!\n";
            return false;
        }
        
        return account->withdraw(amount, description);
    }
    
    bool transfer(const std::string& fromAccount, const std::string& toAccount, 
                  double amount, const std::string& description = "") {
        auto source = findAccountByNumber(fromAccount);
        auto target = findAccountByNumber(toAccount);
        
        if(!source || !target) {
            std::cout << "Error: One or both accounts not found!\n";
            return false;
        }
        
        if(source->getCustomerID() == target->getCustomerID()) {
            std::cout << "Transferring between accounts of the same customer...\n";
        }
        
        return source->transfer(*target, amount, description);
    }
    
    // ============================================
    // REPORTS AND ANALYTICS
    // ============================================
    
    void displayBankSummary() const {
        std::cout << "\n════════════════════════════════════════════\n";
        std::cout << "           BANK SUMMARY\n";
        std::cout << "════════════════════════════════════════════\n";
        std::cout << "Bank Name: " << bankName << "\n";
        std::cout << "Total Customers: " << customers.size() << "\n";
        std::cout << "Total Accounts: " << accounts.size() << "\n";
        
        // Calculate statistics
        int activeAccounts = 0;
        int savingsAccounts = 0;
        int checkingAccounts = 0;
        double totalBalance = 0.0;
        int premiumCustomers = 0;
        
        for(const auto& account : accounts) {
            if(account->getIsActive()) activeAccounts++;
            totalBalance += account->getBalance();
            
            if(account->getAccountType() == AccountType::SAVINGS) savingsAccounts++;
            else checkingAccounts++;
        }
        
        for(const auto& customer : customers) {
            if(customer->getCustomerType() == CustomerType::PREMIUM) premiumCustomers++;
        }
        
        std::cout << "Active Accounts: " << activeAccounts << "\n";
        std::cout << "Total Balance: $" << std::fixed << std::setprecision(2) << totalBalance << "\n";
        std::cout << "Savings Accounts: " << savingsAccounts << "\n";
        std::cout << "Checking Accounts: " << checkingAccounts << "\n";
        std::cout << "Premium Customers: " << premiumCustomers << "\n";
        // FIXED: Cast to correct type to avoid sign conversion warning
        std::cout << "Regular Customers: " << static_cast<int>(customers.size()) - premiumCustomers << "\n";
        std::cout << "════════════════════════════════════════════\n";
    }
    
    void displayTransactionReport() const {
        // Collect all transactions from all accounts
        std::vector<Transaction> allTrans;
        
        for(const auto& account : accounts) {
            const auto& trans = account->getTransactions();
            allTrans.insert(allTrans.end(), trans.begin(), trans.end());
        }
        
        if(allTrans.empty()) {
            std::cout << "No transactions found.\n";
            return;
        }
        
        // Sort by date (newest first)
        std::sort(allTrans.begin(), allTrans.end(),
            [](const Transaction& a, const Transaction& b) {
                // Simple date comparison
                if (a.getDate().year != b.getDate().year)
                    return a.getDate().year > b.getDate().year;
                if (a.getDate().month != b.getDate().month)
                    return a.getDate().month > b.getDate().month;
                return a.getDate().day > b.getDate().day;
            });
        
        std::cout << "\n══════════════════════════════════════════════════════════════════════\n";
        std::cout << "                    TRANSACTION REPORT\n";
        std::cout << "══════════════════════════════════════════════════════════════════════\n";
        std::cout << std::left << std::setw(12) << "ID"
                  << std::setw(15) << "Type"
                  << std::setw(12) << "Date"
                  << std::setw(20) << "Accounts"
                  << std::setw(12) << "Amount" << "\n";
        std::cout << "──────────────────────────────────────────────────────────────────────────\n";
        
        // Display recent transactions (last 20)
        // FIXED: Cast to correct type to avoid sign conversion warning
        size_t count = std::min(static_cast<size_t>(20), allTrans.size());
        for(size_t i = 0; i < count; i++) {
            const auto& trans = allTrans[i];
            std::string accountsInfo = trans.getFromAccount();
            if(!trans.getToAccount().empty()) {
                if(!accountsInfo.empty()) accountsInfo += " → ";
                accountsInfo += trans.getToAccount();
            }
            
            // FIXED: Use getTypeString() instead of trying to output enum directly
            std::string typeStr = trans.getTypeString();
            
            std::cout << std::left << std::setw(12) << trans.getTransactionID()
                      << std::setw(15) << typeStr
                      << std::setw(12) << trans.getDate().toString()
                      << std::setw(20) << accountsInfo
                      << "$" << std::right << std::setw(11) << std::fixed << std::setprecision(2) << trans.getAmount() << "\n";
        }
        std::cout << "══════════════════════════════════════════════════════════════════════\n";
        std::cout << "Total Transactions: " << allTrans.size() << "\n";
    }
    
    void displayStatistics() const {
        std::cout << "\n════════════════════════════════════════════\n";
        std::cout << "           BANK STATISTICS\n";
        std::cout << "════════════════════════════════════════════\n";
        std::cout << "Customers Created: " << Customer::getCustomerCount() << "\n";
        std::cout << "Accounts Created: " << Account::getAccountCount() << "\n";
        std::cout << "Transactions Processed: " << Transaction::getTransactionCount() << "\n";
        std::cout << "════════════════════════════════════════════\n";
    }
    
    // ============================================
    // UTILITY METHODS
    // ============================================
    
    void generateSampleData() {
        std::cout << "\n--- Generating Sample Data ---\n";
        
        // Reset counters
        Customer::resetCounter();
        Account::resetCounter();
        Transaction::resetCounter();
        
        customers.clear();
        accounts.clear();
        
        // Create addresses
        Address addr1("123 Main St", "New York", "10001", "USA");
        Address addr2("456 Oak Ave", "Boston", "02115", "USA");
        Address addr3("789 Pine Rd", "Chicago", "60601", "USA");
        Address addr4("321 Elm St", "Los Angeles", "90001", "USA");
        
        // Create customers (2 regular, 2 premium)
        auto cust1 = addCustomer("John", "Doe", addr1, CustomerType::REGULAR);
        auto cust2 = addCustomer("Jane", "Smith", addr2, CustomerType::PREMIUM);
        auto cust3 = addCustomer("Bob", "Johnson", addr3, CustomerType::REGULAR);
        auto cust4 = addCustomer("Alice", "Williams", addr4, CustomerType::PREMIUM);
        
        // Create accounts
        createAccount(cust1->getCustomerID(), AccountType::SAVINGS, 1000.0);
        createAccount(cust1->getCustomerID(), AccountType::CHECKING, 500.0);
        createAccount(cust2->getCustomerID(), AccountType::SAVINGS, 5000.0);
        createAccount(cust3->getCustomerID(), AccountType::SAVINGS, 250.0);
        createAccount(cust4->getCustomerID(), AccountType::CHECKING, 1500.0);
        createAccount(cust4->getCustomerID(), AccountType::SAVINGS, 3000.0);
        
        // Perform some transactions
        if(accounts.size() >= 3) {
            auto account1 = accounts[0];
            auto account2 = accounts[1];
            auto account3 = accounts[2];
            
            account1->deposit(200.0, "Salary");
            account1->withdraw(100.0, "Grocery shopping");
            account1->transfer(*account2, 300.0, "Transfer to checking");
            account2->withdraw(50.0, "ATM withdrawal");
            account3->deposit(1000.0, "Bonus");
        }
        
        std::cout << "Sample data generated successfully!\n";
    }
};

// ============================================
// USER INTERFACE FUNCTIONS
// ============================================

void displayMainMenu() {
    std::cout << "\n════════════════════════════════════════════\n";
    std::cout << "       BANKING SYSTEM v2.0 - MAIN MENU\n";
    std::cout << "════════════════════════════════════════════\n";
    std::cout << "1. Customer Management\n";
    std::cout << "2. Account Management\n";
    std::cout << "3. Banking Operations\n";
    std::cout << "4. Reports and Analytics\n";
    std::cout << "5. Generate Sample Data\n";
    std::cout << "6. Display System Statistics\n";
    std::cout << "0. Exit\n";
    std::cout << "════════════════════════════════════════════\n";
    std::cout << "Enter your choice: ";
}

void handleCustomerMenu(Bank& bank) {
    int choice;
    do {
        std::cout << "\n════════════════════════════════════════════\n";
        std::cout << "           CUSTOMER MANAGEMENT\n";
        std::cout << "════════════════════════════════════════════\n";
        std::cout << "1. Add New Customer\n";
        std::cout << "2. View Customer Details\n";
        std::cout << "3. Edit Customer Information\n";
        std::cout << "4. Remove Customer\n";
        std::cout << "5. View All Customers\n";
        std::cout << "0. Back to Main Menu\n";
        std::cout << "════════════════════════════════════════════\n";
        std::cout << "Enter your choice: ";
        std::cin >> choice;
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        
        switch(choice) {
            case 1: {
                std::string fname, lname, street, city, postal, country;
                int customerType;
                
                std::cout << "\n--- Add New Customer ---\n";
                std::cout << "First Name: ";
                std::getline(std::cin, fname);
                std::cout << "Last Name: ";
                std::getline(std::cin, lname);
                
                std::cout << "Address:\n";
                std::cout << "  Street: ";
                std::getline(std::cin, street);
                std::cout << "  City: ";
                std::getline(std::cin, city);
                std::cout << "  Postal Code: ";
                std::getline(std::cin, postal);
                std::cout << "  Country: ";
                std::getline(std::cin, country);
                
                Address addr(street, city, postal, country);
                
                std::cout << "Customer Type (1-Regular, 2-Premium): ";
                std::cin >> customerType;
                std::cin.ignore();
                
                CustomerType type = (customerType == 2) ? CustomerType::PREMIUM : CustomerType::REGULAR;
                
                auto customer = bank.addCustomer(fname, lname, addr, type);
                if(customer) {
                    std::cout << "\nCustomer created successfully!\n";
                    customer->displayInfo();
                }
                break;
            }
            
            case 2: {
                std::string custID;
                std::cout << "\n--- View Customer Details ---\n";
                std::cout << "Enter Customer ID: ";
                std::getline(std::cin, custID);
                
                auto customer = bank.getCustomer(custID);
                if(customer) {
                    customer->displayInfo();
                } else {
                    std::cout << "Customer not found!\n";
                }
                break;
            }
            
            case 3: {
                std::string custID;
                std::cout << "\n--- Edit Customer Information ---\n";
                std::cout << "Enter Customer ID: ";
                std::getline(std::cin, custID);
                
                auto customer = bank.getCustomer(custID);
                if(customer) {
                    std::string fname, lname, street, city, postal, country;
                    
                    std::cout << "Leave blank to keep current value.\n";
                    std::cout << "New First Name [" << customer->getFirstName() << "]: ";
                    std::getline(std::cin, fname);
                    if(!fname.empty()) customer->setFirstName(fname);
                    
                    std::cout << "New Last Name [" << customer->getLastName() << "]: ";
                    std::getline(std::cin, lname);
                    if(!lname.empty()) customer->setLastName(lname);
                    
                    std::cout << "New Address:\n";
                    Address currentAddr = customer->getAddress();
                    std::cout << "  Street [" << currentAddr.street << "]: ";
                    std::getline(std::cin, street);
                    if(!street.empty()) currentAddr.street = street;
                    
                    std::cout << "  City [" << currentAddr.city << "]: ";
                    std::getline(std::cin, city);
                    if(!city.empty()) currentAddr.city = city;
                    
                    std::cout << "  Postal Code [" << currentAddr.postalCode << "]: ";
                    std::getline(std::cin, postal);
                    if(!postal.empty()) currentAddr.postalCode = postal;
                    
                    std::cout << "  Country [" << currentAddr.country << "]: ";
                    std::getline(std::cin, country);
                    if(!country.empty()) currentAddr.country = country;
                    
                    customer->setAddress(currentAddr);
                    std::cout << "\nCustomer information updated!\n";
                    customer->displayInfo();
                } else {
                    std::cout << "Customer not found!\n";
                }
                break;
            }
            
            case 4: {
                std::string custID;
                std::cout << "\n--- Remove Customer ---\n";
                std::cout << "Enter Customer ID: ";
                std::getline(std::cin, custID);
                
                if(bank.removeCustomer(custID)) {
                    std::cout << "Customer removed successfully!\n";
                }
                break;
            }
            
            case 5:
                bank.displayAllCustomers();
                break;
                
            case 0:
                std::cout << "Returning to main menu...\n";
                break;
                
            default:
                std::cout << "Invalid choice!\n";
        }
        
        if(choice != 0) {
            std::cout << "\nPress Enter to continue...";
            std::cin.get();
        }
    } while(choice != 0);
}

void handleAccountMenu(Bank& bank) {
    int choice;
    do {
        std::cout << "\n════════════════════════════════════════════\n";
        std::cout << "            ACCOUNT MANAGEMENT\n";
        std::cout << "════════════════════════════════════════════\n";
        std::cout << "1. Create New Account\n";
        std::cout << "2. View Account Details\n";
        std::cout << "3. View Account Transactions\n";
        std::cout << "4. Close Account\n";
        std::cout << "5. View All Accounts\n";
        std::cout << "6. View Customer Accounts\n";
        std::cout << "0. Back to Main Menu\n";
        std::cout << "════════════════════════════════════════════\n";
        std::cout << "Enter your choice: ";
        std::cin >> choice;
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        
        switch(choice) {
            case 1: {
                std::string custID;
                int accType;
                double initialDeposit;
                
                std::cout << "\n--- Create New Account ---\n";
                std::cout << "Enter Customer ID: ";
                std::getline(std::cin, custID);
                
                std::cout << "Account Type (1-Savings, 2-Checking): ";
                std::cin >> accType;
                std::cout << "Initial Deposit: $";
                std::cin >> initialDeposit;
                std::cin.ignore();
                
                AccountType type = (accType == 1) ? AccountType::SAVINGS : AccountType::CHECKING;
                
                auto account = bank.createAccount(custID, type, initialDeposit);
                if(account) {
                    std::cout << "\nAccount created successfully!\n";
                    account->displayInfo();
                }
                break;
            }
            
            case 2: {
                std::string accNum;
                std::cout << "\n--- View Account Details ---\n";
                std::cout << "Enter Account Number: ";
                std::getline(std::cin, accNum);
                
                auto account = bank.getAccount(accNum);
                if(account) {
                    account->displayInfo();
                } else {
                    std::cout << "Account not found!\n";
                }
                break;
            }
            
            case 3: {
                std::string accNum;
                std::cout << "\n--- View Account Transactions ---\n";
                std::cout << "Enter Account Number: ";
                std::getline(std::cin, accNum);
                
                auto account = bank.getAccount(accNum);
                if(account) {
                    account->displayTransactionHistory();
                } else {
                    std::cout << "Account not found!\n";
                }
                break;
            }
            
            case 4: {
                std::string accNum;
                std::cout << "\n--- Close Account ---\n";
                std::cout << "Enter Account Number: ";
                std::getline(std::cin, accNum);
                
                if(bank.closeAccount(accNum)) {
                    std::cout << "Account closed successfully!\n";
                }
                break;
            }
            
            case 5:
                bank.displayAllAccounts();
                break;
                
            case 6: {
                std::string custID;
                std::cout << "\n--- View Customer Accounts ---\n";
                std::cout << "Enter Customer ID: ";
                std::getline(std::cin, custID);
                
                bank.displayCustomerAccounts(custID);
                break;
            }
                
            case 0:
                std::cout << "Returning to main menu...\n";
                break;
                
            default:
                std::cout << "Invalid choice!\n";
        }
        
        if(choice != 0) {
            std::cout << "\nPress Enter to continue...";
            std::cin.get();
        }
    } while(choice != 0);
}

void handleTransactionMenu(Bank& bank) {
    int choice;
    do {
        std::cout << "\n════════════════════════════════════════════\n";
        std::cout << "           BANKING OPERATIONS\n";
        std::cout << "════════════════════════════════════════════\n";
        std::cout << "1. Deposit Money\n";
        std::cout << "2. Withdraw Money\n";
        std::cout << "3. Transfer Money\n";
        std::cout << "0. Back to Main Menu\n";
        std::cout << "════════════════════════════════════════════\n";
        std::cout << "Enter your choice: ";
        std::cin >> choice;
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        
        switch(choice) {
            case 1: {
                std::string accNum;
                double amount;
                std::string description;
                
                std::cout << "\n--- Deposit Money ---\n";
                std::cout << "Enter Account Number: ";
                std::getline(std::cin, accNum);
                std::cout << "Amount to Deposit: $";
                std::cin >> amount;
                std::cin.ignore();
                std::cout << "Description (optional): ";
                std::getline(std::cin, description);
                
                if(bank.deposit(accNum, amount, description)) {
                    std::cout << "Deposit successful!\n";
                }
                break;
            }
            
            case 2: {
                std::string accNum;
                double amount;
                std::string description;
                
                std::cout << "\n--- Withdraw Money ---\n";
                std::cout << "Enter Account Number: ";
                std::getline(std::cin, accNum);
                std::cout << "Amount to Withdraw: $";
                std::cin >> amount;
                std::cin.ignore();
                std::cout << "Description (optional): ";
                std::getline(std::cin, description);
                
                if(bank.withdraw(accNum, amount, description)) {
                    std::cout << "Withdrawal successful!\n";
                }
                break;
            }
            
            case 3: {
                std::string fromAcc, toAcc;
                double amount;
                std::string description;
                
                std::cout << "\n--- Transfer Money ---\n";
                std::cout << "Enter Source Account Number: ";
                std::getline(std::cin, fromAcc);
                std::cout << "Enter Destination Account Number: ";
                std::getline(std::cin, toAcc);
                std::cout << "Amount to Transfer: $";
                std::cin >> amount;
                std::cin.ignore();
                std::cout << "Description (optional): ";
                std::getline(std::cin, description);
                
                if(bank.transfer(fromAcc, toAcc, amount, description)) {
                    std::cout << "Transfer successful!\n";
                }
                break;
            }
                
            case 0:
                std::cout << "Returning to main menu...\n";
                break;
                
            default:
                std::cout << "Invalid choice!\n";
        }
        
        if(choice != 0) {
            std::cout << "\nPress Enter to continue...";
            std::cin.get();
        }
    } while(choice != 0);
}

void handleReportMenu(Bank& bank) {
    int choice;
    do {
        std::cout << "\n════════════════════════════════════════════\n";
        std::cout << "           REPORTS AND ANALYTICS\n";
        std::cout << "════════════════════════════════════════════\n";
        std::cout << "1. Bank Summary\n";
        std::cout << "2. All Customers Report\n";
        std::cout << "3. All Accounts Report\n";
        std::cout << "4. Transaction Report\n";
        std::cout << "0. Back to Main Menu\n";
        std::cout << "════════════════════════════════════════════\n";
        std::cout << "Enter your choice: ";
        std::cin >> choice;
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        
        switch(choice) {
            case 1:
                bank.displayBankSummary();
                break;
                
            case 2:
                bank.displayAllCustomers();
                break;
                
            case 3:
                bank.displayAllAccounts();
                break;
                
            case 4:
                bank.displayTransactionReport();
                break;
                
            case 0:
                std::cout << "Returning to main menu...\n";
                break;
                
            default:
                std::cout << "Invalid choice!\n";
        }
        
        if(choice != 0) {
            std::cout << "\nPress Enter to continue...";
            std::cin.get();
        }
    } while(choice != 0);
}

// ============================================
// MAIN FUNCTION
// ============================================

int main() {
    std::cout << "========================================\n";
    std::cout << "   SIMPLE BANKING SYSTEM v2.0\n";
    std::cout << "   Object-Oriented Programming Lab\n";
    std::cout << "========================================\n";
    
    // Create bank instance
    Bank bank("Simple Bank International");
    
    int choice;
    bool exitProgram = false;
    
    while(!exitProgram) {
        displayMainMenu();
        std::cin >> choice;
        
        if(std::cin.fail()) {
            std::cin.clear();
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            std::cout << "Invalid input! Please enter a number.\n";
            continue;
        }
        
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        
        switch(choice) {
            case 1:
                handleCustomerMenu(bank);
                break;
            case 2:
                handleAccountMenu(bank);
                break;
            case 3:
                handleTransactionMenu(bank);
                break;
            case 4:
                handleReportMenu(bank);
                break;
            case 5:
                bank.generateSampleData();
                std::cout << "\nPress Enter to continue...";
                std::cin.get();
                break;
            case 6:
                bank.displayStatistics();
                std::cout << "\nPress Enter to continue...";
                std::cin.get();
                break;
            case 0:
                exitProgram = true;
                std::cout << "\nThank you for using the Banking System!\n";
                std::cout << "Goodbye!\n";
                break;
            default:
                std::cout << "Invalid choice! Please try again.\n";
        }
    }
    
    return 0;
}