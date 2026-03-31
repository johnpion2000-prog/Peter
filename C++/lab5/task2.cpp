#include <iostream>
#include <queue>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <chrono>
#include <random>
#include <atomic>
#include <vector>
#include <iomanip>

// Потокобезопасная очередь с использованием condition_variable
template<typename T>
class ThreadSafeQueue {
private:
    std::queue<T> queue;
    mutable std::mutex mutex;  // mutable позволяет использовать в const методах
    std::condition_variable cond;  // Условная переменная для ожидания
    std::atomic<bool> shutdown_flag{false};  // Флаг завершения работы
    size_t max_size;  // Максимальный размер очереди
    
public:
    // Конструктор с ограничением по размеру (для демонстрации ожидания)
    explicit ThreadSafeQueue(size_t max_size = 10) : max_size(max_size) {}
    
    // Добавление элемента в очередь (производитель)
    bool push(T value) {
        std::unique_lock<std::mutex> lock(mutex);
        
        // Ожидаем, пока в очереди не появится место (если очередь ограничена)
        cond.wait(lock, [this]() {
            return queue.size() < max_size || shutdown_flag.load();
        });
        
        // Если очередь закрыта, не добавляем новые элементы
        if (shutdown_flag.load()) {
            return false;
        }
        
        queue.push(std::move(value));
        
        // Уведомляем одного потребителя, что появился новый элемент
        cond.notify_one();
        
        return true;
    }
    
    // Извлечение элемента из очереди (потребитель)
    bool pop(T& value) {
        std::unique_lock<std::mutex> lock(mutex);
        
        // Ожидаем, пока в очереди не появится элемент или очередь не закроется
        cond.wait(lock, [this]() {
            return !queue.empty() || shutdown_flag.load();
        });
        
        // Если очередь пуста и закрыта, завершаем работу
        if (queue.empty() && shutdown_flag.load()) {
            return false;
        }
        
        // Извлекаем элемент
        value = std::move(queue.front());
        queue.pop();
        
        // Уведомляем одного производителя, что освободилось место
        cond.notify_one();
        
        return true;
    }
    
    // Закрытие очереди (корректное завершение)
    void shutdown() {
        {
            std::lock_guard<std::mutex> lock(mutex);
            shutdown_flag.store(true);
        }
        
        // Уведомляем все ожидающие потоки
        cond.notify_all();
    }
    
    // Проверка, закрыта ли очередь
    bool is_shutdown() const {
        return shutdown_flag.load();
    }
    
    // Получение текущего размера очереди
    size_t size() const {
        std::lock_guard<std::mutex> lock(mutex);
        return queue.size();
    }
    
    // Проверка, пуста ли очередь
    bool empty() const {
        std::lock_guard<std::mutex> lock(mutex);
        return queue.empty();
    }
};

// Функция-производитель
void producer(ThreadSafeQueue<int>& queue, int count, int producer_id) {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<int> dist(1, 100);
    std::uniform_int_distribution<int> sleep_dist(10, 100);
    
    std::cout << "[Производитель " << producer_id << "] Начал работу. Будет произведено " 
              << count << " элементов\n";
    
    for (int i = 0; i < count; ++i) {
        int value = dist(gen);
        
        if (!queue.push(value)) {
            std::cout << "[Производитель " << producer_id << "] Очередь закрыта, завершаю работу\n";
            break;
        }
        
        std::cout << "[Производитель " << producer_id << "] Добавил: " << value 
                  << " (размер очереди: " << queue.size() << ")\n";
        
        // Имитация времени на производство
        std::this_thread::sleep_for(std::chrono::milliseconds(sleep_dist(gen)));
    }
    
    std::cout << "[Производитель " << producer_id << "] Завершил работу\n";
}

