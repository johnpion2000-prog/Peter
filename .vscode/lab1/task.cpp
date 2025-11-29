#include <iostream>
#include <cmath>
#include <bitset>
#include <string>
#include <iomanip>
using namespace std;

// Basic Arithmetic Operations
double add(double a, double b) {
    return a + b;
}

double subtract(double a, double b) {
    return a - b;
}

double multiply(double a, double b) {
    return a * b;
}

double divide(double a, double b) {
    if (b != 0) {
        return a / b;
    } else {
        cout << "Error: Division by zero!" << endl;
        return 0;
    }
}

// Renamed to avoid conflict with std::modulus
double modulusOperation(int a, int b) {
    if (b != 0) {
        return a % b;
    } else {
        cout << "Error: Modulus by zero!" << endl;
        return 0;
    }
}

// Scientific Operations
double power(double base, double exponent) {
    return pow(base, exponent);
}

double squareRoot(double a) {
    if (a >= 0) {
        return sqrt(a);
    } else {
        cout << "Error: Square root of negative number!" << endl;
        return 0;
    }
}

double logarithm(double a) {
    if (a > 0) {
        return log(a);
    } else {
        cout << "Error: Logarithm of non-positive number!" << endl;
        return 0;
    }
}

double sine(double a) {
    return sin(a * M_PI / 180.0); // Convert to radians
}

double cosine(double a) {
    return cos(a * M_PI / 180.0); // Convert to radians
}

double tangent(double a) {
    double rad = a * M_PI / 180.0;
    // Check for undefined tangent values (90°, 270°, etc.)
    if (fabs(cos(rad)) < 1e-10) {
        cout << "Error: Tangent undefined for " << a << " degrees!" << endl;
        return 0;
    }
    return tan(rad);
}

// Number System Conversions
string decimalToBinary(int n) {
    if (n == 0) return "0";
    
    string binary = "";
    bool isNegative = false;
    unsigned int num;
    
    // Handle negative numbers
    if (n < 0) {
        isNegative = true;
        num = -n;
    } else {
        num = n;
    }
    
    // Convert to binary
    while (num > 0) {
        binary = to_string(num % 2) + binary;
        num = num / 2;
    }
    
    if (isNegative) {
        binary = "-" + binary;
    }
    
    return binary;
}

string decimalToHexadecimal(int n) {
    if (n == 0) return "0";
    
    string hex = "";
    bool isNegative = false;
    unsigned int num;
    
    if (n < 0) {
        isNegative = true;
        num = -n;
    } else {
        num = n;
    }
    
    while (num > 0) {
        int remainder = num % 16;
        if (remainder < 10) {
            hex = to_string(remainder) + hex;
        } else {
            hex = char('A' + (remainder - 10)) + hex;
        }
        num = num / 16;
    }
    
    if (isNegative) {
        hex = "-" + hex;
    }
    
    return hex;
}

int binaryToDecimal(string binaryStr) {
    int decimal = 0;
    int base = 1;
    bool isNegative = false;
    
    // Check for negative binary (first character is '-')
    if (!binaryStr.empty() && binaryStr[0] == '-') {
        isNegative = true;
        binaryStr = binaryStr.substr(1); // Remove the '-' sign
    }
    
    // Use size_t for string indices to avoid signedness warnings
    for (size_t i = binaryStr.length(); i > 0; i--) {
        size_t index = i - 1;
        if (binaryStr[index] == '1') {
            decimal += base;
        } else if (binaryStr[index] != '0') {
            cout << "Error: Invalid binary digit '" << binaryStr[index] << "'" << endl;
            return 0;
        }
        base = base * 2;
    }
    
    if (isNegative) {
        decimal = -decimal;
    }
    
    return decimal;
}

int hexadecimalToDecimal(string hexStr) {
    int decimal = 0;
    int base = 1;
    bool isNegative = false;
    
    // Check for negative hexadecimal
    if (!hexStr.empty() && hexStr[0] == '-') {
        isNegative = true;
        hexStr = hexStr.substr(1); // Remove the '-' sign
    }
    
    // Use size_t for string indices to avoid signedness warnings
    for (size_t i = hexStr.length(); i > 0; i--) {
        size_t index = i - 1;
        char c = toupper(hexStr[index]); // Convert to uppercase for consistency
        if (c >= '0' && c <= '9') {
            decimal += (c - '0') * base;
        } else if (c >= 'A' && c <= 'F') {
            decimal += (c - 'A' + 10) * base;
        } else {
            cout << "Error: Invalid hexadecimal digit '" << hexStr[index] << "'" << endl;
            return 0;
        }
        base = base * 16;
    }
    
    if (isNegative) {
        decimal = -decimal;
    }
    
    return decimal;
}

// Display Functions
void displayMenu() {
    cout << "\n" << string(50, '=') << endl;
    cout << "           SCIENTIFIC CALCULATOR" << endl;
    cout << string(50, '=') << endl;
    cout << "1. Basic Arithmetic Operations" << endl;
    cout << "2. Scientific Operations" << endl;
    cout << "3. Number System Conversions" << endl;
    cout << "4. Exit" << endl;
    cout << string(50, '=') << endl;
}

void displayBasicOperations() {
    cout << "\nBasic Operations:" << endl;
    cout << "1. Addition (+)" << endl;
    cout << "2. Subtraction (-)" << endl;
    cout << "3. Multiplication (*)" << endl;
    cout << "4. Division (/)" << endl;
    cout << "5. Modulus (%)" << endl;
    cout << "6. Back to Main Menu" << endl;
}

