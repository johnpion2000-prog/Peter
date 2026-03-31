#include <iostream>
#include <string>
#include <vector>
#include <memory>
#include <algorithm>
using namespace std;

class UniversityMember {
protected:
    string name;
    string id;
    string email;

public:
    UniversityMember(string n, string i, string e) : name(n), id(i), email(e) {}
    virtual ~UniversityMember() {}
    
    virtual void displayInfo() const = 0;
    virtual void work() const = 0;
    virtual string getRole() const = 0;
};

class Student : public UniversityMember {
private:
    string major;
    int year;
    double gpa;

public:
    Student(string n, string i, string e, string m, int y) 
        : UniversityMember(n, i, e), major(m), year(y), gpa(0.0) {}

    void displayInfo() const override {
        cout << "Student: " << name << " (" << id << ")" << endl;
        cout << "Major: " << major << ", Year: " << year << ", GPA: " << gpa << endl;
    }

    void work() const override {
        cout << name << " is studying" << endl;
    }

    string getRole() const override {
        return "Student";
    }

    void calculateGPA() {
        gpa = 3.0 + (rand() % 10) / 10.0;
    }
};

class Professor : public UniversityMember {
private:
    string department;
    double salary;

public:
    Professor(string n, string i, string e, string dept, double sal) 
        : UniversityMember(n, i, e), department(dept), salary(sal) {}

    void displayInfo() const override {
        cout << "Professor: " << name << " (" << id << ")" << endl;
        cout << "Department: " << department << ", Salary: " << salary << endl;
    }

    void work() const override {
        cout << name << " is teaching" << endl;
    }

    string getRole() const override {
        return "Professor";
    }
};

class Course {
private:
    string courseCode;
    string courseName;
    int credits;

public:
    Course(string code, string name, int cred) 
        : courseCode(code), courseName(name), credits(cred) {}

    void displayCourseInfo() const {
        cout << "Course: " << courseCode << " - " << courseName << " (" << credits << " credits)" << endl;
    }
};

class University {
private:
    string name;
    vector<unique_ptr<UniversityMember>> members;
    vector<unique_ptr<Course>> courses;
    static int totalUniversities;

public:
    University(string n) : name(n) {
        totalUniversities++;
    }
    
    ~University() {
        totalUniversities--;
    }
    
    void addMember(unique_ptr<UniversityMember> member) {
        members.push_back(move(member));
    }

    void addCourse(unique_ptr<Course> course) {
        courses.push_back(move(course));
    }

    void displayAllMembers() const {
        for (const auto& member : members) {
            member->displayInfo();
            cout << endl;
        }
    }

    void displayAllCourses() const {
        for (const auto& course : courses) {
            course->displayCourseInfo();
        }
    }

    static int getTotalUniversities() {
        return totalUniversities;
    }
};

int University::totalUniversities = 0;

int main() {
    University uni("Tech University");

    auto student1 = make_unique<Student>("John Doe", "S001", "john@uni.edu", "Computer Science", 2);
    auto student2 = make_unique<Student>("Jane Smith", "S002", "jane@uni.edu", "Mathematics", 3);
    
    auto professor1 = make_unique<Professor>("Dr. Brown", "P001", "brown@uni.edu", "CS", 70000);

    student1->calculateGPA();

    auto course1 = make_unique<Course>("CS101", "Programming Basics", 3);
    auto course2 = make_unique<Course>("MATH201", "Calculus", 4);

    uni.addMember(move(student1));
    uni.addMember(move(student2));
    uni.addMember(move(professor1));
    
    uni.addCourse(move(course1));
    uni.addCourse(move(course2));

    uni.displayAllMembers();
    uni.displayAllCourses();

    cout << "Total universities: " << University::getTotalUniversities() << endl;

    return 0;
}