// Функция-потребитель
void consumer(ThreadSafeQueue<int>& queue, int consumer_id) {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<int> sleep_dist(50, 200);
    
    std::cout << "[Потребитель " << consumer_id << "] Начал работу\n";
    
    while (true) {
        int value;
        
        if (!queue.pop(value)) {
            std::cout << "[Потребитель " << consumer_id << "] Очередь закрыта, завершаю работу\n";
            break;
        }
        
        // Имитация обработки значения
        std::cout << "[Потребитель " << consumer_id << "] Обработал: " << value 
                  << " (размер очереди: " << queue.size() << ")\n";
        
        // Имитация времени на обработку
        std::this_thread::sleep_for(std::chrono::milliseconds(sleep_dist(gen)));
    }
    
    std::cout << "[Потребитель " << consumer_id << "] Завершил работу\n";
}

// Усовершенствованная версия с статистикой
class ProducerConsumerSystem {
private:
    ThreadSafeQueue<int> queue;
    std::vector<std::thread> producers;
    std::vector<std::thread> consumers;
    std::atomic<int> total_produced{0};
    std::atomic<int> total_consumed{0};
    
public:
    ProducerConsumerSystem(size_t queue_size, int num_producers, int num_consumers, 
                          int items_per_producer)
        : queue(queue_size) {
        
        std::cout << "\n" << std::string(70, '=') << "\n";
        std::cout << "СИСТЕМА ПРОИЗВОДИТЕЛЬ-ПОТРЕБИТЕЛЬ\n";
        std::cout << std::string(70, '=') << "\n";
        std::cout << "Параметры системы:\n";
        std::cout << "  Размер очереди: " << queue_size << "\n";
        std::cout << "  Производителей: " << num_producers << "\n";
        std::cout << "  Потребителей: " << num_consumers << "\n";
        std::cout << "  Элементов на производителя: " << items_per_producer << "\n";
        std::cout << std::string(70, '-') << "\n";
        
        // Запуск производителей
        for (int i = 0; i < num_producers; ++i) {
            producers.emplace_back([this, i, items_per_producer]() {
                producer_with_stats(queue, items_per_producer, i);
            });
        }
        
        // Запуск потребителей
        for (int i = 0; i < num_consumers; ++i) {
            consumers.emplace_back([this, i]() {
                consumer_with_stats(queue, i);
            });
        }
    }
    
    // Производитель со сбором статистики
    void producer_with_stats(ThreadSafeQueue<int>& queue, int count, int producer_id) {
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<int> dist(1, 1000);
        std::uniform_int_distribution<int> sleep_dist(50, 150);
        
        int produced = 0;
        
        for (int i = 0; i < count; ++i) {
            int value = dist(gen);
            
            if (!queue.push(value)) {
                break;
            }
            
            produced++;
            total_produced++;
            
            // Вывод каждые 10 элементов для уменьшения шума
            if (produced % 10 == 0) {
                std::cout << "[P" << producer_id << "] Добавлено: " << produced 
                          << "/" << count << " (всего: " << total_produced << ")\n";
            }
            
            std::this_thread::sleep_for(std::chrono::milliseconds(sleep_dist(gen)));
        }
        
        std::cout << "[P" << producer_id << "] ЗАВЕРШЕН. Произведено: " << produced << " элементов\n";
    }
    
    // Потребитель со сбором статистики
    void consumer_with_stats(ThreadSafeQueue<int>& queue, int consumer_id) {
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<int> sleep_dist(100, 300);
        
        int consumed = 0;
        
        while (true) {
            int value;
            
            if (!queue.pop(value)) {
                break;
            }
            
            consumed++;
            total_consumed++;
            
            // Вывод каждые 10 элементов для уменьшения шума
            if (consumed % 10 == 0) {
                std::cout << "[C" << consumer_id << "] Обработано: " << consumed 
                          << " (всего: " << total_consumed << ")\n";
            }
            
            // Имитация обработки
            std::this_thread::sleep_for(std::chrono::milliseconds(sleep_dist(gen)));
        }
        
        std::cout << "[C" << consumer_id << "] ЗАВЕРШЕН. Потреблено: " << consumed << " элементов\n";
    }
    
    // Ожидание завершения всех производителей
    void wait_for_producers() {
        for (auto& producer : producers) {
            producer.join();
        }
        std::cout << "\nВсе производители завершили работу\n";
    }
    