void displayScientificOperations() {
    cout << "\nScientific Operations:" << endl;
    cout << "1. Power (a^b)" << endl;
    cout << "2. Square Root (√)" << endl;
    cout << "3. Logarithm (ln)" << endl;
    cout << "4. Sine (sin)" << endl;
    cout << "5. Cosine (cos)" << endl;
    cout << "6. Tangent (tan)" << endl;
    cout << "7. Back to Main Menu" << endl;
}

void displayConversionOperations() {
    cout << "\nNumber System Conversions:" << endl;
    cout << "1. Decimal to Binary" << endl;
    cout << "2. Decimal to Hexadecimal" << endl;
    cout << "3. Binary to Decimal" << endl;
    cout << "4. Hexadecimal to Decimal" << endl;
    cout << "5. Back to Main Menu" << endl;
}

int main() {
    int choice;
    double a, b, result;
    int intA, intB;
    string binaryStr, hexStr;
    
    cout << "Welcome to Scientific Calculator!" << endl;
    
    while (true) {
        displayMenu();
        cout << "Enter your choice (1-4): ";
        cin >> choice;
        
        if (choice == 4) {
            cout << "Thank you for using the calculator. Goodbye!" << endl;
            break;
        }
        
        switch (choice) {
            case 1: // Basic Operations
                {
                    int basicChoice;
                    do {
                        displayBasicOperations();
                        cout << "Enter operation choice (1-6): ";
                        cin >> basicChoice;
                        
                        if (basicChoice == 6) break;
                        
                        if (basicChoice == 5) { // Modulus requires integers
                            cout << "Enter first number (integer): ";
                            cin >> intA;
                            cout << "Enter second number (integer): ";
                            cin >> intB;
                        } else {
                            cout << "Enter first number: ";
                            cin >> a;
                            cout << "Enter second number: ";
                            cin >> b;
                        }
                        
                        switch (basicChoice) {
                            case 1:
                                result = add(a, b);
                                cout << a << " + " << b << " = " << result << endl;
                                break;
                            case 2:
                                result = subtract(a, b);
                                cout << a << " - " << b << " = " << result << endl;
                                break;
                            case 3:
                                result = multiply(a, b);
                                cout << a << " * " << b << " = " << result << endl;
                                break;
                            case 4:
                                result = divide(a, b);
                                if (b != 0) {
                                    cout << a << " / " << b << " = " << result << endl;
                                }
                                break;
                            case 5:
                                result = modulusOperation(intA, intB);
                                if (intB != 0) {
                                    cout << intA << " % " << intB << " = " << static_cast<int>(result) << endl;
                                }
                                break;
                            default:
                                cout << "Invalid choice!" << endl;
                        }
                    } while (basicChoice != 6);
                }
                break;
                
            case 2: // Scientific Operations
                {
                    int scientificChoice;
                    do {
                        displayScientificOperations();
                        cout << "Enter operation choice (1-7): ";
                        cin >> scientificChoice;
                        
                        if (scientificChoice == 7) break;
                        
                        if (scientificChoice == 1) { // Power needs two inputs
                            cout << "Enter base: ";
                            cin >> a;
                            cout << "Enter exponent: ";
                            cin >> b;
                        } else {
                            cout << "Enter number: ";
                            cin >> a;
                        }
                        
                        switch (scientificChoice) {
                            case 1:
                                result = power(a, b);
                                cout << a << "^" << b << " = " << result << endl;
                                break;
                            case 2:
                                result = squareRoot(a);
                                if (a >= 0) {
                                    cout << "√" << a << " = " << result << endl;
                                }
                                break;
                            case 3:
                                result = logarithm(a);
                                if (a > 0) {
                                    cout << "ln(" << a << ") = " << result << endl;
                                }
                                break;
                            case 4:
                                result = sine(a);
                                cout << "sin(" << a << "°) = " << fixed << setprecision(4) << result << endl;
                                cout.unsetf(ios::fixed); // Reset formatting
                                break;
                            case 5:
                                result = cosine(a);
                                cout << "cos(" << a << "°) = " << fixed << setprecision(4) << result << endl;
                                cout.unsetf(ios::fixed);
                                break;
                            case 6:
                                result = tangent(a);
                                if (fabs(cos(a * M_PI / 180.0)) > 1e-10) { // Check if tangent is defined
                                    cout << "tan(" << a << "°) = " << fixed << setprecision(4) << result << endl;
                                    cout.unsetf(ios::fixed);
                                }
                                break;
                            default:
                                cout << "Invalid choice!" << endl;
                        }
                    } while (scientificChoice != 7);
                }
                break;
                
            case 3: // Number System Conversions
                {
                    int conversionChoice;
                    do {
                        displayConversionOperations();
                        cout << "Enter conversion choice (1-5): ";
                        cin >> conversionChoice;
                        
                        if (conversionChoice == 5) break;
                        
                        switch (conversionChoice) {
                            case 1:
                                cout << "Enter decimal number: ";
                                cin >> intA;
                                cout << "Decimal " << intA << " in binary: " << decimalToBinary(intA) << endl;
                                break;
                            case 2:
                                cout << "Enter decimal number: ";
                                cin >> intA;
                                cout << "Decimal " << intA << " in hexadecimal: " << decimalToHexadecimal(intA) << endl;
                                break;
                            case 3:
                                cout << "Enter binary number: ";
                                cin >> binaryStr;
                                cout << "Binary " << binaryStr << " in decimal: " << binaryToDecimal(binaryStr) << endl;
                                break;
                            case 4:
                                cout << "Enter hexadecimal number: ";
                                cin >> hexStr;
                                cout << "Hexadecimal " << hexStr << " in decimal: " << hexadecimalToDecimal(hexStr) << endl;
                                break;
                            default:
                                cout << "Invalid choice!" << endl;
                        }
                    } while (conversionChoice != 5);
                }
                break;
                
            default:
                cout << "Invalid choice! Please enter 1-4." << endl;
        }
    }
    
    return 0;
}