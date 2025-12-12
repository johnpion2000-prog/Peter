#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <memory>
#include <algorithm>
#include <iomanip>
#include <sstream>
#include <limits>
#include <ctime>
#include <stdexcept>

// ============================================================================
// КОНСТАНТЫ И МАКРОСЫ
// ============================================================================

#define MIN_ACCOUNT_BALANCE 0.0      // Минимальный баланс счета
#define MAX_ACCOUNT_BALANCE 1000000.0 // Максимальный баланс счета
#define MIN_TRANSACTION_AMOUNT 0.01   // Минимальная сумма транзакции
#define MAX_TRANSACTION_AMOUNT 100000.0 // Максимальная сумма транзакции

// ============================================================================
// КЛАССЫ ИСКЛЮЧЕНИЙ
// ============================================================================

class BankException : public std::runtime_error {
public:
    explicit BankException(const std::string& message) 
        : std::runtime_error(message) {}
};

class InsufficientFundsException : public BankException {
public:
    InsufficientFundsException() 
        : BankException("Недостаточно средств на счете") {}
};

class InvalidAmountException : public BankException {
public:
    InvalidAmountException() 
        : BankException("Некорректная сумма") {}
};

class AccountNotFoundException : public BankException {
public:
    AccountNotFoundException(const std::string& accountNumber)
        : BankException("Счет не найден: " + accountNumber) {}
};

// ============================================================================
// КЛАСС ТРАНЗАКЦИИ
// ============================================================================

class Transaction {
public:
    enum class Type {
        DEPOSIT,    // Внесение средств
        WITHDRAWAL, // Снятие средств
        TRANSFER,   // Перевод
        INTEREST    // Начисление процентов
    };
    
private:
    std::string id;
    std::string accountNumber;
    Type type;
    double amount;
    std::string description;
    std::time_t timestamp;
    
public:
    Transaction(const std::string& accNum, Type t, double amt, const std::string& desc = "")
        : accountNumber(accNum), type(t), amount(amt), description(desc) {
        timestamp = std::time(nullptr);
        generateId();
    }
    
    // Генерация уникального ID транзакции (упрощенная)
    void generateId() {
        std::stringstream ss;
        ss << "TXN" << std::setfill('0') << std::setw(8) << (timestamp % 100000000);
        id = ss.str();
    }
    
    // Геттеры
    std::string getId() const { return id; }
    std::string getAccountNumber() const { return accountNumber; }
    Type getType() const { return type; }
    double getAmount() const { return amount; }
    std::string getDescription() const { return description; }
    std::time_t getTimestamp() const { return timestamp; }
    
    // Форматированный вывод
    std::string toString() const {
        std::string typeStr;
        switch (type) {
            case Type::DEPOSIT: typeStr = "ПОПОЛНЕНИЕ"; break;
            case Type::WITHDRAWAL: typeStr = "СНЯТИЕ"; break;
            case Type::TRANSFER: typeStr = "ПЕРЕВОД"; break;
            case Type::INTEREST: typeStr = "ПРОЦЕНТЫ"; break;
        }
        
        char timeStr[20];
        std::strftime(timeStr, sizeof(timeStr), "%Y-%m-%d %H:%M:%S", std::localtime(&timestamp));
        
        std::stringstream ss;
        ss << "[" << timeStr << "] " << typeStr << " | ";
        ss << "Сумма: " << std::fixed << std::setprecision(2) << amount << " | ";
        ss << "Описание: " << description;
        
        return ss.str();
    }
};

// ============================================================================
// КЛАСС БАНКОВСКОГО СЧЕТА
// ============================================================================

class BankAccount {
private:
    std::string accountNumber;
    std::string ownerName;
    double balance;
    std::vector<Transaction> transactions;
    bool isActive;
    
public:
    BankAccount(const std::string& accNum, const std::string& owner, double initialBalance = 0.0)
        : accountNumber(accNum), ownerName(owner), balance(initialBalance), isActive(true) {
        
        // Упрощенная валидация баланса
        if (initialBalance < MIN_ACCOUNT_BALANCE || initialBalance > MAX_ACCOUNT_BALANCE) {
            throw InvalidAmountException();
        }
        
        // Логирование создания счета
        transactions.emplace_back(accountNumber, Transaction::Type::DEPOSIT, 
                                 initialBalance, "Открытие счета");
    }
    
