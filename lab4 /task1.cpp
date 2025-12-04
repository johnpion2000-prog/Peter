#include <iostream>
#include <vector>
#include <string>
#include <memory>
#include <iomanip>
#include <limits>

class BankAccount {
private:
    std::string accountNumber;
    std::string accountHolder;
    double balance;

public:
    BankAccount(const std::string& accNum, const std::string& holder, double initialBalance)
        : accountNumber(accNum), accountHolder(holder), balance(initialBalance) {}

    void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            std::cout << "Успешно внесено: " << amount << std::endl;
        } else {
            std::cout << "Неверная сумма!" << std::endl;
        }
    }

    bool withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            std::cout << "Успешно снято: " << amount << std::endl;
            return true;
        } else {
            std::cout << "Недостаточно средств или неверная сумма!" << std::endl;
            return false;
        }
    }

    void display() const {
        std::cout << std::setw(15) << accountNumber
                  << std::setw(20) << accountHolder
                  << std::setw(12) << std::fixed << std::setprecision(2) << balance << std::endl;
    }

    std::string getAccountNumber() const { return accountNumber; }
    std::string getAccountHolder() const { return accountHolder; }
    double getBalance() const { return balance; }
};

class BankSystem {
private:
    std::vector<std::unique_ptr<BankAccount>> accounts;

    BankAccount* findAccount(const std::string& accNum) {
        for (auto& acc : accounts) {
            if (acc->getAccountNumber() == accNum) {
                return acc.get();
            }
        }
        return nullptr;
    }

    void displayHeader() const {
        std::cout << "\n" << std::setw(15) << "Номер счета"
                  << std::setw(20) << "Владелец"
                  << std::setw(12) << "Баланс" << std::endl;
        std::cout << std::string(50, '-') << std::endl;
    }

public:
    void createAccount() {
        std::string accNum, holder;
        double initialBalance;

        std::cout << "\nСоздание нового счета:\n";
        std::cout << "Введите номер счета: ";
        std::cin >> accNum;

        if (findAccount(accNum)) {
            std::cout << "Счет с таким номером уже существует!\n";
            return;
        }

        std::cout << "Введите имя владельца: ";
        std::cin.ignore();
        std::getline(std::cin, holder);

        std::cout << "Введите начальный баланс: ";
        std::cin >> initialBalance;

        if (initialBalance < 0) {
            std::cout << "Начальный баланс не может быть отрицательным!\n";
            return;
        }

        accounts.push_back(std::make_unique<BankAccount>(accNum, holder, initialBalance));
        std::cout << "Счет успешно создан!\n";
    }

    void deposit() {
        std::string accNum;
        double amount;

        std::cout << "\nВнесение средств:\n";
        std::cout << "Введите номер счета: ";
        std::cin >> accNum;

        BankAccount* acc = findAccount(accNum);
        if (acc) {
            std::cout << "Введите сумму для внесения: ";
            std::cin >> amount;
            acc->deposit(amount);
        } else {
            std::cout << "Счет не найден!\n";
        }
    }

    void withdraw() {
        std::string accNum;
        double amount;

        std::cout << "\nСнятие средств:\n";
        std::cout << "Введите номер счета: ";
        std::cin >> accNum;

        BankAccount* acc = findAccount(accNum);
        if (acc) {
            std::cout << "Введите сумму для снятия: ";
            std::cin >> amount;
            acc->withdraw(amount);
        } else {
            std::cout << "Счет не найден!\n";
        }
    }

    void viewAccount() const {
        std::string accNum;
        std::cout << "\nПросмотр счета:\n";
        std::cout << "Введите номер счета: ";
        std::cin >> accNum;

        for (const auto& acc : accounts) {
            if (acc->getAccountNumber() == accNum) {
                displayHeader();
                acc->display();
                return;
            }
        }
        std::cout << "Счет не найден!\n";
    }

    void listAllAccounts() const {
        if (accounts.empty()) {
            std::cout << "\nВ системе нет счетов.\n";
            return;
        }

        std::cout << "\nВсе счета в системе:\n";
        displayHeader();
        for (const auto& acc : accounts) {
            acc->display();
        }
    }

    void run() {
        int choice;
        do {
            std::cout << "\n=== Упрощенная банковская система ===\n";
            std::cout << "1. Создать новый счет\n";
            std::cout << "2. Внести средства\n";
            std::cout << "3. Снять средства\n";
            std::cout << "4. Просмотреть счет\n";
            std::cout << "5. Показать все счета\n";
            std::cout << "6. Выход\n";
            std::cout << "Выберите операцию (1-6): ";
            
            std::cin >> choice;
            std::cin.clear();
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

            switch (choice) {
                case 1: createAccount(); break;
                case 2: deposit(); break;
                case 3: withdraw(); break;
                case 4: viewAccount(); break;
                case 5: listAllAccounts(); break;
                case 6: std::cout << "Выход из системы...\n"; break;
                default: std::cout << "Неверный выбор!\n";
            }
        } while (choice != 6);
    }
};

int main() {
    // Для корректного отображения кириллицы в macOS
    setlocale(LC_ALL, "ru_RU.UTF-8");
    
    BankSystem bank;
    bank.run();
    return 0;
}