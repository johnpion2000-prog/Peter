#include <iostream>
#include <string>
using namespace std;

struct Book {
    string title;
    string author;
    int year;
    double price;
};

void sortBooksByYear(Book* books, int size) {
    for (int i = 0; i < size - 1; i++) {
        for (int j = 0; j < size - i - 1; j++) {
            if ((books + j)->year > (books + j + 1)->year) {
                Book temp = *(books + j);
                *(books + j) = *(books + j + 1);
                *(books + j + 1) = temp;
            }
        }
    }
}

Book* findBookByAuthor(Book* books, int size, const string& author) {
    for (int i = 0; i < size; i++) {
        if ((books + i)->author == author) {
            return books + i;
        }
    }
    return nullptr;
}

void printBooks(Book* books, int size) {
    for (int i = 0; i < size; i++) {
        cout << "Title: " << (books + i)->title << endl;
        cout << "Author: " << (books + i)->author << endl;
        cout << "Year: " << (books + i)->year << endl;
        cout << "Price: $" << (books + i)->price << endl;
        cout << "-------------------" << endl;
    }
}

int main() {
    const int SIZE = 5;
    Book* books = new Book[SIZE];
    
    // Initialize books
    books[0] = {"The C++ Programming Language", "Bjarne Stroustrup", 2013, 89.99};
    books[1] = {"Clean Code", "Robert Martin", 2008, 45.50};
    books[2] = {"Design Patterns", "Erich Gamma", 1994, 55.75};
    books[3] = {"The Pragmatic Programmer", "Andrew Hunt", 1999, 42.25};
    books[4] = {"Refactoring", "Martin Fowler", 2018, 52.99};
    
    cout << "Original books:" << endl;
    printBooks(books, SIZE);
    
    // Sort books by year
    sortBooksByYear(books, SIZE);
    cout << "\nBooks sorted by year:" << endl;
    printBooks(books, SIZE);
    
    // Search for books by author
    cout << "\nSearching for books by author:" << endl;
    
    Book* foundBook = findBookByAuthor(books, SIZE, "Robert Martin");
    if (foundBook != nullptr) {
        cout << "Found: " << foundBook->title << " (" << foundBook->year << ")" << endl;
    } else {
        cout << "Book not found!" << endl;
    }
    
    foundBook = findBookByAuthor(books, SIZE, "Unknown Author");
    if (foundBook != nullptr) {
        cout << "Found: " << foundBook->title << endl;
    } else {
        cout << "Book by Unknown Author not found!" << endl;
    }
    
    delete[] books;
    return 0;
}