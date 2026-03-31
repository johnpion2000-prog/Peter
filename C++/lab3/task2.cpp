#include <iostream>
#include <string>
#include <vector>
using namespace std;

class Person {
protected:
    string name;
    int age;
    string address;

public:
    Person(string n, int a, string addr) : name(n), age(a), address(addr) {}
    virtual void displayInfo() const {
        cout << "Name: " << name << ", Age: " << age << ", Address: " << address << endl;
    }
    virtual ~Person() {}
};

class Student : public Person {
private:
    string studentId;
    double averageGrade;
    vector<int> grades;

public:
    Student(string n, int a, string addr, string id, double avg = 0.0) 
        : Person(n, a, addr), studentId(id), averageGrade(avg) {}

    void displayInfo() const override {
        cout << "Student - ";
        Person::displayInfo();
        cout << "ID: " << studentId << ", Average: " << averageGrade << endl;
    }

    void addGrade(int grade) {
        if (grade >= 1 && grade <= 5) {
            grades.push_back(grade);
            calculateAverage();
        }
    }

private:
    void calculateAverage() {
        if (grades.empty()) {
            averageGrade = 0.0;
            return;
        }
        double sum = 0;
        for (int grade : grades) {
            sum += grade;
        }
        averageGrade = sum / grades.size();
    }

public:
    double getAverage() const {
        return averageGrade;
    }
};

class Professor : public Person {
private:
    string department;
    double salary;
    int yearsOfExperience;

public:
    Professor(string n, int a, string addr, string dept, double sal, int exp) 
        : Person(n, a, addr), department(dept), salary(sal), yearsOfExperience(exp) {}

    void displayInfo() const override {
        cout << "Professor - ";
        Person::displayInfo();
        cout << "Department: " << department << ", Salary: " << salary 
             << ", Experience: " << yearsOfExperience << " years" << endl;
    }

    double calculateBonus() const {
        if (yearsOfExperience >= 10) return salary * 0.2;
        if (yearsOfExperience >= 5) return salary * 0.1;
        return salary * 0.05;
    }

    double getTotalSalary() const {
        return salary + calculateBonus();
    }
};

int main() {
    Student student("Petr Petrov", 20, "Student St, 15", "S12345", 4.3);
    Professor prof("Dr. Ivanov", 45, "Academic St, 10", "Computer Science", 50000, 15);
    
    student.displayInfo();
    prof.displayInfo();
    
    cout << "\nProfessor bonus: " << prof.calculateBonus() << endl;
    cout << "Professor total salary: " << prof.getTotalSalary() << endl;
    
    student.addGrade(5);
    student.addGrade(4);
    student.addGrade(5);
    cout << "Student average after adding grades: " << student.getAverage() << endl;
    
    return 0;
}