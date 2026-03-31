#pragma once
#ifndef CLIENT_H
#define CLIENT_H

#include "Address.h"
#include "Date.h"
#include <string>
#include <iostream>
#include <memory>

// Перечисление для типов клиентов
enum class ClientType {
    REGULAR,
    PREMIUM
};

class Client {
protected:
    int id;
    std::string firstName;
    std::string lastName;
    Address address;
    Date registrationDate;
    ClientType type;

    // Статический счётчик для генерации ID
    static int clientCounter;

public:
    // Конструкторы
    Client();
    Client(const std::string& firstName, const std::string& lastName,
        const Address& address, ClientType type = ClientType::REGULAR);

    // Виртуальный деструктор
    virtual ~Client();

    // Геттеры
    int getId() const;
    std::string getFirstName() const;
    std::string getLastName() const;
    std::string getFullName() const;
    Address getAddress() const;
    Date getRegistrationDate() const;
    ClientType getType() const;
    virtual std::string getTypeString() const;

    // Сеттеры
    void setFirstName(const std::string& firstName);
    void setLastName(const std::string& lastName);
    void setAddress(const Address& address);

    // Виртуальные методы
    virtual void displayInfo() const;
    virtual std::string toString() const;

    // Статические методы
    static int getTotalClients();
    static int generateClientId();

    // Операторы
    bool operator==(const Client& other) const;
};

#endif // CLIENT_H