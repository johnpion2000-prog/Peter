#include <iostream>
using namespace std;

int main() {
    while (true) {
        int N;
        cout << "Enter number of days (0 to exit): ";
        cin >> N;
        
        if (N <= 0) break;
        if (N > 1000) {
            cout << "Error: too many days!" << endl;
            continue;
        }

        double* temperatures = new double[N];
        double sum = 0.0;
        
        cout << "Enter temperatures for each day:" << endl;
        for (int i = 0; i < N; i++) {
            cout << "Day " << (i + 1) << ": ";
            cin >> temperatures[i];
            sum += temperatures[i];
        }

        double average_temp = sum / N;
        
        double min_temp = temperatures[0];
        double max_temp = temperatures[0];
        for (int i = 1; i < N; i++) {
            if (temperatures[i] < min_temp)
                min_temp = temperatures[i];
            if (temperatures[i] > max_temp)
                max_temp = temperatures[i];
        }

        int days_below_average = 0;
        for (int i = 0; i < N; i++) {
            if (temperatures[i] < average_temp)
                days_below_average++;
        }

        cout << "\nResults:" << endl;
        cout << "Average temperature: " << average_temp << "C" << endl;
        cout << "Minimum temperature: " << min_temp << "C" << endl;
        cout << "Maximum temperature: " << max_temp << "C" << endl;
        cout << "Days below average: " << days_below_average << endl << endl;

        delete[] temperatures;
    }
    
    return 0;
}