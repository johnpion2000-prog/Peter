#include <iostream>
#include <string>
using namespace std;

struct Date {
    int day;
    int month;
    int year;
};

struct Student {
    string name;
    Date birthDate;
    int grades[5];
};

void printStudent(const Student& s) {
    cout << "Name: " << s.name << endl;
    cout << "Birth date: " << s.birthDate.day << "." 
         << s.birthDate.month << "." << s.birthDate.year << endl;
    cout << "Grades: ";
    for (int i = 0; i < 5; i++) {
        cout << s.grades[i] << " ";
    }
    cout << endl;
}

double getAverageRating(const Student& s) {
    double sum = 0;
    for (int i = 0; i < 5; i++) {
        sum += s.grades[i];
    }
    return sum / 5.0;
}

int main() {
    Student students[5] = {
        {"John Smith", {15, 3, 2000}, {5, 4, 5, 4, 5}},
        {"Alice Johnson", {22, 7, 2001}, {3, 4, 3, 4, 3}},
        {"Bob Wilson", {10, 11, 1999}, {5, 5, 5, 5, 5}},
        {"Emma Brown", {5, 1, 2000}, {4, 4, 4, 4, 4}},
        {"Mike Davis", {18, 9, 2001}, {3, 3, 4, 3, 3}}
    };

    cout << "All students:\n";
    for (int i = 0; i < 5; i++) {
        cout << "\nStudent " << i + 1 << ":\n";
        printStudent(students[i]);
        cout << "Average: " << getAverageRating(students[i]) << endl;
    }

    cout << "\nStudents with average > 4.0:\n";
    for (int i = 0; i < 5; i++) {
        double average = getAverageRating(students[i]);
        if (average > 4.0) {
            cout << students[i].name << " - Average: " << average << endl;
        }
    }

    return 0;
}