    // Депозит (пополнение счета)
    void deposit(double amount, const std::string& description = "") {
        // Упрощенная валидация суммы
        if (amount < MIN_TRANSACTION_AMOUNT || amount > MAX_TRANSACTION_AMOUNT) {
            throw InvalidAmountException();
        }
        
        if (!isActive) {
            throw BankException("Счет заблокирован");
        }
        
        balance += amount;
        transactions.emplace_back(accountNumber, Transaction::Type::DEPOSIT, 
                                 amount, description);
    }
    
    // Снятие средств
    void withdraw(double amount, const std::string& description = "") {
        // Упрощенная валидация суммы
        if (amount < MIN_TRANSACTION_AMOUNT || amount > MAX_TRANSACTION_AMOUNT) {
            throw InvalidAmountException();
        }
        
        if (!isActive) {
            throw BankException("Счет заблокирован");
        }
        
        if (balance < amount) {
            throw InsufficientFundsException();
        }
        
        balance -= amount;
        transactions.emplace_back(accountNumber, Transaction::Type::WITHDRAWAL, 
                                 amount, description);
    }
    
    // Начисление процентов (упрощенное)
    void applyInterest(double rate, const std::string& description = "") {
        if (!isActive || rate <= 0) return;
        
        double interest = balance * rate / 100.0;
        if (interest > 0) {
            balance += interest;
            transactions.emplace_back(accountNumber, Transaction::Type::INTEREST, 
                                     interest, description);
        }
    }
    
    // Перевод на другой счет (упрощенный - без реальной связи)
    void transfer(double amount, const std::string& targetAccount, 
                  const std::string& description = "") {
        withdraw(amount, "Перевод на счет: " + targetAccount + " - " + description);
        // В реальной системе здесь был бы вызов метода targetAccount.deposit()
    }
    
    // Геттеры
    std::string getAccountNumber() const { return accountNumber; }
    std::string getOwnerName() const { return ownerName; }
    double getBalance() const { return balance; }
    bool getIsActive() const { return isActive; }
    
    // Получение истории транзакций
    const std::vector<Transaction>& getTransactions() const { return transactions; }
    
    // Получение последних N транзакций
    std::vector<Transaction> getRecentTransactions(int count = 5) const {
        int startIdx = std::max(0, static_cast<int>(transactions.size()) - count);
        std::vector<Transaction> recent;
        for (int i = startIdx; i < transactions.size(); ++i) {
            recent.push_back(transactions[i]);
        }
        return recent;
    }
    
    // Блокировка/разблокировка счета
    void setActive(bool active) { isActive = active; }
    
    // Форматированный вывод информации о счете
    std::string getAccountInfo() const {
        std::stringstream ss;
        ss << "╔════════════════════════════════════════╗\n";
        ss << "║          ИНФОРМАЦИЯ О СЧЕТЕ           ║\n";
        ss << "╠════════════════════════════════════════╣\n";
        ss << "║ Номер счета: " << std::setw(25) << std::left << accountNumber << " ║\n";
        ss << "║ Владелец: " << std::setw(27) << std::left << ownerName << " ║\n";
        ss << "║ Баланс: " << std::setw(29) << std::left 
           << (std::to_string(balance) + " руб.") << " ║\n";
        ss << "║ Статус: " << std::setw(29) << std::left 
           << (isActive ? "Активен" : "Заблокирован") << " ║\n";
        ss << "║ Всего транзакций: " << std::setw(19) << std::left 
           << transactions.size() << " ║\n";
        ss << "╚════════════════════════════════════════╝";
        return ss.str();
    }
};

// ============================================================================
// КЛАСС БАНКОВСКОЙ СИСТЕМЫ (ХРАНЕНИЕ В ПАМЯТИ)
// ============================================================================

class BankingSystem {
private:
    std::map<std::string, std::shared_ptr<BankAccount>> accounts;
    std::string adminPassword; // Упрощенная "аутентификация"
    
    // Упрощенная генерация номера счета
    std::string generateAccountNumber() {
        static int accountCounter = 1000;
        std::stringstream ss;
        ss << "ACC" << std::setfill('0') << std::setw(7) << accountCounter++;
        return ss.str();
    }
    
