#include <iostream>
#include <vector>
#include <thread>
#include <mutex>
#include <chrono>
#include <random>
#include <functional>
#include <numeric>
#include <iomanip>

class VectorSumCalculator {
private:
    std::vector<int> data;
    std::mutex sum_mutex;
    
public:
    VectorSumCalculator(size_t size) {
        // Инициализация генератора случайных чисел
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<int> dist(1, 100);
        
        // Заполнение вектора случайными числами
        data.reserve(size);
        for (size_t i = 0; i < size; ++i) {
            data.push_back(dist(gen));
        }
        
        std::cout << "Вектор из " << data.size() << " элементов создан.\n";
    }
    
    // Метод для получения размера вектора
    size_t getSize() const {
        return data.size();
    }
    
    // Однопоточное вычисление суммы
    long long calculateSingleThreaded() {
        long long total_sum = 0;
        
        // Простой цикл для вычисления суммы
        for (const auto& num : data) {
            total_sum += static_cast<long long>(num);
        }
        
        return total_sum;
    }
    
    // Многопоточное вычисление суммы
    long long calculateMultiThreaded(int num_threads) {
        long long total_sum = 0;
        std::vector<std::thread> threads;
        
        // Вычисляем размер части для каждого потока
        size_t chunk_size = data.size() / num_threads;
        size_t remainder = data.size() % num_threads;
        
        // Функция для вычисления суммы части вектора
        auto calculate_chunk = [this, &total_sum](size_t start_idx, size_t end_idx) {
            long long local_sum = 0;
            
            // Вычисляем сумму для своей части
            for (size_t i = start_idx; i < end_idx; ++i) {
                local_sum += static_cast<long long>(data[i]);
            }
            
            // Защищаем общую сумму с помощью мьютекса
            {
                std::lock_guard<std::mutex> lock(sum_mutex);
                total_sum += local_sum;
            }
        };
        
        // Создаем и запускаем потоки
        size_t start_idx = 0;
        for (int i = 0; i < num_threads; ++i) {
            size_t end_idx = start_idx + chunk_size;
            
            // Распределяем остаток по первым потокам
            if (remainder > 0) {
                end_idx++;
                remainder--;
            }
            
            threads.emplace_back(calculate_chunk, start_idx, end_idx);
            start_idx = end_idx;
        }
        
        // Ожидаем завершения всех потоков
        for (auto& t : threads) {
            t.join();
        }
        
        return total_sum;
    }
    
    // Оптимизированная версия многопоточного вычисления (без лишних блокировок)
    long long calculateMultiThreadedOptimized(int num_threads) {
        std::vector<long long> partial_sums(num_threads, 0);
        std::vector<std::thread> threads;
        
        // Вычисляем размер части для каждого потока
        size_t chunk_size = data.size() / num_threads;
        size_t remainder = data.size() % num_threads;
        
        // Функция для вычисления суммы части вектора
        auto calculate_chunk = [this](size_t start_idx, size_t end_idx) -> long long {
            long long local_sum = 0;
            
            // Вычисляем сумму для своей части
            for (size_t i = start_idx; i < end_idx; ++i) {
                local_sum += static_cast<long long>(data[i]);
            }
            
            return local_sum;
        };
        
        // Создаем и запускаем потоки
        size_t start_idx = 0;
        for (int i = 0; i < num_threads; ++i) {
            size_t end_idx = start_idx + chunk_size;
            
            // Распределяем остаток по первым потокам
            if (remainder > 0) {
                end_idx++;
                remainder--;
            }
            
            // Захватываем i по значению для каждой лямбды
            threads.emplace_back([&, i, start_idx, end_idx]() {
                partial_sums[i] = calculate_chunk(start_idx, end_idx);
            });
            
            start_idx = end_idx;
        }
        
        // Ожидаем завершения всех потоков
        for (auto& t : threads) {
            t.join();
        }
        
        // Суммируем частичные суммы
        long long total_sum = 0;
        for (const auto& sum : partial_sums) {
            total_sum += sum;
        }
        
        return total_sum;
    }
    
    // Валидация результатов с использованием STL
    long long calculateUsingSTL() {
        return std::accumulate(data.begin(), data.end(), 0LL);
    }
};

