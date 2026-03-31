#include <iostream>
using namespace std;

void swapValuesByValue(int a, int b) {
    int tmp = a;
    a = b;
    b = tmp;
    cout << "Inside function: a=" << a << ", b=" << b << '\n';
}

void swapValuesByPointer(int* a, int* b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

void swapValuesByReference(int& a, int& b) {
    int tmp = a;
    a = b;
    b = tmp;
}

int main() {
    int x = 5, y = 10;

    cout << "Initial values: x=" << x << ", y=" << y << "\n\n";

    cout << "----- swapValuesByValue(x, y) -----\n";
    swapValuesByValue(x, y);
    cout << "After call: x=" << x << ", y=" << y << "\n\n";

    x = 5; y = 10;
    cout << "----- swapValuesByPointer(&x, &y) -----\n";
    swapValuesByPointer(&x, &y);
    cout << "After call: x=" << x << ", y=" << y << "\n\n";

    x = 5; y = 10;
    cout << "----- swapValuesByReference(x, y) -----\n";
    swapValuesByReference(x, y);
    cout << "After call: x=" << x << ", y=" << y << '\n';

    return 0;
}