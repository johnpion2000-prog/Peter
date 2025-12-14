#include "BankAccount.h"

// Инициализация статического счётчика
int BankAccount::accountCounter = 0;

// Конструкторы
BankAccount::BankAccount()
    : accountNumber(generateAccountNumber()), clientId(0), balance(0.0),
    type(AccountType::CHECKING), status(AccountStatus::ACTIVE) {
    openingDate = Date::getCurrentDate();
    accountCounter++;
}

BankAccount::BankAccount(int clientId, AccountType type, double initialBalance)
    : accountNumber(generateAccountNumber()), clientId(clientId),
    balance(initialBalance), type(type), status(AccountStatus::ACTIVE) {
    openingDate = Date::getCurrentDate();
    accountCounter++;
}

// Деструктор
BankAccount::~BankAccount() {
    accountCounter--;
}

// Геттеры
std::string BankAccount::getAccountNumber() const { return accountNumber; }
int BankAccount::getClientId() const { return clientId; }
double BankAccount::getBalance() const { return balance; }
AccountType BankAccount::getType() const { return type; }
Date BankAccount::getOpeningDate() const { return openingDate; }
AccountStatus BankAccount::getStatus() const { return status; }

std::string BankAccount::getTypeString() const {
    switch (type) {
    case AccountType::CHECKING: return "Расчётный";
    case AccountType::SAVINGS: return "Сберегательный";
    default: return "Неизвестный";
    }
}

std::string BankAccount::getStatusString() const {
    switch (status) {
    case AccountStatus::ACTIVE: return "Активный";
    case AccountStatus::CLOSED: return "Закрытый";
    case AccountStatus::FROZEN: return "Замороженный";
    default: return "Неизвестный";
    }
}

// Операции со счётом
bool BankAccount::deposit(double amount) {
    if (amount <= 0) {
        std::cout << "Сумма для внесения должна быть положительной!" << std::endl;
        return false;
    }

    if (status != AccountStatus::ACTIVE) {
        std::cout << "Счёт не активен!" << std::endl;
        return false;
    }

    balance += amount;
    std::cout << "Успешно внесено " << amount << " на счёт " << accountNumber << std::endl;
    return true;
}

bool BankAccount::withdraw(double amount) {
    if (amount <= 0) {
        std::cout << "Сумма для снятия должна быть положительной!" << std::endl;
        return false;
    }

    if (status != AccountStatus::ACTIVE) {
        std::cout << "Счёт не активен!" << std::endl;
        return false;
    }

    if (!canWithdraw(amount)) {
        std::cout << "Недостаточно средств на счёте!" << std::endl;
        return false;
    }

    balance -= amount;
    std::cout << "Успешно снято " << amount << " со счёта " << accountNumber << std::endl;
    return true;
}

bool BankAccount::transfer(BankAccount& targetAccount, double amount) {
    if (this == &targetAccount) {
        std::cout << "Нельзя перевести средства на тот же счёт!" << std::endl;
        return false;
    }

    if (withdraw(amount)) {
        if (targetAccount.deposit(amount)) {
            return true;
        }
        else {
            // Возвращаем средства, если депозит не удался
            deposit(amount);
            return false;
        }
    }
    return false;
}

// Управление статусом счёта
bool BankAccount::activate() {
    if (status == AccountStatus::CLOSED && balance != 0) {
        std::cout << "Нельзя активировать закрытый счёт с ненулевым балансом!" << std::endl;
        return false;
    }

    status = AccountStatus::ACTIVE;
    std::cout << "Счёт " << accountNumber << " активирован" << std::endl;
    return true;
}

bool BankAccount::close() {
    if (balance != 0) {
        std::cout << "Нельзя закрыть счёт с ненулевым балансом!" << std::endl;
        return false;
    }

    status = AccountStatus::CLOSED;
    std::cout << "Счёт " << accountNumber << " закрыт" << std::endl;
    return true;
}

bool BankAccount::freeze() {
    status = AccountStatus::FROZEN;
    std::cout << "Счёт " << accountNumber << " заморожен" << std::endl;
    return true;
}

// Проверки
bool BankAccount::isActive() const {
    return status == AccountStatus::ACTIVE;
}

bool BankAccount::canWithdraw(double amount) const {
    return balance >= amount;
}

// Методы вывода информации
void BankAccount::displayInfo() const {
    std::cout << "=== Информация о счёте ===" << std::endl;
    std::cout << "Номер счёта: " << accountNumber << std::endl;
    std::cout << "Владелец (ID): " << clientId << std::endl;
    std::cout << "Тип счёта: " << getTypeString() << std::endl;
    std::cout << "Баланс: " << balance << " руб." << std::endl;
    std::cout << "Статус: " << getStatusString() << std::endl;
    std::cout << "Дата открытия: ";
    openingDate.display();
    std::cout << "==========================" << std::endl;
}

std::string BankAccount::toString() const {
    std::stringstream ss;
    ss << "Счёт " << accountNumber << " (Владелец: " << clientId
        << ", Баланс: " << balance << " руб., Статус: " << getStatusString() << ")";
    return ss.str();
}

// Статические методы
std::string BankAccount::generateAccountNumber() {
    std::stringstream ss;
    ss << "ACC" << std::setw(7) << std::setfill('0') << (1000 + accountCounter);
    return ss.str();
}

int BankAccount::getTotalAccounts() { return accountCounter; }

// Операторы
bool BankAccount::operator==(const BankAccount& other) const {
    return accountNumber == other.accountNumber;
}