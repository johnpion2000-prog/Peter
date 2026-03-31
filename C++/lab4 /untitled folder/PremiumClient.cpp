#include "PremiumClient.h"
#include <iostream>
#include <sstream>
#include <string>

using namespace std;

// Constructeurs
PremiumClient::PremiumClient() : Client(), discountRate(10.0), premiumLevel("Gold") {
    type = ClientType::PREMIUM;
}

PremiumClient::PremiumClient(const std::string& firstName, const std::string& lastName,
    const Address& address, double discountRate,
    const std::string& premiumLevel)
    : Client(firstName, lastName, address, ClientType::PREMIUM),
    discountRate(discountRate), premiumLevel(premiumLevel) {
    // Limiter la réduction entre 0 et 50%
    if (discountRate < 0) this->discountRate = 0;
    if (discountRate > 50) this->discountRate = 50;
}

// Getters
double PremiumClient::getDiscountRate() const {
    return discountRate;
}

std::string PremiumClient::getPremiumLevel() const {
    return premiumLevel;
}

std::string PremiumClient::getTypeString() const {
    return "Premium (" + premiumLevel + ")";
}

// Setters
void PremiumClient::setDiscountRate(double rate) {
    if (rate >= 0 && rate <= 50) {
        discountRate = rate;
    }
}

void PremiumClient::setPremiumLevel(const std::string& level) {
    premiumLevel = level;
}

// Méthodes spécifiques aux clients premium
double PremiumClient::calculateDiscountedAmount(double amount) const {
    return amount * (1 - discountRate / 100.0);
}

void PremiumClient::displayBenefits() const {
    cout << "=== Avantages du client premium ===" << endl;
    cout << "Niveau: " << premiumLevel << endl;
    cout << "Réduction: " << discountRate << "%" << endl;
    cout << "Service prioritaire" << endl;
    cout << "Gestionnaire personnel" << endl;
    cout << "Taux préférentiels" << endl;
    cout << "===================================" << endl;
}

// Méthodes virtuelles redéfinies
void PremiumClient::displayInfo() const {
    Client::displayInfo();
    displayBenefits();
}

std::string PremiumClient::toString() const {
    stringstream ss;
    ss << Client::toString() << " [Réduction: " << discountRate
        << "%, Niveau: " << premiumLevel << "]";
    return ss.str();
}