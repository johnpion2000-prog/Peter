#include "Client.h"
#include <iostream>
#include <sstream>
#include <string>

using namespace std;

// Initialisation du compteur statique
int Client::clientCounter = 0;

// Constructeurs
Client::Client() : id(generateClientId()), firstName(""), lastName(""),
type(ClientType::REGULAR) {
    registrationDate = Date::getCurrentDate();
    clientCounter++;
}

Client::Client(const std::string& firstName, const std::string& lastName,
    const Address& address, ClientType type)
    : id(generateClientId()), firstName(firstName), lastName(lastName),
    address(address), type(type) {
    registrationDate = Date::getCurrentDate();
    clientCounter++;
}

// Destructeur virtuel
Client::~Client() {
    clientCounter--;
}

// Getters
int Client::getId() const {
    return id;
}

std::string Client::getFirstName() const {
    return firstName;
}

std::string Client::getLastName() const {
    return lastName;
}

std::string Client::getFullName() const {
    return firstName + " " + lastName;
}

Address Client::getAddress() const {
    return address;
}

Date Client::getRegistrationDate() const {
    return registrationDate;
}

ClientType Client::getType() const {
    return type;
}

std::string Client::getTypeString() const {
    return (type == ClientType::REGULAR) ? "Ordinaire" : "Premium";
}

// Setters
void Client::setFirstName(const std::string& firstName) {
    this->firstName = firstName;
}

void Client::setLastName(const std::string& lastName) {
    this->lastName = lastName;
}

void Client::setAddress(const Address& address) {
    this->address = address;
}

// Méthodes virtuelles
void Client::displayInfo() const {
    cout << "=== Informations du client ===" << endl;
    cout << "ID: " << id << endl;
    cout << "Nom: " << getFullName() << endl;
    cout << "Type: " << getTypeString() << endl;
    cout << "Adresse: ";
    address.display();
    cout << "Date d'inscription: ";
    registrationDate.display();
    cout << "==============================" << endl;
}

std::string Client::toString() const {
    stringstream ss;
    ss << "Client #" << id << ": " << getFullName()
        << " (" << getTypeString() << ")";
    return ss.str();
}

// Méthodes statiques
int Client::getTotalClients() {
    return clientCounter;
}

int Client::generateClientId() {
    return 1000 + clientCounter;
}

// Opérateurs
bool Client::operator==(const Client& other) const {
    return id == other.id;
}