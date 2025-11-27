#include <iostream>
using namespace std;

void arrayInfo(int* arr, int size) {
    cout << "Array size: " << size << endl;
    
    int sum = 0;
    for (int i = 0; i < size; i++) {
        sum += *(arr + i);
    }
    cout << "Sum of elements: " << sum << endl;
    
    cout << "First element: " << *arr << endl;
    cout << "Last element: " << *(arr + size - 1) << endl;
    cout << endl;
}

int main() {
    int arr1[] = {1, 2, 3, 4, 5};
    int arr2[] = {10, 20, 30, 40, 50, 60, 70};
    
    cout << "Array 1:\n";
    arrayInfo(arr1, 5);
    
    cout << "Array 2:\n";
    arrayInfo(arr2, 7);
    
    return 0;
}