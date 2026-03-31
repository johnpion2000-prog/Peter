#include <iostream>
#include <thread>
#include <vector>
#include <queue>
#include <future>
#include <functional>
#include <mutex>
#include <condition_variable>
#include <atomic>
#include <chrono>

class ThreadPool {
private:
    // Рабочие потоки
    std::vector<std::thread> workers;
    
    // Очередь задач
    std::queue<std::function<void()>> tasks;
    
    // Синхронизация
    std::mutex queue_mutex;
    std::condition_variable condition;
    
    // Флаг остановки пула
    bool stop = false;
    
    // Счетчик активных задач
    std::atomic<int> active_tasks{0};
    
    // Функция, которую выполняет каждый рабочий поток
    void worker_function() {
        while (true) {
            std::function<void()> task;
            
            {
                // Захватываем мьютекс для безопасного доступа к очереди
                std::unique_lock<std::mutex> lock(queue_mutex);
                
                // Ждем, пока появится задача или не придет сигнал остановки
                condition.wait(lock, [this]() {
                    return stop || !tasks.empty();
                });
                
                // Если пул остановлен и задач нет, завершаем поток
                if (stop && tasks.empty()) {
                    return;
                }
                
                // Берем задачу из очереди
                task = std::move(tasks.front());
                tasks.pop();
                
                // Увеличиваем счетчик активных задач
                active_tasks++;
            }
            
            // Выполняем задачу (без блокировки мьютекса)
            task();
            
            // Уменьшаем счетчик активных задач
            active_tasks--;
        }
    }
    
public:
    // Конструктор создает указанное количество рабочих потоков
    ThreadPool(size_t num_threads) {
        // Создаем рабочие потоки
        for (size_t i = 0; i < num_threads; ++i) {
            workers.emplace_back(&ThreadPool::worker_function, this);
        }
        
        std::cout << "ThreadPool created with " << num_threads << " threads" << std::endl;
    }
    
    // Метод для добавления задачи в пул
    template<class F, class... Args>
    auto submit(F&& f, Args&&... args) -> std::future<decltype(f(args...))> {
        // Создаем packaged_task из переданной функции и аргументов
        using return_type = decltype(f(args...));
        
        auto task = std::make_shared<std::packaged_task<return_type()>>(
            std::bind(std::forward<F>(f), std::forward<Args>(args)...)
        );
        
        // Получаем future для получения результата задачи
        std::future<return_type> result = task->get_future();
        
        {
            // Захватываем мьютекс для безопасного добавления задачи в очередь
            std::lock_guard<std::mutex> lock(queue_mutex);
            
            // Проверяем, не остановлен ли пул
            if (stop) {
                throw std::runtime_error("Cannot submit task to stopped ThreadPool");
            }
            
            // Добавляем задачу в очередь в виде лямбда-функции
            tasks.emplace([task]() {
                (*task)();
            });
        }
        
        // Уведомляем один из ожидающих потоков о новой задаче
        condition.notify_one();
        
        return result;
    }
    
    // Метод для ожидания завершения всех задач
    void wait_all() {
        while (true) {
            std::unique_lock<std::mutex> lock(queue_mutex);
            if (tasks.empty() && active_tasks == 0) {
                break;
            }
            lock.unlock();
            std::this_thread::sleep_for(std::chrono::milliseconds(10));
        }
    }
    
    // Деструктор корректно завершает пул
    ~ThreadPool() {
        {
            std::lock_guard<std::mutex> lock(queue_mutex);
            stop = true;
        }
        
        // Уведомляем все потоки о необходимости завершиться
        condition.notify_all();
        
        // Дожидаемся завершения всех рабочих потоков
        for (std::thread &worker : workers) {
            if (worker.joinable()) {
                worker.join();
            }
        }
        
        std::cout << "ThreadPool destroyed" << std::endl;
    }
    
    // Метод для получения количества ожидающих задач
    size_t pending_tasks() {
        std::lock_guard<std::mutex> lock(queue_mutex);
        return tasks.size();
    }
    