// Функция для форматированного вывода времени
void printTime(const std::chrono::duration<double>& duration, const std::string& label) {
    std::cout << std::left << std::setw(35) << label 
              << ": " << std::fixed << std::setprecision(6) 
              << duration.count() << " секунд" << std::endl;
}

// Функция для сравнения производительности
void benchmarkPerformance(VectorSumCalculator& calculator, int num_threads) {
    std::cout << "\n" << std::string(60, '=') << "\n";
    std::cout << "ТЕСТИРОВАНИЕ ПРОИЗВОДИТЕЛЬНОСТИ\n";
    std::cout << std::string(60, '=') << "\n";
    
    // Тест 1: Однопоточный расчет
    auto start = std::chrono::high_resolution_clock::now();
    long long single_thread_result = calculator.calculateSingleThreaded();
    auto end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double> single_thread_time = end - start;
    
    // Тест 2: Многопоточный расчет (с мьютексом)
    start = std::chrono::high_resolution_clock::now();
    long long multi_thread_result = calculator.calculateMultiThreaded(num_threads);
    end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double> multi_thread_time = end - start;
    
    // Тест 3: Оптимизированный многопоточный расчет (без лишних блокировок)
    start = std::chrono::high_resolution_clock::now();
    long long optimized_result = calculator.calculateMultiThreadedOptimized(num_threads);
    end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double> optimized_time = end - start;
    
    // Тест 4: Проверка с помощью STL (для валидации)
    start = std::chrono::high_resolution_clock::now();
    long long stl_result = calculator.calculateUsingSTL();
    end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double> stl_time = end - start;
    
    // Вывод результатов
    std::cout << "\nРЕЗУЛЬТАТЫ ВЫЧИСЛЕНИЙ:\n";
    std::cout << "Однопоточный результат: " << single_thread_result << "\n";
    std::cout << "Многопоточный результат: " << multi_thread_result << "\n";
    std::cout << "Оптимизированный результат: " << optimized_result << "\n";
    std::cout << "STL результат: " << stl_result << "\n";
    
    // Проверка корректности
    bool all_equal = (single_thread_result == multi_thread_result) &&
                     (multi_thread_result == optimized_result) &&
                     (optimized_result == stl_result);
    
    std::cout << "\nПРОВЕРКА КОРРЕКТНОСТИ: ";
    if (all_equal) {
        std::cout << "✓ ВСЕ РЕЗУЛЬТАТЫ СОВПАДАЮТ\n";
    } else {
        std::cout << "✗ ОШИБКА: РЕЗУЛЬТАТЫ НЕ СОВПАДАЮТ\n";
    }
    
    // Вывод времени выполнения
    std::cout << "\nВРЕМЯ ВЫПОЛНЕНИЯ:\n";
    printTime(single_thread_time, "Однопоточный расчет");
    printTime(multi_thread_time, "Многопоточный расчет (" + std::to_string(num_threads) + " потока)");
    printTime(optimized_time, "Оптимизированный многопоточный расчет");
    printTime(stl_time, "STL accumulate");
    
    // Расчет ускорения
    if (single_thread_time.count() > 0) {
        double speedup_mutex = single_thread_time.count() / multi_thread_time.count();
        double speedup_optimized = single_thread_time.count() / optimized_time.count();
        
        std::cout << "\nУСКОРЕНИЕ (по сравнению с однопоточным):\n";
        std::cout << "С мьютексом: " << std::fixed << std::setprecision(2) 
                  << speedup_mutex << "x\n";
        std::cout << "Оптимизированный: " << std::fixed << std::setprecision(2) 
                  << speedup_optimized << "x\n";
    }
    
    // Анализ эффективности
    std::cout << "\nАНАЛИЗ ЭФФЕКТИВНОСТИ:\n";
    std::cout << "Оптимизированная версия избегает частых блокировок мьютекса,\n";
    std::cout << "вычисляя частичные суммы локально и объединяя их в конце.\n";
}

// Дополнительная демонстрация: работа с атомарными переменными
#include <atomic>

