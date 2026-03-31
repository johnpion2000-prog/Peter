#pragma once
#ifndef TRANSACTION_H
#define TRANSACTION_H

#include "Date.h"
#include <string>
#include <memory>

// Перечисление для типов транзакций
enum class TransactionType {
    DEPOSIT,      // Внесение средств
    WITHDRAWAL,   // Снятие средств
    TRANSFER,     // Перевод между счетами
    OPEN_ACCOUNT, // Открытие счёта
    CLOSE_ACCOUNT // Закрытие счёта
};

class Transaction {
private:
    int id;
    std::string fromAccount;
    std::string toAccount;
    double amount;
    Date transactionDate;
    TransactionType type;

    // Статический счётчик
    static int transactionCounter;

public:
    // Конструкторы
    Transaction();
    Transaction(const std::string& fromAccount, const std::string& toAccount,
        double amount, TransactionType type);
    Transaction(const std::string& accountNumber, double amount, TransactionType type);

    // Геттеры
    int getId() const;
    std::string getFromAccount() const;
    std::string getToAccount() const;
    double getAmount() const;
    Date getTransactionDate() const;
    TransactionType getType() const;
    std::string getTypeString() const;

    // Методы вывода информации
    void displayInfo() const;
    std::string toString() const;

    // Статические методы
    static int generateTransactionId();
    static int getTotalTransactions();
};

#endif // TRANSACTION_H