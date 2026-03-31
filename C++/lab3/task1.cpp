#include <iostream>
#include <string>
#include <vector>
#include <stdexcept>
using namespace std;

class Student {
private:
    string name;
    int age;
    vector<int> grades;
    static const int GRADES_COUNT = 5;

public:
    Student(const string& studentName, int studentAge) {
        setName(studentName);
        setAge(studentAge);
        grades.resize(GRADES_COUNT, 0);
    }

    string getName() const {
        return name;
    }

    int getAge() const {
        return age;
    }

    int getGrade(int index) const {
        if (index < 0 || index >= GRADES_COUNT) {
            throw out_of_range("Invalid grade index");
        }
        return grades[index];
    }

    void setName(const string& studentName) {
        if (studentName.empty()) {
            throw invalid_argument("Name cannot be empty");
        }
        name = studentName;
    }

    void setAge(int studentAge) {
        if (studentAge < 16 || studentAge > 65) {
            throw invalid_argument("Age must be 16-65");
        }
        age = studentAge;
    }

    void setGrade(int index, int grade) {
        if (index < 0 || index >= GRADES_COUNT) {
            throw out_of_range("Invalid grade index");
        }
        if (grade < 1 || grade > 5) {
            throw invalid_argument("Grade must be 1-5");
        }
        grades[index] = grade;
    }

    double calculateAverage() const {
        if (grades.empty()) return 0.0;
        
        int sum = 0;
        int count = 0;
        
        for (int grade : grades) {
            if (grade > 0) {
                sum += grade;
                count++;
            }
        }
        
        return count > 0 ? static_cast<double>(sum) / count : 0.0;
    }

    void displayInfo() const {
        cout << "Name: " << name << endl;
        cout << "Age: " << age << endl;
        cout << "Grades: ";
        
        for (int i = 0; i < GRADES_COUNT; i++) {
            cout << grades[i];
            if (i < GRADES_COUNT - 1) cout << ", ";
        }
        
        cout << endl;
        cout << "Average: " << calculateAverage() << endl;
    }

    bool hasScholarship() const {
        return calculateAverage() >= 4.5;
    }
};

int main() {
    try {
        Student student("Ivan Ivanov", 20);
        
        student.setGrade(0, 5);
        student.setGrade(1, 4);
        student.setGrade(2, 5);
        student.setGrade(3, 3);
        student.setGrade(4, 4);
        
        student.displayInfo();
        
        if (student.hasScholarship()) {
            cout << "Student has scholarship" << endl;
        } else {
            cout << "No scholarship" << endl;
        }
        
    } catch (const exception& e) {
        cout << "Error: " << e.what() << endl;
    }
    
    return 0;
}