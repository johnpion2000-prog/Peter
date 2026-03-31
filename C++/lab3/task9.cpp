#include <iostream>
#include <vector>
#include <stdexcept>
#include <string>
using namespace std;

template<typename T>
class Stack {
private:
    vector<T> elements;
    int capacity;

public:
    Stack(int size = 10) : capacity(size) {}
    
    void push(const T& element) {
        if (isFull()) {
            throw overflow_error("Stack full");
        }
        elements.push_back(element);
    }
    
    T pop() {
        if (isEmpty()) {
            throw underflow_error("Stack empty");
        }
        T topElement = elements.back();
        elements.pop_back();
        return topElement;
    }
    
    T top() const {
        if (isEmpty()) {
            throw underflow_error("Stack empty");
        }
        return elements.back();
    }
    
    bool isEmpty() const {
        return elements.empty();
    }
    
    bool isFull() const {
        return elements.size() >= capacity;
    }
    
    int size() const {
        return elements.size();
    }
    
    void display() const {
        for (const auto& elem : elements) {
            cout << elem << " ";
        }
        cout << endl;
    }
};

template<typename T>
class Queue {
private:
    vector<T> elements;
    int capacity;

public:
    Queue(int size = 10) : capacity(size) {}
    
    void enqueue(const T& element) {
        if (isFull()) {
            throw overflow_error("Queue full");
        }
        elements.push_back(element);
    }
    
    T dequeue() {
        if (isEmpty()) {
            throw underflow_error("Queue empty");
        }
        T frontElement = elements.front();
        elements.erase(elements.begin());
        return frontElement;
    }
    
    T front() const {
        if (isEmpty()) {
            throw underflow_error("Queue empty");
        }
        return elements.front();
    }
    
    bool isEmpty() const {
        return elements.empty();
    }
    
    bool isFull() const {
        return elements.size() >= capacity;
    }
    
    int size() const {
        return elements.size();
    }
    
    void display() const {
        for (const auto& elem : elements) {
            cout << elem << " ";
        }
        cout << endl;
    }
};

int main() {
    Stack<int> intStack(3);
    intStack.push(1);
    intStack.push(2);
    intStack.push(3);
    cout << "Stack: ";
    intStack.display();
    cout << "Top: " << intStack.top() << endl;
    cout << "Pop: " << intStack.pop() << endl;
    cout << "Stack: ";
    intStack.display();

    Queue<string> stringQueue(2);
    stringQueue.enqueue("hello");
    stringQueue.enqueue("world");
    cout << "Queue: ";
    stringQueue.display();
    cout << "Front: " << stringQueue.front() << endl;
    cout << "Dequeue: " << stringQueue.dequeue() << endl;
    cout << "Queue: ";
    stringQueue.display();

    return 0;
}