    // Упрощенная проверка пароля администратора
    bool checkAdminPassword(const std::string& input) const {
        return input == adminPassword;
    }
    
public:
    BankingSystem() : adminPassword("admin123") {
        // Инициализация системы с несколькими тестовыми счетами
        createAccount("Иванов Иван Иванович", 10000.0);
        createAccount("Петрова Мария Сергеевна", 5000.0);
        createAccount("Сидоров Алексей Владимирович", 15000.0);
    }
    
    // Создание нового счета
    std::string createAccount(const std::string& ownerName, double initialBalance = 0.0) {
        std::string accountNumber = generateAccountNumber();
        auto account = std::make_shared<BankAccount>(accountNumber, ownerName, initialBalance);
        accounts[accountNumber] = account;
        return accountNumber;
    }
    
    // Поиск счета по номеру
    std::shared_ptr<BankAccount> findAccount(const std::string& accountNumber) {
        auto it = accounts.find(accountNumber);
        if (it == accounts.end()) {
            throw AccountNotFoundException(accountNumber);
        }
        return it->second;
    }
    
    // Пополнение счета
    void deposit(const std::string& accountNumber, double amount, 
                 const std::string& description = "") {
        auto account = findAccount(accountNumber);
        account->deposit(amount, description);
    }
    
    // Снятие средств
    void withdraw(const std::string& accountNumber, double amount, 
                  const std::string& description = "") {
        auto account = findAccount(accountNumber);
        account->withdraw(amount, description);
    }
    
    // Перевод между счетами (упрощенный)
    void transfer(const std::string& fromAccount, const std::string& toAccount, 
                  double amount, const std::string& description = "") {
        auto source = findAccount(fromAccount);
        auto target = findAccount(toAccount);
        
        // В реальной системе это была бы атомарная операция
        source->withdraw(amount, "Перевод на счет " + toAccount + ": " + description);
        target->deposit(amount, "Перевод от счета " + fromAccount + ": " + description);
    }
    
    // Начисление процентов на все счета (упрощенное)
    void applyInterestToAll(double rate) {
        for (auto& pair : accounts) {
            if (pair.second->getIsActive()) {
                pair.second->applyInterest(rate, "Ежемесячные проценты");
            }
        }
    }
    
    // Получение списка всех счетов
    std::vector<std::shared_ptr<BankAccount>> getAllAccounts() const {
        std::vector<std::shared_ptr<BankAccount>> result;
        for (const auto& pair : accounts) {
            result.push_back(pair.second);
        }
        return result;
    }
    
    // Получение списка счетов по владельцу (упрощенный поиск)
    std::vector<std::shared_ptr<BankAccount>> findAccountsByOwner(
        const std::string& ownerName) const {
        
        std::vector<std::shared_ptr<BankAccount>> result;
        for (const auto& pair : accounts) {
            if (pair.second->getOwnerName().find(ownerName) != std::string::npos) {
                result.push_back(pair.second);
            }
        }
        return result;
    }
    
    // Административные функции
    bool blockAccount(const std::string& accountNumber, const std::string& password) {
        if (!checkAdminPassword(password)) {
            return false;
        }
        
        auto account = findAccount(accountNumber);
        account->setActive(false);
        return true;
    }
    
    bool unblockAccount(const std::string& accountNumber, const std::string& password) {
        if (!checkAdminPassword(password)) {
            return false;
        }
        
        auto account = findAccount(accountNumber);
        account->setActive(true);
        return true;
    }
    
    // Получение статистики системы
    std::map<std::string, double> getSystemStats() const {
        std::map<std::string, double> stats;
        double totalBalance = 0.0;
        int activeAccounts = 0;
        int totalAccounts = 0;
        
        for (const auto& pair : accounts) {
            totalBalance += pair.second->getBalance();
            totalAccounts++;
            if (pair.second->getIsActive()) {
                activeAccounts++;
            }
        }
        
        stats["total_balance"] = totalBalance;
        stats["active_accounts"] = activeAccounts;
        stats["total_accounts"] = totalAccounts;
        stats["average_balance"] = totalAccounts > 0 ? totalBalance / totalAccounts : 0.0;
        
        return stats;
    }
};

