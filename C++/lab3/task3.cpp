#include <iostream>
#include <vector>
#include <cmath>
using namespace std;

class Shape {
protected:
    string name;
    string color;

public:
    Shape(string n, string c) : name(n), color(c) {}
    virtual ~Shape() {}
    
    virtual double calculateArea() const = 0;
    virtual double calculatePerimeter() const = 0;
    virtual void draw() const = 0;
    
    virtual void displayInfo() const {
        cout << name << " (" << color << ")" << endl;
    }
};

class Circle : public Shape {
private:
    double radius;

public:
    Circle(string c, double r) : Shape("Circle", c), radius(r) {}
    
    double calculateArea() const override {
        return M_PI * radius * radius;
    }
    
    double calculatePerimeter() const override {
        return 2 * M_PI * radius;
    }
    
    void draw() const override {
        cout << "Drawing circle" << endl;
    }
    
    void displayInfo() const override {
        Shape::displayInfo();
        cout << "Area: " << calculateArea() << ", Perimeter: " << calculatePerimeter() << endl;
    }
};

class Rectangle : public Shape {
private:
    double width, height;

public:
    Rectangle(string c, double w, double h) : Shape("Rectangle", c), width(w), height(h) {}
    
    double calculateArea() const override {
        return width * height;
    }
    
    double calculatePerimeter() const override {
        return 2 * (width + height);
    }
    
    void draw() const override {
        cout << "Drawing rectangle" << endl;
    }
    
    void displayInfo() const override {
        Shape::displayInfo();
        cout << "Area: " << calculateArea() << ", Perimeter: " << calculatePerimeter() << endl;
    }
};

class Triangle : public Shape {
private:
    double sideA, sideB, sideC;

public:
    Triangle(string c, double a, double b, double c_val) : Shape("Triangle", c), sideA(a), sideB(b), sideC(c_val) {}
    
    double calculateArea() const override {
        double s = calculatePerimeter() / 2;
        return sqrt(s * (s - sideA) * (s - sideB) * (s - sideC));
    }
    
    double calculatePerimeter() const override {
        return sideA + sideB + sideC;
    }
    
    void draw() const override {
        cout << "Drawing triangle" << endl;
    }
    
    void displayInfo() const override {
        Shape::displayInfo();
        cout << "Area: " << calculateArea() << ", Perimeter: " << calculatePerimeter() << endl;
    }
};

int main() {
    vector<Shape*> shapes;
    shapes.push_back(new Circle("Red", 5.0));
    shapes.push_back(new Rectangle("Blue", 4.0, 6.0));
    shapes.push_back(new Triangle("Green", 3.0, 4.0, 5.0));
    
    for (size_t i = 0; i < shapes.size(); i++) {
        shapes[i]->displayInfo();
        shapes[i]->draw();
    }
    
    for (size_t i = 0; i < shapes.size(); i++) {
        delete shapes[i];
    }
    
    return 0;
}