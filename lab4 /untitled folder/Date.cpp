#define _CRT_SECURE_NO_WARNINGS
#include "Date.h"
#include <iostream>
#include <ctime>
#include <sstream>
#include <iomanip>
#include <string>

using namespace std;

// Constructeurs
Date::Date() {
    time_t now = time(0);
    tm* ltm = localtime(&now);
    day = ltm->tm_mday;
    month = 1 + ltm->tm_mon;
    year = 1900 + ltm->tm_year;
}

Date::Date(int day, int month, int year) {
    if (isValidDate(day, month, year)) {
        this->day = day;
        this->month = month;
        this->year = year;
    }
    else {
        // Si la date est invalide, on met la date courante
        time_t now = time(0);
        tm* ltm = localtime(&now);
        this->day = ltm->tm_mday;
        this->month = 1 + ltm->tm_mon;
        this->year = 1900 + ltm->tm_year;
    }
}

Date::Date(const std::string& dateString) {
    stringstream ss(dateString);
    char dot;
    int d, m, y;

    if (ss >> d >> dot >> m >> dot >> y && isValidDate(d, m, y)) {
        day = d;
        month = m;
        year = y;
    }
    else {
        // Si la date est invalide, on met la date courante
        time_t now = time(0);
        tm* ltm = localtime(&now);
        day = ltm->tm_mday;
        month = 1 + ltm->tm_mon;
        year = 1900 + ltm->tm_year;
    }
}

// Vérifie si la date est valide
bool Date::isValidDate(int d, int m, int y) const {
    if (y < 1900 || y > 2100) return false;
    if (m < 1 || m > 12) return false;
    if (d < 1 || d > getDaysInMonth(m, y)) return false;
    return true;
}

// Getters
int Date::getDay() const {
    return day;
}

int Date::getMonth() const {
    return month;
}

int Date::getYear() const {
    return year;
}

// Setters avec validation
bool Date::setDay(int day) {
    if (isValidDate(day, month, year)) {
        this->day = day;
        return true;
    }
    return false;
}

bool Date::setMonth(int month) {
    if (isValidDate(day, month, year)) {
        this->month = month;
        return true;
    }
    return false;
}

bool Date::setYear(int year) {
    if (isValidDate(day, month, year)) {
        this->year = year;
        return true;
    }
    return false;
}

bool Date::setDate(int day, int month, int year) {
    if (isValidDate(day, month, year)) {
        this->day = day;
        this->month = month;
        this->year = year;
        return true;
    }
    return false;
}

// Méthodes d'affichage
std::string Date::toString() const {
    stringstream ss;
    ss << setw(2) << setfill('0') << day << "."
        << setw(2) << setfill('0') << month << "."
        << year;
    return ss.str();
}

void Date::display() const {
    cout << toString() << endl;
}

// Méthodes statiques
Date Date::getCurrentDate() {
    return Date();
}

bool Date::isLeapYear(int year) {
    return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
}

int Date::getDaysInMonth(int month, int year) {
    switch (month) {
    case 1: case 3: case 5: case 7: case 8: case 10: case 12:
        return 31;
    case 4: case 6: case 9: case 11:
        return 30;
    case 2:
        return isLeapYear(year) ? 29 : 28;
    default:
        return 0;
    }
}