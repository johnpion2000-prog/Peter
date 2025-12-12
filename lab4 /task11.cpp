#include <iostream>
#include <string>
#include <vector>
#include <fstream>
#include <chrono>
#include <iomanip>
#include <sstream>
#include <stdexcept>
#include <cmath>
#include <limits>

// ============================================================================
// LOGGER CLASS (Singleton with debug support)
// ============================================================================

class Logger {
private:
    std::ofstream logFile;
    static Logger* instance;
    
    // Private constructor for singleton
    Logger() {
        logFile.open("app_log.txt", std::ios::app);
        if (logFile.is_open()) {
            logFile << "=== Application Started ===\n";
        }
    }
    
public:
    // Delete copy constructor and assignment operator
    Logger(const Logger&) = delete;
    Logger& operator=(const Logger&) = delete;
    
    // Singleton access
    static Logger& getInstance() {
        if (!instance) {
            instance = new Logger();
        }
        return *instance;
    }
    
    // Log methods
    void info(const std::string& message) {
        auto now = std::chrono::system_clock::now();
        auto time = std::chrono::system_clock::to_time_t(now);
        
        std::stringstream ss;
        ss << "[INFO] " << std::put_time(std::localtime(&time), "%Y-%m-%d %H:%M:%S") 
           << " - " << message;
        
        std::cout << "\033[32m" << ss.str() << "\033[0m" << std::endl;
        if (logFile.is_open()) {
            logFile << ss.str() << std::endl;
        }
    }
    
    void error(const std::string& message) {
        auto now = std::chrono::system_clock::now();
        auto time = std::chrono::system_clock::to_time_t(now);
        
        std::stringstream ss;
        ss << "[ERROR] " << std::put_time(std::localtime(&time), "%Y-%m-%d %H:%M:%S") 
           << " - " << message;
        
        std::cerr << "\033[31m" << ss.str() << "\033[0m" << std::endl;
        if (logFile.is_open()) {
            logFile << ss.str() << std::endl;
        }
    }
    
    void debug(const std::string& message) {
        #ifdef DEBUG_MODE
        auto now = std::chrono::system_clock::now();
        auto time = std::chrono::system_clock::to_time_t(now);
        
        std::stringstream ss;
        ss << "[DEBUG] " << std::put_time(std::localtime(&time), "%Y-%m-%d %H:%M:%S") 
           << " - " << message;
        
        std::cout << "\033[33m" << ss.str() << "\033[0m" << std::endl;
        if (logFile.is_open()) {
            logFile << ss.str() << std::endl;
        }
        #endif
    }
    
    ~Logger() {
        if (logFile.is_open()) {
            logFile << "=== Application Ended ===\n";
            logFile.close();
        }
        if (instance) {
            delete instance;
            instance = nullptr;
        }
    }
};

// Initialize static instance
Logger* Logger::instance = nullptr;

// Debug macro (only active when DEBUG_MODE is defined)
#ifdef DEBUG_MODE
    #define DEBUG_LOG(msg) Logger::getInstance().debug(msg)
#else
    #define DEBUG_LOG(msg) do {} while(0)
#endif

// ============================================================================
// CALCULATOR CLASS
// ============================================================================

class Calculator {
public:
    // Basic operations
    double add(double a, double b) {
        DEBUG_LOG("Calculator::add called with " + std::to_string(a) + " + " + std::to_string(b));
        return a + b;
    }
    
    double subtract(double a, double b) {
        DEBUG_LOG("Calculator::subtract called with " + std::to_string(a) + " - " + std::to_string(b));
        return a - b;
    }
    
    double multiply(double a, double b) {
        DEBUG_LOG("Calculator::multiply called with " + std::to_string(a) + " * " + std::to_string(b));
        return a * b;
    }
    
    double divide(double a, double b) {
        DEBUG_LOG("Calculator::divide called with " + std::to_string(a) + " / " + std::to_string(b));
        validateDivision(b);
        return a / b;
    }
    