// ============================================================================
// КЛАСС КОНСОЛЬНОГО ИНТЕРФЕЙСА
// ============================================================================

class ConsoleInterface {
private:
    BankingSystem bankingSystem;
    
    // Вспомогательные функции
    void clearScreen() {
        // Упрощенная очистка экрана (кросс-платформенная)
        std::cout << "\033[2J\033[1;1H";
    }
    
    void printHeader(const std::string& title) {
        std::cout << "\n╔══════════════════════════════════════════════════════════════╗\n";
        std::cout << "║ " << std::setw(58) << std::left << title << "║\n";
        std::cout << "╚══════════════════════════════════════════════════════════════╝\n";
    }
    
    void printMenu(const std::vector<std::string>& options) {
        for (size_t i = 0; i < options.size(); ++i) {
            std::cout << "  " << (i + 1) << ". " << options[i] << "\n";
        }
        std::cout << "\n";
    }
    
    double getValidatedAmount(const std::string& prompt, 
                             double min = MIN_TRANSACTION_AMOUNT,
                             double max = MAX_TRANSACTION_AMOUNT) {
        double amount;
        while (true) {
            std::cout << prompt;
            std::cin >> amount;
            
            if (std::cin.fail() || amount < min || amount > max) {
                std::cin.clear();
                std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
                std::cout << "Ошибка: введите сумму от " << min << " до " << max << "\n";
            } else {
                std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
                return amount;
            }
        }
    }
    
    std::string getInput(const std::string& prompt) {
        std::string input;
        std::cout << prompt;
        std::getline(std::cin, input);
        return input;
    }
    
public:
    void run() {
        bool running = true;
        
        while (running) {
            clearScreen();
            printHeader("БАНКОВСКАЯ СИСТЕМА - ГЛАВНОЕ МЕНЮ");
            
            std::vector<std::string> mainMenu = {
                "Создать новый счет",
                "Пополнить счет",
                "Снять средства",
                "Перевести средства",
                "Просмотреть информацию о счете",
                "Просмотреть историю операций",
                "Найти счета по владельцу",
                "Административные функции",
                "Статистика системы",
                "Выход"
            };
            
            printMenu(mainMenu);
            
            int choice;
            std::cout << "Выберите действие: ";
            std::cin >> choice;
            std::cin.ignore();
            
            try {
                switch (choice) {
                    case 1: createAccount(); break;
                    case 2: deposit(); break;
                    case 3: withdraw(); break;
                    case 4: transfer(); break;
                    case 5: viewAccountInfo(); break;
                    case 6: viewTransactionHistory(); break;
                    case 7: findAccountsByOwner(); break;
                    case 8: adminMenu(); break;
                    case 9: showSystemStats(); break;
                    case 10: running = false; break;
                    default: 
                        std::cout << "Неверный выбор. Попробуйте снова.\n";
                        break;
                }
            } catch (const BankException& e) {
                std::cout << "\n❌ Ошибка: " << e.what() << "\n";
            } catch (const std::exception& e) {
                std::cout << "\n❌ Неизвестная ошибка: " << e.what() << "\n";
            }
            
            if (choice != 10) {
                std::cout << "\nНажмите Enter для продолжения...";
                std::cin.get();
            }
        }
        
        std::cout << "\nСпасибо за использование банковской системы!\n";
    }
    
private:
    void createAccount() {
        clearScreen();
        printHeader("СОЗДАНИЕ НОВОГО СЧЕТА");
        
        std::string ownerName = getInput("Введите ФИО владельца: ");
        double initialBalance = getValidatedAmount("Введите начальный баланс: ", 
                                                   MIN_ACCOUNT_BALANCE, 
                                                   MAX_ACCOUNT_BALANCE);
        
        std::string accountNumber = bankingSystem.createAccount(ownerName, initialBalance);
        
        std::cout << "\n✅ Счет успешно создан!\n";
        std::cout << "Номер счета: " << accountNumber << "\n";
        std::cout << "Владелец: " << ownerName << "\n";
        std::cout << "Начальный баланс: " << initialBalance << " руб.\n";
    }
    
