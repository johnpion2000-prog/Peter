#include <iostream>
#include <string>
#include <vector>
using namespace std;

class Book {
private:
    string title;
    string author;
    string isbn;
    int year;
    bool isAvailable;

public:
    Book(string t, string a, string i, int y) 
        : title(t), author(a), isbn(i), year(y), isAvailable(true) {}

    string getTitle() const { return title; }
    string getAuthor() const { return author; }
    string getISBN() const { return isbn; }
    int getYear() const { return year; }
    bool getAvailability() const { return isAvailable; }

    void borrow() {
        if (isAvailable) {
            isAvailable = false;
        }
    }

    void returnBook() {
        if (!isAvailable) {
            isAvailable = true;
        }
    }

    void displayInfo() const {
        cout << title << " by " << author << " (" << year << ")";
        cout << " - " << (isAvailable ? "Available" : "Borrowed") << endl;
    }
};

class Library {
private:
    string name;
    string address;
    vector<Book> books;

public:
    Library(string n, string addr) : name(n), address(addr) {}

    void addBook(const Book& book) {
        books.push_back(book);
    }

    void removeBook(const string& isbn) {
        for (size_t i = 0; i < books.size(); i++) {
            if (books[i].getISBN() == isbn) {
                books.erase(books.begin() + i);
                return;
            }
        }
    }

    Book* findBook(const string& title) {
        for (size_t i = 0; i < books.size(); i++) {
            if (books[i].getTitle() == title) {
                return &books[i];
            }
        }
        return nullptr;
    }

    void borrowBook(const string& isbn) {
        for (size_t i = 0; i < books.size(); i++) {
            if (books[i].getISBN() == isbn) {
                books[i].borrow();
                return;
            }
        }
    }

    void returnBook(const string& isbn) {
        for (size_t i = 0; i < books.size(); i++) {
            if (books[i].getISBN() == isbn) {
                books[i].returnBook();
                return;
            }
        }
    }

    void displayAllBooks() const {
        for (size_t i = 0; i < books.size(); i++) {
            books[i].displayInfo();
        }
    }

    void displayAvailableBooks() const {
        for (size_t i = 0; i < books.size(); i++) {
            if (books[i].getAvailability()) {
                books[i].displayInfo();
            }
        }
    }
};

int main() {
    Library library("City Library", "Main Street 123");

    Book book1("1984", "George Orwell", "12345", 1949);
    Book book2("Brave New World", "Aldous Huxley", "67890", 1932);
    Book book3("Fahrenheit 451", "Ray Bradbury", "11111", 1953);

    library.addBook(book1);
    library.addBook(book2);
    library.addBook(book3);

    cout << "All books:" << endl;
    library.displayAllBooks();

    cout << "\nBorrowing 1984:" << endl;
    library.borrowBook("12345");

    cout << "\nAvailable books:" << endl;
    library.displayAvailableBooks();

    cout << "\nReturning 1984:" << endl;
    library.returnBook("12345");

    cout << "\nAll books after return:" << endl;
    library.displayAllBooks();

    return 0;
}