#include <iostream>
using namespace std;

struct Complex
{
    double Re;
    double Im;
};

Complex add(Complex a, Complex b)
{
    Complex result;
    result.Re = a.Re + b.Re;
    result.Im = a.Im + b.Im;
    return result;
}

Complex subtract(Complex a, Complex b)
{
    Complex result;
    result.Re = a.Re - b.Re;
    result.Im = a.Im - b.Im;
    return result;
}

Complex multiply(Complex a, Complex b)
{
    Complex result;
    result.Re = a.Re * b.Re - a.Im * b.Im;
    result.Im = a.Re * b.Im + a.Im * b.Re;
    return result;
}

void print(Complex c)
{
    cout << "(" << c.Re << " + " << c.Im << "i)" << endl;
}

int main()
{
    Complex a, b;
    a.Re = 1;
    a.Im = 2;
    b.Re = 3.1;
    b.Im = 5.5;

    cout << "a + b: ";
    print(add(a, b));

    cout << "a - b: ";
    print(subtract(a, b));

    cout << "a * b: ";
    print(multiply(a, b));

    return 0;
}