    // Advanced operations
    double power(double base, int exponent) {
        DEBUG_LOG("Calculator::power called with base=" + std::to_string(base) + 
                  ", exponent=" + std::to_string(exponent));
        
        if (exponent == 0) return 1.0;
        
        double result = 1.0;
        bool negativeExponent = exponent < 0;
        exponent = std::abs(exponent);
        
        for (int i = 0; i < exponent; ++i) {
            result *= base;
            DEBUG_LOG("Iteration " + std::to_string(i+1) + ": result = " + std::to_string(result));
        }
        
        return negativeExponent ? 1.0 / result : result;
    }
    
    double factorial(int n) {
        DEBUG_LOG("Calculator::factorial called with n=" + std::to_string(n));
        validateFactorial(n);
        
        double result = 1.0;
        for (int i = 2; i <= n; ++i) {
            result *= i;
            DEBUG_LOG("Factorial progress: " + std::to_string(i) + "! = " + std::to_string(result));
        }
        
        return result;
    }
    
    double average(const std::vector<double>& numbers) {
        DEBUG_LOG("Calculator::average called with " + std::to_string(numbers.size()) + " numbers");
        
        if (numbers.empty()) {
            Logger::getInstance().error("Attempt to calculate average of empty vector");
            return 0.0;
        }
        
        double sum = 0.0;
        for (size_t i = 0; i < numbers.size(); ++i) {
            sum += numbers[i];
            DEBUG_LOG("Adding number[" + std::to_string(i) + "] = " + std::to_string(numbers[i]) + 
                      ", sum = " + std::to_string(sum));
        }
        
        return sum / numbers.size();
    }
    
    // Function with intentional bug for debugging practice
    double buggyFunction(int value) {
        DEBUG_LOG("Entering buggyFunction with value = " + std::to_string(value));
        
        // INTENTIONAL BUG: uninitialized variable
        double result;
        
        if (value > 0) {
            result = value * 2.0;
            DEBUG_LOG("Positive path: result = " + std::to_string(result));
        } 
        // MISSING else clause - result might be uninitialized!
        
        // ANOTHER BUG: possible division by zero
        double divisor = value - 5;
        if (divisor != 0) {
            result = result / divisor;
        }
        
        DEBUG_LOG("Exiting buggyFunction with result = " + std::to_string(result));
        return result;
    }
    
private:
    void validateDivision(double divisor) {
        if (std::abs(divisor) < std::numeric_limits<double>::epsilon()) {
            std::string error = "Division by zero attempted";
            Logger::getInstance().error(error);
            throw std::runtime_error(error);
        }
    }
    
    void validateFactorial(int n) {
        if (n < 0) {
            std::string error = "Factorial of negative number attempted: " + std::to_string(n);
            Logger::getInstance().error(error);
            throw std::runtime_error(error);
        }
        if (n > 20) {
            std::string warning = "Large factorial may cause precision loss: " + std::to_string(n);
            Logger::getInstance().error(warning);
        }
    }
};

// ============================================================================
// DEMONSTRATION FUNCTIONS
// ============================================================================

void demonstrateBasicOperations() {
    Logger::getInstance().info("=== Demonstrating Basic Operations ===");
    
    Calculator calc;
    
    try {
        double result = calc.add(10.5, 20.3);
        std::cout << "10.5 + 20.3 = " << result << std::endl;
        
        result = calc.multiply(5.5, 2.0);
        std::cout << "5.5 * 2.0 = " << result << std::endl;
        
        result = calc.divide(100.0, 4.0);
        std::cout << "100.0 / 4.0 = " << result << std::endl;
        
        // This will throw an exception
        result = calc.divide(10.0, 0.0);
        std::cout << "10.0 / 0.0 = " << result << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "Exception caught: " << e.what() << std::endl;
    }
}

void demonstratePowerFunction() {
    Logger::getInstance().info("=== Demonstrating Power Function ===");
    
    Calculator calc;
    
    std::cout << "2^5 = " << calc.power(2, 5) << std::endl;
    std::cout << "3^-2 = " << calc.power(3, -2) << std::endl;
    std::cout << "5^0 = " << calc.power(5, 0) << std::endl;
}

