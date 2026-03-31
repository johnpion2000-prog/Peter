#pragma once
#ifndef PREMIUMCLIENT_H
#define PREMIUMCLIENT_H

#include "Client.h"
#include <string>

class PremiumClient : public Client {
private:
    double discountRate;  // Процент скидки (от 0 до 100)
    std::string premiumLevel; // Уровень премиум-статуса

public:
    // Конструкторы
    PremiumClient();
    PremiumClient(const std::string& firstName, const std::string& lastName,
        const Address& address, double discountRate = 10.0,
        const std::string& premiumLevel = "Gold");

    // Геттеры
    double getDiscountRate() const;
    std::string getPremiumLevel() const;
    virtual std::string getTypeString() const override;

    // Сеттеры
    void setDiscountRate(double rate);
    void setPremiumLevel(const std::string& level);

    // Методы премиум-клиента
    double calculateDiscountedAmount(double amount) const;
    void displayBenefits() const;

    // Переопределённые виртуальные методы
    virtual void displayInfo() const override;
    virtual std::string toString() const override;
};

#endif // PREMIUMCLIENT_H