void demonstrateAtomicCounter() {
    std::cout << "\n" << std::string(60, '=') << "\n";
    std::cout << "ДЕМОНСТРАЦИЯ АТОМАРНЫХ ПЕРЕМЕННЫХ\n";
    std::cout << std::string(60, '=') << "\n";
    
    std::atomic<int> atomic_counter{0};
    int regular_counter = 0;
    
    const int NUM_ITERATIONS = 1000000;
    const int NUM_THREADS = 4;
    
    // Функция для инкремента атомарного счетчика
    auto increment_atomic = [&atomic_counter, NUM_ITERATIONS]() {
        for (int i = 0; i < NUM_ITERATIONS; ++i) {
            atomic_counter++;
        }
    };
    
    // Функция для инкремента обычного счетчика (без защиты)
    auto increment_regular = [&regular_counter, NUM_ITERATIONS]() {
        for (int i = 0; i < NUM_ITERATIONS; ++i) {
            regular_counter++;
        }
    };
    
    // Тест атомарного счетчика
    std::vector<std::thread> atomic_threads;
    for (int i = 0; i < NUM_THREADS; ++i) {
        atomic_threads.emplace_back(increment_atomic);
    }
    
    for (auto& t : atomic_threads) {
        t.join();
    }
    
    // Тест обычного счетчика (будет гонка данных)
    std::vector<std::thread> regular_threads;
    for (int i = 0; i < NUM_THREADS; ++i) {
        regular_threads.emplace_back(increment_regular);
    }
    
    for (auto& t : regular_threads) {
        t.join();
    }
    
    std::cout << "Атомарный счетчик: " << atomic_counter << " (ожидается: " 
              << NUM_ITERATIONS * NUM_THREADS << ")\n";
    std::cout << "Обычный счетчик: " << regular_counter << " (возможна гонка данных)\n";
    std::cout << "Гонка данных приводит к неправильным результатам при\n";
    std::cout << "одновременном доступе к переменной без синхронизации.\n";
}

int main() {
    std::cout << "ЛАБОРАТОРНАЯ РАБОТА №5: МНОГОПОТОЧНОСТЬ В C++\n";
    std::cout << "Задание 1: Базовые потоки и синхронизация\n";
    std::cout << std::string(60, '=') << "\n";
    
    try {
        // Параметры тестирования
        const size_t VECTOR_SIZE = 10000000;  // 10 миллионов элементов
        const int NUM_THREADS = 4;           // Количество потоков
        
        std::cout << "Создание вектора из " << VECTOR_SIZE << " элементов...\n";
        
        // Создаем объект для вычислений
        VectorSumCalculator calculator(VECTOR_SIZE);
        
        // Проводим тестирование производительности
        benchmarkPerformance(calculator, NUM_THREADS);
        
        // Демонстрация атомарных переменных
        demonstrateAtomicCounter();
        
        // Дополнительный эксперимент: тестирование с разным количеством потоков
        std::cout << "\n" << std::string(60, '=') << "\n";
        std::cout << "ЭКСПЕРИМЕНТ: РАЗНОЕ КОЛИЧЕСТВО ПОТОКОВ\n";
        std::cout << std::string(60, '=') << "\n";
        
        std::vector<int> thread_counts = {1, 2, 4, 8, 16};
        
        for (int threads : thread_counts) {
            auto start = std::chrono::high_resolution_clock::now();
            calculator.calculateMultiThreadedOptimized(threads);
            auto end = std::chrono::high_resolution_clock::now();
            std::chrono::duration<double> duration = end - start;
            
            std::cout << std::setw(2) << threads << " потоков: " 
                      << std::fixed << std::setprecision(6) 
                      << duration.count() << " секунд\n";
        }
        
        std::cout << "\nВЫВОДЫ:\n";
        std::cout << "1. Многопоточность ускоряет вычисления, но не линейно\n";
        std::cout << "2. Слишком много потоков может снизить производительность\n";
        std::cout << "3. Важно минимизировать использование мьютексов\n";
        std::cout << "4. Атомарные переменные эффективнее мьютексов для простых операций\n";
        
    } catch (const std::exception& e) {
        std::cerr << "Ошибка: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}