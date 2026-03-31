#include <iostream>
#include <string>
#include <vector>
using namespace std;

class Vehicle {
protected:
    string brand;
    string model;
    int year;
    double fuelLevel;

public:
    Vehicle(string b, string m, int y) : brand(b), model(m), year(y), fuelLevel(100) {}
    virtual ~Vehicle() {}
    
    virtual void startEngine() const = 0;
    virtual void stopEngine() const = 0;
    virtual void refuel(double amount) = 0;
    
    virtual void displayInfo() const {
        cout << brand << " " << model << " (" << year << ")" << endl;
        cout << "Fuel: " << fuelLevel << "%" << endl;
    }
    
    double getFuelLevel() const { return fuelLevel; }
    void setFuelLevel(double level) { 
        if (level >= 0 && level <= 100) fuelLevel = level; 
    }
};

class Car : public Vehicle {
private:
    int doors;
    string transmission;

public:
    Car(string b, string m, int y, int d, string trans) 
        : Vehicle(b, m, y), doors(d), transmission(trans) {}
    
    void startEngine() const override {
        cout << "Car engine started" << endl;
    }
    
    void stopEngine() const override {
        cout << "Car engine stopped" << endl;
    }
    
    void refuel(double amount) override {
        fuelLevel += amount;
        if (fuelLevel > 100) fuelLevel = 100;
        cout << "Refueled: " << amount << "%" << endl;
    }
    
    void displayInfo() const override {
        Vehicle::displayInfo();
        cout << "Doors: " << doors << ", Transmission: " << transmission << endl;
    }
};

class Motorcycle : public Vehicle {
private:
    bool hasFairing;

public:
    Motorcycle(string b, string m, int y, bool fairing) 
        : Vehicle(b, m, y), hasFairing(fairing) {}
    
    void startEngine() const override {
        cout << "Motorcycle engine started" << endl;
    }
    
    void stopEngine() const override {
        cout << "Motorcycle engine stopped" << endl;
    }
    
    void refuel(double amount) override {
        fuelLevel += amount;
        if (fuelLevel > 100) fuelLevel = 100;
        cout << "Refueled: " << amount << "%" << endl;
    }
    
    void wheelie() {
        cout << "Doing wheelie!" << endl;
    }
    
    void displayInfo() const override {
        Vehicle::displayInfo();
        cout << "Fairing: " << (hasFairing ? "Yes" : "No") << endl;
    }
};

int main() {
    vector<Vehicle*> vehicles;
    vehicles.push_back(new Car("Toyota", "Camry", 2022, 4, "Automatic"));
    vehicles.push_back(new Motorcycle("Honda", "CBR600", 2021, true));
    
    for (size_t i = 0; i < vehicles.size(); i++) {
        vehicles[i]->displayInfo();
        vehicles[i]->startEngine();
        vehicles[i]->refuel(20);
        vehicles[i]->stopEngine();
        cout << endl;
    }
    
    Motorcycle* bike = dynamic_cast<Motorcycle*>(vehicles[1]);
    if (bike) {
        bike->wheelie();
    }
    
    for (size_t i = 0; i < vehicles.size(); i++) {
        delete vehicles[i];
    }
    
    return 0;
}