    // Корректное завершение системы
    void shutdown() {
        std::cout << "\n" << std::string(70, '-') << "\n";
        std::cout << "Запуск процедуры завершения...\n";
        
        // Закрываем очередь
        queue.shutdown();
        
        // Ждем завершения потребителей
        for (auto& consumer : consumers) {
            consumer.join();
        }
        
        // Выводим итоговую статистику
        std::cout << "\n" << std::string(70, '=') << "\n";
        std::cout << "ИТОГОВАЯ СТАТИСТИКА\n";
        std::cout << std::string(70, '=') << "\n";
        std::cout << "Всего произведено: " << total_produced << " элементов\n";
        std::cout << "Всего потреблено:  " << total_consumed << " элементов\n";
        
        if (total_produced == total_consumed) {
            std::cout << "✓ Баланс соблюден\n";
        } else {
            std::cout << "✗ Несоответствие: " 
                      << std::abs(total_produced - total_consumed) 
                      << " элементов\n";
        }
        
        std::cout << std::string(70, '=') << "\n";
    }
};

// Демонстрация различных сценариев
void demonstrate_scenarios() {
    std::cout << "\n" << std::string(70, '=') << "\n";
    std::cout << "ДЕМОНСТРАЦИЯ РАЗЛИЧНЫХ СЦЕНАРИЕВ\n";
    std::cout << std::string(70, '=') << "\n";
    
    // Сценарий 1: Быстрые производители, медленные потребители
    {
        std::cout << "\nСЦЕНАРИЙ 1: Быстрые производители, медленные потребители\n";
        std::cout << "Ожидается накопление элементов в очереди\n";
        
        ThreadSafeQueue<int> queue(5);  // Маленькая очередь
        std::thread fast_producer([&queue]() {
            for (int i = 0; i < 10; ++i) {
                queue.push(i);
                std::cout << "Производитель добавил: " << i << "\n";
                std::this_thread::sleep_for(std::chrono::milliseconds(10));
            }
            queue.shutdown();
        });
        
        std::thread slow_consumer([&queue]() {
            int value;
            while (queue.pop(value)) {
                std::cout << "Потребитель обработал: " << value << "\n";
                std::this_thread::sleep_for(std::chrono::milliseconds(100));
            }
        });
        
        fast_producer.join();
        slow_consumer.join();
    }
    
    // Сценарий 2: Медленные производители, быстрые потребители
    {
        std::cout << "\n\nСЦЕНАРИЙ 2: Медленные производители, быстрые потребители\n";
        std::cout << "Ожидается, что потребители будут ждать новые элементы\n";
        
        ThreadSafeQueue<int> queue(5);
        std::thread slow_producer([&queue]() {
            for (int i = 0; i < 5; ++i) {
                std::this_thread::sleep_for(std::chrono::milliseconds(100));
                queue.push(i);
                std::cout << "Производитель добавил: " << i << "\n";
            }
            queue.shutdown();
        });
        
        std::thread fast_consumer([&queue]() {
            int value;
            while (queue.pop(value)) {
                std::cout << "Потребитель обработал: " << value << "\n";
                std::this_thread::sleep_for(std::chrono::milliseconds(10));
            }
        });
        
        slow_producer.join();
        fast_consumer.join();
    }
    
    // Сценарий 3: Несколько производителей и потребителей
    {
        std::cout << "\n\nСЦЕНАРИЙ 3: Множество производителей и потребителей\n";
        
        ProducerConsumerSystem system(5, 2, 3, 20);
        
        // Даем производителям время на работу
        std::this_thread::sleep_for(std::chrono::seconds(2));
        
        // Корректное завершение
        system.shutdown();
    }
}