    void deposit() {
        clearScreen();
        printHeader("ПОПОЛНЕНИЕ СЧЕТА");
        
        std::string accountNumber = getInput("Введите номер счета: ");
        double amount = getValidatedAmount("Введите сумму для пополнения: ");
        std::string description = getInput("Введите описание операции (необязательно): ");
        
        bankingSystem.deposit(accountNumber, amount, description);
        
        std::cout << "\n✅ Счет успешно пополнен на " << amount << " руб.\n";
    }
    
    void withdraw() {
        clearScreen();
        printHeader("СНЯТИЕ СРЕДСТВ СО СЧЕТА");
        
        std::string accountNumber = getInput("Введите номер счета: ");
        double amount = getValidatedAmount("Введите сумму для снятия: ");
        std::string description = getInput("Введите описание операции (необязательно): ");
        
        bankingSystem.withdraw(accountNumber, amount, description);
        
        std::cout << "\n✅ Со счета снято " << amount << " руб.\n";
    }
    
    void transfer() {
        clearScreen();
        printHeader("ПЕРЕВОД СРЕДСТВ");
        
        std::string fromAccount = getInput("Введите номер счета отправителя: ");
        std::string toAccount = getInput("Введите номер счета получателя: ");
        double amount = getValidatedAmount("Введите сумму перевода: ");
        std::string description = getInput("Введите описание перевода (необязательно): ");
        
        bankingSystem.transfer(fromAccount, toAccount, amount, description);
        
        std::cout << "\n✅ Перевод выполнен успешно!\n";
        std::cout << "Сумма: " << amount << " руб.\n";
        std::cout << "Со счета: " << fromAccount << "\n";
        std::cout << "На счет: " << toAccount << "\n";
    }
    
    void viewAccountInfo() {
        clearScreen();
        printHeader("ИНФОРМАЦИЯ О СЧЕТЕ");
        
        std::string accountNumber = getInput("Введите номер счета: ");
        auto account = bankingSystem.findAccount(accountNumber);
        
        std::cout << "\n";
        std::cout << account->getAccountInfo() << "\n";
        
        // Показываем последние транзакции
        auto recentTransactions = account->getRecentTransactions(5);
        if (!recentTransactions.empty()) {
            std::cout << "\nПоследние транзакции:\n";
            std::cout << "══════════════════════════════════════════════════════════════\n";
            for (const auto& txn : recentTransactions) {
                std::cout << txn.toString() << "\n";
            }
        }
    }
    
    void viewTransactionHistory() {
        clearScreen();
        printHeader("ИСТОРИЯ ОПЕРАЦИЙ");
        
        std::string accountNumber = getInput("Введите номер счета: ");
        auto account = bankingSystem.findAccount(accountNumber);
        
        const auto& transactions = account->getTransactions();
        
        if (transactions.empty()) {
            std::cout << "\nНа счете еще не было операций.\n";
            return;
        }
        
        std::cout << "\nВсего операций: " << transactions.size() << "\n";
        std::cout << "══════════════════════════════════════════════════════════════\n";
        
        for (const auto& txn : transactions) {
            std::cout << txn.toString() << "\n";
        }
    }
    
    void findAccountsByOwner() {
        clearScreen();
        printHeader("ПОИСК СЧЕТОВ ПО ВЛАДЕЛЬЦУ");
        
        std::string ownerName = getInput("Введите имя владельца (или часть): ");
        auto accounts = bankingSystem.findAccountsByOwner(ownerName);
        
        if (accounts.empty()) {
            std::cout << "\nСчета не найдены.\n";
            return;
        }
        
        std::cout << "\nНайдено счетов: " << accounts.size() << "\n";
        std::cout << "══════════════════════════════════════════════════════════════\n";
        
        for (const auto& account : accounts) {
            std::cout << "Номер счета: " << account->getAccountNumber() << "\n";
            std::cout << "Владелец: " << account->getOwnerName() << "\n";
            std::cout << "Баланс: " << account->getBalance() << " руб.\n";
            std::cout << "Статус: " << (account->getIsActive() ? "Активен" : "Заблокирован") << "\n";
            std::cout << "──────────────────────────────────────────────────────────\n";
        }
    }
    
