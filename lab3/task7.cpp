#include <iostream>
using namespace std;

class Complex {
private:
    double real;
    double imaginary;

public:
    Complex(double r = 0, double i = 0) : real(r), imaginary(i) {}
    
    double getReal() const { return real; }
    double getImaginary() const { return imaginary; }
    
    Complex operator+(const Complex& other) const {
        return Complex(real + other.real, imaginary + other.imaginary);
    }
    
    Complex operator-(const Complex& other) const {
        return Complex(real - other.real, imaginary - other.imaginary);
    }
    
    Complex operator*(const Complex& other) const {
        return Complex(real * other.real - imaginary * other.imaginary,
                      real * other.imaginary + imaginary * other.real);
    }
    
    bool operator==(const Complex& other) const {
        return real == other.real && imaginary == other.imaginary;
    }
    
    friend ostream& operator<<(ostream& os, const Complex& c);
    friend istream& operator>>(istream& is, Complex& c);
};

ostream& operator<<(ostream& os, const Complex& c) {
    os << c.real;
    if (c.imaginary >= 0) {
        os << " + " << c.imaginary << "i";
    } else {
        os << " - " << -c.imaginary << "i";
    }
    return os;
}

istream& operator>>(istream& is, Complex& c) {
    is >> c.real >> c.imaginary;
    return is;
}

int main() {
    Complex a(3, 4);
    Complex b(1, -2);
    
    cout << "a = " << a << endl;
    cout << "b = " << b << endl;
    
    cout << "a + b = " << a + b << endl;
    cout << "a - b = " << a - b << endl;
    cout << "a * b = " << a * b << endl;
    
    Complex c(3, 4);
    cout << "a == c: " << (a == c ? "true" : "false") << endl;
    cout << "a == b: " << (a == b ? "true" : "false") << endl;
    
    Complex d;
    cout << "Enter real and imaginary parts: ";
    cin >> d;
    cout << "You entered: " << d << endl;
    
    return 0;
}