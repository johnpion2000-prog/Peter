#include <iostream>
#include <string>
using namespace std;

class Person {
protected:
    string name;
    int age;

public:
    Person(string n, int a) : name(n), age(a) {}
    virtual void display() const {
        cout << "Name: " << name << ", Age: " << age;
    }
};

class Employee {
protected:
    string position;
    double salary;

public:
    Employee(string pos, double sal) : position(pos), salary(sal) {}
    virtual void work() const {
        cout << "Working as employee" << endl;
    }
};

class Teacher : public Person, public Employee {
private:
    string subject;
    int experienceYears;

public:
    Teacher(string n, int a, string pos, double sal, string subj, int exp)
        : Person(n, a), Employee(pos, sal), subject(subj), experienceYears(exp) {}

    void display() const override {
        Person::display();
        cout << ", Position: " << position << ", Subject: " << subject << endl;
    }

    void work() const override {
        cout << "Teaching " << subject << endl;
    }
};

class Researcher {
protected:
    string researchArea;
    int publicationsCount;

public:
    Researcher(string area, int publications) 
        : researchArea(area), publicationsCount(publications) {}
    
    void conductResearch() const {
        cout << "Research in: " << researchArea << endl;
    }
};

class Professor : public Teacher, public Researcher {
public:
    Professor(string n, int a, string pos, double sal, string subj, int exp, 
              string area, int publications)
        : Teacher(n, a, pos, sal, subj, exp), 
          Researcher(area, publications) {}

    void display() const override {
        Teacher::display();
        cout << "Research: " << researchArea << ", Publications: " << publicationsCount << endl;
    }

    void work() const override {
        Teacher::work();
        conductResearch();
    }
};

int main() {
    Teacher teacher("John Smith", 35, "Math Teacher", 50000, "Mathematics", 10);
    Professor prof("Alice Johnson", 45, "Professor", 80000, "Computer Science", 15, "AI", 25);

    teacher.display();
    teacher.work();

    cout << endl;

    prof.display();
    prof.work();

    return 0;
}