    // Метод для получения количества активных задач
    int running_tasks() {
        return active_tasks;
    }
    
    // Метод для получения количества рабочих потоков
    size_t thread_count() {
        return workers.size();
    }
};

// Функция для демонстрации - вычисление факториала
unsigned long long factorial(int n) {
    if (n < 0) return 0;
    if (n == 0 || n == 1) return 1;
    
    unsigned long long result = 1;
    for (int i = 2; i <= n; ++i) {
        result *= i;
    }
    
    // Имитация длительной операции для демонстрации многопоточности
    std::this_thread::sleep_for(std::chrono::milliseconds(10));
    
    return result;
}

// Тестовая программа
int main() {
    std::cout << "=== ThreadPool Demo ===" << std::endl;
    
    // Создаем пул из 4 потоков
    ThreadPool pool(4);
    
    std::cout << "\n1. Basic task submission test:" << std::endl;
    {
        // Отправляем несколько задач
        auto future1 = pool.submit(factorial, 5);
        auto future2 = pool.submit(factorial, 10);
        auto future3 = pool.submit(factorial, 15);
        auto future4 = pool.submit(factorial, 20);
        
        // Получаем результаты
        std::cout << "Factorial 5 = " << future1.get() << std::endl;
        std::cout << "Factorial 10 = " << future2.get() << std::endl;
        std::cout << "Factorial 15 = " << future3.get() << std::endl;
        std::cout << "Factorial 20 = " << future4.get() << std::endl;
    }
    
    std::cout << "\n2. Parallel computation test:" << std::endl;
    {
        const int num_tasks = 20;
        std::vector<std::future<unsigned long long>> futures;
        
        auto start_time = std::chrono::high_resolution_clock::now();
        
        // Отправляем множество задач
        for (int i = 1; i <= num_tasks; ++i) {
            futures.push_back(pool.submit(factorial, i % 10 + 10));
        }
        
        // Ждем завершения всех задач
        pool.wait_all();
        
        auto end_time = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end_time - start_time);
        
        std::cout << "Computed " << num_tasks << " factorials in " 
                  << duration.count() << " ms" << std::endl;
        
        // Проверяем результаты
        for (int i = 0; i < num_tasks; ++i) {
            if (i < 5) { // Показываем только первые 5 результатов
                std::cout << "Task " << i + 1 << " result: " << futures[i].get() << std::endl;
            } else {
                futures[i].get(); // Просто дожидаемся завершения
            }
        }
    }
    
    std::cout << "\n3. Lambda functions test:" << std::endl;
    {
        // Отправляем лямбда-функции
        auto future1 = pool.submit([]() {
            std::this_thread::sleep_for(std::chrono::milliseconds(50));
            return 42;
        });
        
        auto future2 = pool.submit([](int a, int b) {
            return a * b;
        }, 6, 7);
        
        std::cout << "Lambda 1 result: " << future1.get() << std::endl;
        std::cout << "Lambda 2 result: " << future2.get() << std::endl;
    }
    
    std::cout << "\n4. Thread pool status:" << std::endl;
    {
        std::cout << "Thread count: " << pool.thread_count() << std::endl;
        std::cout << "Pending tasks: " << pool.pending_tasks() << std::endl;
        std::cout << "Running tasks: " << pool.running_tasks() << std::endl;
    }
    
    std::cout << "\n5. Exception handling test:" << std::endl;
    {
        try {
            // Задача, которая бросает исключение
            auto future = pool.submit([]() -> int {
                throw std::runtime_error("Test exception from task");
                return 0;
            });
            
            // Попытка получить результат выбросит исключение
            future.get();
        } catch (const std::exception& e) {
            std::cout << "Caught exception: " << e.what() << std::endl;
        }
    }
    
    // Пул автоматически уничтожится при выходе из области видимости
    
    std::cout << "\n=== Demo completed ===" << std::endl;
    
    return 0;
}