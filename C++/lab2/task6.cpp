#include <iostream>
using namespace std;

int main() {
    const int SIZE = 10;
    int arr1[SIZE];
    int arr2[SIZE];
    
    // Fill array with Fibonacci sequence using pointers
    int* ptr = arr1;
    *ptr = 0;
    *(ptr + 1) = 1;
    
    for (int* p = ptr + 2; p < ptr + SIZE; p++) {
        *p = *(p - 1) + *(p - 2);
    }
    
    // Display original array
    cout << "Fibonacci array: ";
    for (int* p = arr1; p < arr1 + SIZE; p++) {
        cout << *p << " ";
    }
    cout << endl;
    
    // Calculate sum using pointers
    int sum = 0;
    for (int* p = arr1; p < arr1 + SIZE; p++) {
        sum += *p;
    }
    cout << "Sum of elements: " << sum << endl;
    
    // Find minimum element using pointers
    int* minPtr = arr1;
    for (int* p = arr1 + 1; p < arr1 + SIZE; p++) {
        if (*p < *minPtr) {
            minPtr = p;
        }
    }
    cout << "Minimum element: " << *minPtr << endl;
    
    // Copy array in reverse order using pointers
    int* src = arr1 + SIZE - 1;
    int* dest = arr2;
    
    for (int i = 0; i < SIZE; i++) {
        *dest = *src;
        src--;
        dest++;
    }
    
    // Display reversed array
    cout << "Reversed array: ";
    for (int* p = arr2; p < arr2 + SIZE; p++) {
        cout << *p << " ";
    }
    cout << endl;
    
    return 0;
}