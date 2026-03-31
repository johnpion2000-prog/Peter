#include <iostream>
#include <string>
using namespace std;

struct Book {
    string title;
    string author;
    int year;
    double price;
};

void printBooks(Book* books, int size) {
    cout << "\nLibrary Catalog:\n";
    for (int i = 0; i < size; i++) {
        cout << "Book " << i + 1 << ":\n";
        cout << "  Title: " << books[i].title << endl;
        cout << "  Author: " << books[i].author << endl;
        cout << "  Year: " << books[i].year << endl;
        cout << "  Price: $" << books[i].price << endl;
        cout << endl;
    }
}

void findMostExpensiveBook(Book* books, int size) {
    if (size == 0) {
        cout << "No books in the library.\n";
        return;
    }
    
    int mostExpensiveIndex = 0;
    for (int i = 1; i < size; i++) {
        if (books[i].price > books[mostExpensiveIndex].price) {
            mostExpensiveIndex = i;
        }
    }
    
    cout << "Most expensive book:\n";
    cout << "Title: " << books[mostExpensiveIndex].title << endl;
    cout << "Author: " << books[mostExpensiveIndex].author << endl;
    cout << "Year: " << books[mostExpensiveIndex].year << endl;
    cout << "Price: $" << books[mostExpensiveIndex].price << endl;
}

int main() {
    int N;
    cout << "Enter the number of books in the library: ";
    cin >> N;
    
    if (N <= 0) {
        cout << "Invalid number of books.\n";
        return 1;
    }
    
    Book* books = new Book[N];
    
    cout << "\nEnter book details:\n";
    for (int i = 0; i < N; i++) {
        cout << "\nBook " << i + 1 << ":\n";
        
        cout << "Title: ";
        cin.ignore();
        getline(cin, books[i].title);
        
        cout << "Author: ";
        getline(cin, books[i].author);
        
        cout << "Year: ";
        cin >> books[i].year;
        
        cout << "Price: $";
        cin >> books[i].price;
    }
    
    printBooks(books, N);
    findMostExpensiveBook(books, N);
    
    delete[] books;
    
    return 0;
}