// Основная программа
int main() {
    std::cout << "ЛАБОРАТОРНАЯ РАБОТА №5: ЗАДАНИЕ 2\n";
    std::cout << "Паттерн Производитель-Потребитель с condition_variable\n";
    
    // Вариант 1: Простая демонстрация
    {
        std::cout << "\n" << std::string(70, '=') << "\n";
        std::cout << "ВАРИАНТ 1: БАЗОВАЯ ДЕМОНСТРАЦИЯ\n";
        std::cout << std::string(70, '=') << "\n";
        
        ThreadSafeQueue<int> queue(5);  // Очередь с ограничением в 5 элементов
        
        // Создаем один поток-производитель
        std::thread producer_thread([&queue]() {
            for (int i = 1; i <= 15; ++i) {
                if (!queue.push(i)) break;
                std::this_thread::sleep_for(std::chrono::milliseconds(50));
            }
            queue.shutdown();  // Сигнализируем о завершении
        });
        
        // Создаем три потока-потребителя
        std::vector<std::thread> consumer_threads;
        for (int i = 0; i < 3; ++i) {
            consumer_threads.emplace_back([&queue, i]() {
                consumer(queue, i + 1);
            });
        }
        
        // Ожидаем завершения всех потоков
        producer_thread.join();
        for (auto& t : consumer_threads) {
            t.join();
        }
        
        std::cout << "\nВсе потоки завершены корректно!\n";
    }
    
    // Вариант 2: Расширенная система со статистикой
    {
        std::cout << "\n" << std::string(70, '=') << "\n";
        std::cout << "ВАРИАНТ 2: РАСШИРЕННАЯ СИСТЕМА СО СТАТИСТИКОЙ\n";
        std::cout << std::string(70, '=') << "\n";
        
        ProducerConsumerSystem system(
            10,     // Размер очереди
            2,      // Количество производителей
            3,      // Количество потребителей
            50      // Элементов на каждого производителя
        );
        
        // Ждем некоторое время для работы системы
        std::cout << "\nСистема работает... (ожидание 3 секунды)\n";
        std::this_thread::sleep_for(std::chrono::seconds(3));
        
        // Корректно завершаем систему
        system.shutdown();
    }
    
    // Вариант 3: Демонстрация различных сценариев
    demonstrate_scenarios();
    
    // Объяснение работы condition_variable
    std::cout << "\n" << std::string(70, '=') << "\n";
    std::cout << "ОБЪЯСНЕНИЕ РАБОТЫ CONDITION_VARIABLE\n";
    std::cout << std::string(70, '=') << "\n";
    
    std::cout << "\nКлючевые моменты:\n";
    std::cout << "1. std::condition_variable позволяет потокам ждать определенных условий\n";
    std::cout << "2. wait() атомарно разблокирует мьютекс и приостанавливает поток\n";
    std::cout << "3. При вызове notify_one()/notify_all() потоки просыпаются и проверяют условие\n";
    std::cout << "4. Проверка условия происходит в предикате (лямбда-функции)\n";
    std::cout << "5. Это предотвращает ложные пробуждения (spurious wakeups)\n";
    
    std::cout << "\nПаттерн использования:\n";
    std::cout << "1. Захватываем мьютекс с unique_lock\n";
    std::cout << "2. Вызываем wait() с предикатом\n";
    std::cout << "3. Когда условие выполняется, продолжаем работу\n";
    std::cout << "4. После изменений вызываем notify_one() или notify_all()\n";
    
    std::cout << "\n" << std::string(70, '=') << "\n";
    std::cout << "ВЫВОДЫ И ЗАКЛЮЧЕНИЕ\n";
    std::cout << std::string(70, '=') << "\n";
    
    std::cout << "\nПреимущества использования condition_variable:\n";
    std::cout << "✓ Эффективное ожидание без активного опроса (busy-waiting)\n";
    std::cout << "✓ Снижение нагрузки на процессор\n";
    std::cout << "✓ Возможность координации нескольких потоков\n";
    std::cout << "✓ Поддержка сложных условий синхронизации\n";
    
    std::cout << "\nТипичные ошибки:\n";
    std::cout << "✗ Не использовать предикат с wait() (ложные пробуждения)\n";
    std::cout << "✗ Забыть вызвать notify() при изменении условия\n";
    std::cout << "✗ Не обеспечить корректное завершение потоков\n";
    
    return 0;
}