    void adminMenu() {
        clearScreen();
        printHeader("АДМИНИСТРАТИВНЫЕ ФУНКЦИИ");
        
        std::string password = getInput("Введите пароль администратора: ");
        
        if (password != "admin123") {
            std::cout << "\n❌ Неверный пароль!\n";
            return;
        }
        
        std::vector<std::string> adminOptions = {
            "Заблокировать счет",
            "Разблокировать счет",
            "Начислить проценты на все счета",
            "Просмотреть все счета",
            "Назад"
        };
        
        printMenu(adminOptions);
        
        int choice;
        std::cout << "Выберите действие: ";
        std::cin >> choice;
        std::cin.ignore();
        
        switch (choice) {
            case 1: {
                std::string accountNumber = getInput("Введите номер счета для блокировки: ");
                if (bankingSystem.blockAccount(accountNumber, password)) {
                    std::cout << "\n✅ Счет " << accountNumber << " заблокирован.\n";
                }
                break;
            }
            case 2: {
                std::string accountNumber = getInput("Введите номер счета для разблокировки: ");
                if (bankingSystem.unblockAccount(accountNumber, password)) {
                    std::cout << "\n✅ Счет " << accountNumber << " разблокирован.\n";
                }
                break;
            }
            case 3: {
                double rate;
                std::cout << "Введите процентную ставку: ";
                std::cin >> rate;
                std::cin.ignore();
                
                bankingSystem.applyInterestToAll(rate);
                std::cout << "\n✅ Проценты начислены на все активные счета.\n";
                break;
            }
            case 4: {
                auto allAccounts = bankingSystem.getAllAccounts();
                std::cout << "\nВсего счетов в системе: " << allAccounts.size() << "\n";
                std::cout << "══════════════════════════════════════════════════════════════\n";
                
                for (const auto& account : allAccounts) {
                    std::cout << account->getAccountNumber() << " | ";
                    std::cout << account->getOwnerName() << " | ";
                    std::cout << account->getBalance() << " руб. | ";
                    std::cout << (account->getIsActive() ? "Активен" : "Заблокирован") << "\n";
                }
                break;
            }
            case 5:
                return;
            default:
                std::cout << "Неверный выбор.\n";
                break;
        }
    }
    
    void showSystemStats() {
        clearScreen();
        printHeader("СТАТИСТИКА СИСТЕМЫ");
        
        auto stats = bankingSystem.getSystemStats();
        
        std::cout << "\n";
        std::cout << "╔══════════════════════════════════════════════════════╗\n";
        std::cout << "║                 СТАТИСТИКА СИСТЕМЫ                 ║\n";
        std::cout << "╠══════════════════════════════════════════════════════╣\n";
        std::cout << "║ Общий баланс: " << std::setw(34) << std::left 
                  << std::to_string(stats["total_balance"]) + " руб." << "║\n";
        std::cout << "║ Всего счетов: " << std::setw(36) << std::left 
                  << std::to_string(static_cast<int>(stats["total_accounts"])) << "║\n";
        std::cout << "║ Активных счетов: " << std::setw(32) << std::left 
                  << std::to_string(static_cast<int>(stats["active_accounts"])) << "║\n";
        std::cout << "║ Средний баланс: " << std::setw(34) << std::left 
                  << std::to_string(stats["average_balance"]) + " руб." << "║\n";
        std::cout << "╚══════════════════════════════════════════════════════╝\n";
    }
};

// ============================================================================
// ТОЧКА ВХОДА
// ============================================================================

int main() {
    // Настройка локализации для корректного отображения кириллицы
    std::locale::global(std::locale(""));
    
    std::cout << "╔══════════════════════════════════════════════════════════════╗\n";
    std::cout << "║         БАНКОВСКАЯ СИСТЕМА (ДЕМОНСТРАЦИОННАЯ ВЕРСИЯ)        ║\n";
    std::cout << "║                                                              ║\n";
    std::cout << "║   ОГРАНИЧЕНИЯ И ДОПУЩЕНИЯ:                                   ║\n";
    std::cout << "║   • Хранение данных только в памяти                         ║\n";
    std::cout << "║   • Упрощенная аутентификация                                ║\n";
    std::cout << "║   • Консольный интерфейс                                     ║\n";
    std::cout << "║   • Локальное хранение (без сети)                            ║\n";
    std::cout << "║   • Упрощенная валидация данных                              ║\n";
    std::cout << "╚══════════════════════════════════════════════════════════════╝\n\n";
    
    ConsoleInterface interface;
    interface.run();
    
    return 0;
}