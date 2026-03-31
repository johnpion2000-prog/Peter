#include <iostream>
using namespace std;

int stringLength(const char* str) {
    int length = 0;
    while (str[length] != '\0') {
        length++;
    }
    return length;
}

void reverseString(char* str) {
    int length = stringLength(str);
    for (int i = 0; i < length / 2; i++) {
        char temp = str[i];
        str[i] = str[length - 1 - i];
        str[length - 1 - i] = temp;
    }
}

int countCharacter(const char* str, char target) {
    int count = 0;
    int i = 0;
    while (str[i] != '\0') {
        if (str[i] == target) {
            count++;
        }
        i++;
    }
    return count;
}

int main() {
    const int MAX_SIZE = 100;
    char inputString[MAX_SIZE];
    char searchChar;
    
    cout << "Enter a string: ";
    cin.getline(inputString, MAX_SIZE);
    
    int length = stringLength(inputString);
    cout << "String length: " << length << endl;
    
    cout << "Original string: " << inputString << endl;
    reverseString(inputString);
    cout << "Reversed string: " << inputString << endl;
    
    cout << "Enter a character to count: ";
    cin >> searchChar;
    
    int charCount = countCharacter(inputString, searchChar);
    cout << "Character '" << searchChar << "' appears " << charCount << " times." << endl;
    
    return 0;
}