void demonstrateFactorial() {
    Logger::getInstance().info("=== Demonstrating Factorial ===");
    
    Calculator calc;
    
    try {
        std::cout << "5! = " << calc.factorial(5) << std::endl;
        std::cout << "10! = " << calc.factorial(10) << std::endl;
        
        // This will throw an exception
        std::cout << "(-5)! = " << calc.factorial(-5) << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "Exception caught: " << e.what() << std::endl;
    }
}

void demonstrateAverage() {
    Logger::getInstance().info("=== Demonstrating Average Calculation ===");
    
    Calculator calc;
    
    std::vector<double> numbers = {1.5, 2.5, 3.5, 4.5, 5.5};
    double avg = calc.average(numbers);
    std::cout << "Average of {1.5, 2.5, 3.5, 4.5, 5.5} = " << avg << std::endl;
    
    // Empty vector case
    std::vector<double> empty;
    avg = calc.average(empty);
    std::cout << "Average of empty vector = " << avg << std::endl;
}

void debugBuggyFunction() {
    Logger::getInstance().info("=== Debugging Buggy Function ===");
    
    Calculator calc;
    
    std::cout << "\nTesting buggyFunction with various inputs:\n";
    
    // This should work
    std::cout << "buggyFunction(10) = " << calc.buggyFunction(10) << std::endl;
    
    // This might crash or produce unexpected results (division by zero)
    std::cout << "buggyFunction(5) = " << calc.buggyFunction(5) << std::endl;
    
    // This might show uninitialized value
    std::cout << "buggyFunction(1) = " << calc.buggyFunction(1) << std::endl;
    
    // Negative value - definitely uninitialized
    std::cout << "buggyFunction(-3) = " << calc.buggyFunction(-3) << std::endl;
}

void demonstrateMemoryIssue() {
    Logger::getInstance().info("=== Demonstrating Potential Memory Issue ===");
    
    // Example of a potential memory issue (not a real leak in this case)
    int* array = new int[10];
    
    for (int i = 0; i < 10; ++i) {
        array[i] = i * i;
    }
    
    std::cout << "Array[5] = " << array[5] << std::endl;
    
    // Forgetting to delete - would be a memory leak
    // delete[] array; // INTENTIONALLY COMMENTED OUT FOR DEBUGGING PRACTICE
    
    // Uncomment the line above to fix the memory leak
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

int main(int argc, char* argv[]) {
    std::cout << "=== C++11 Debugging Demo Application ===\n" << std::endl;
    
    Logger::getInstance().info("Application started");
    
    // Check for command line arguments
    bool runBuggyFunction = false;
    bool runMemoryDemo = false;
    
    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--buggy") {
            runBuggyFunction = true;
        } else if (arg == "--memory") {
            runMemoryDemo = true;
        } else if (arg == "--help") {
            std::cout << "\nUsage: " << argv[0] << " [options]\n";
            std::cout << "Options:\n";
            std::cout << "  --buggy    Run buggy function demonstrations\n";
            std::cout << "  --memory   Run memory demonstration\n";
            std::cout << "  --help     Show this help message\n";
            return 0;
        }
    }
    
    // Run demonstrations
    try {
        demonstrateBasicOperations();
        demonstratePowerFunction();
        demonstrateFactorial();
        demonstrateAverage();
        
        if (runBuggyFunction) {
            debugBuggyFunction();
        }
        
        if (runMemoryDemo) {
            demonstrateMemoryIssue();
        }
        
    } catch (const std::exception& e) {
        Logger::getInstance().error("Unhandled exception: " + std::string(e.what()));
        return 1;
    }
    
    Logger::getInstance().info("Application finished successfully");
    
    std::cout << "\n=== Program Complete ===" << std::endl;
    std::cout << "Check 'app_log.txt' for detailed logs" << std::endl;
    
    #ifdef DEBUG_MODE
    std::cout << "\n[Note: Debug mode is active]" << std::endl;
    #endif
    
    return 0;
}