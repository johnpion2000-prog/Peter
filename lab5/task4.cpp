#include <iostream>
#include <future>
#include <random>
#include <vector>
#include <chrono>
#include <iomanip>
#include <cmath>
#include <stdexcept>
#include <atomic>
#include <numeric>
#include <algorithm>

class PiCalculator {
private:
    // Вспомогательный класс для измерения времени
    class Timer {
    private:
        std::chrono::time_point<std::chrono::high_resolution_clock> start_time;
        std::string label;
        
    public:
        Timer(const std::string& lbl) : label(lbl) {
            start_time = std::chrono::high_resolution_clock::now();
        }
        
        ~Timer() {
            auto end_time = std::chrono::high_resolution_clock::now();
            auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(
                end_time - start_time);
            std::cout << label << ": " << duration.count() << " ms\n";
        }
    };
    
public:
    // Вычисление π с использованием метода Монте-Карло для части точек
    double calculatePiPortion(int points_to_calculate) {
        if (points_to_calculate <= 0) {
            throw std::invalid_argument("Количество точек должно быть положительным");
        }
        
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_real_distribution<double> dist(-1.0, 1.0);
        
        int points_inside_circle = 0;
        
        for (int i = 0; i < points_to_calculate; ++i) {
            double x = dist(gen);
            double y = dist(gen);
            
            // Проверяем, попадает ли точка в единичную окружность (x² + y² ≤ 1)
            if (x * x + y * y <= 1.0) {
                points_inside_circle++;
            }
        }
        
        // Формула: π ≈ 4 * (точек в круге) / (всех точек)
        return 4.0 * static_cast<double>(points_inside_circle) / 
               static_cast<double>(points_to_calculate);
    }
    
    // Однопоточное вычисление π
    double calculatePiSingleThread(int total_points) {
        Timer timer("Однопоточное вычисление π");
        
        if (total_points <= 0) {
            throw std::invalid_argument("Общее количество точек должно быть положительным");
        }
        
        double pi_estimate = calculatePiPortion(total_points);
        
        std::cout << "Однопоточный результат: π ≈ " << std::fixed << std::setprecision(15) 
                  << pi_estimate << "\n";
        std::cout << "Погрешность: " << std::setprecision(15) 
                  << std::abs(pi_estimate - M_PI) << "\n";
        
        return pi_estimate;
    }
    
    // Параллельное вычисление π с использованием std::async
    double calculatePiParallel(int total_points, int num_tasks) {
        Timer timer("Параллельное вычисление π (" + std::to_string(num_tasks) + " задач)");
        
        if (total_points <= 0 || num_tasks <= 0) {
            throw std::invalid_argument("Параметры должны быть положительными");
        }
        
        std::vector<std::future<double>> futures;
        int points_per_task = total_points / num_tasks;
        int remainder = total_points % num_tasks;
        
        // Создаем асинхронные задачи
        for (int i = 0; i < num_tasks; ++i) {
            int task_points = points_per_task;
            
            // Распределяем остаточные точки по первым задачам
            if (remainder > 0) {
                task_points++;
                remainder--;
            }
            
            // Создаем асинхронную задачу с политикой std::launch::async
            // Это гарантирует запуск в отдельном потоке
            futures.push_back(std::async(
                std::launch::async,
                [this, task_points]() {
                    return calculatePiPortion(task_points);
                }
            ));
        }
        
        // Собираем результаты
        double total = 0.0;
        int total_calculated_points = 0;
        
        for (size_t i = 0; i < futures.size(); ++i) {
            try {
                // Получаем результат из future (может бросить исключение)
                double result = futures[i].get();
                int task_points = points_per_task;
                if (i < static_cast<size_t>(total_points % num_tasks)) {
                    task_points++;
                }
                
                total += result * task_points;
                total_calculated_points += task_points;
                
                // Выводим прогресс для больших вычислений
                if (total_points > 1000000) {
                    if (i % (futures.size() / 10) == 0) {
                        std::cout << "Задача " << i + 1 << "/" << futures.size() 
                                  << " завершена\n";
                    }
                }
                
            } catch (const std::exception& e) {
                std::cerr << "Ошибка в задаче " << i + 1 << ": " << e.what() << "\n";
                // Можно продолжить с другими задачами
            }
        }
        
        // Усредняем результаты
        double pi_estimate = total / total_calculated_points;
        
        std::cout << "Параллельный результат: π ≈ " << std::fixed << std::setprecision(15) 
                  << pi_estimate << "\n";
        std::cout << "Погрешность: " << std::setprecision(15) 
                  << std::abs(pi_estimate - M_PI) << "\n";
        std::cout << "Вычислено точек: " << total_calculated_points 
                  << " (из " << total_points << ")\n";
        
        return pi_estimate;
    }
    
    // Альтернативная версия с использованием packaged_task
    double calculatePiWithPackagedTask(int total_points, int num_tasks) {
        Timer timer("Вычисление с packaged_task (" + std::to_string(num_tasks) + " задач)");
        
        std::vector<std::packaged_task<double()>> tasks;
        std::vector<std::future<double>> futures;
        std::vector<std::thread> threads;
        
        int points_per_task = total_points / num_tasks;
        int remainder = total_points % num_tasks;
        
        // Создаем packaged_tasks
        for (int i = 0; i < num_tasks; ++i) {
            int task_points = points_per_task + (i < remainder ? 1 : 0);
            
            // Создаем packaged_task
            std::packaged_task<double()> task(
                [this, task_points]() {
                    return calculatePiPortion(task_points);
                }
            );
            
            // Получаем future
            futures.push_back(task.get_future());
            
            // Запускаем задачу в отдельном потоке
            threads.emplace_back(std::move(task));
            
            tasks.push_back(std::move(task));
        }
        
        // Ожидаем завершения всех потоков
        for (auto& thread : threads) {
            thread.join();
        }
        
        // Собираем результаты
        double total = 0.0;
        int total_points_calculated = 0;
        
        for (size_t i = 0; i < futures.size(); ++i) {
            double result = futures[i].get();
            int task_points = points_per_task + (static_cast<int>(i) < remainder ? 1 : 0);
            
            total += result * task_points;
            total_points_calculated += task_points;
        }
        
        return total / total_points_calculated;
    }
    
    // Версия с promise для ручного управления
    double calculatePiWithPromise(int total_points, int num_tasks) {
        Timer timer("Вычисление с promise (" + std::to_string(num_tasks) + " задач)");
        
        std::vector<std::promise<double>> promises(num_tasks);
        std::vector<std::future<double>> futures;
        std::vector<std::thread> threads;
        
        // Получаем futures из promises
        for (auto& promise : promises) {
            futures.push_back(promise.get_future());
        }
        
        int points_per_task = total_points / num_tasks;
        int remainder = total_points % num_tasks;
        
        // Запускаем потоки
        for (int i = 0; i < num_tasks; ++i) {
            int task_points = points_per_task + (i < remainder ? 1 : 0);
            
            threads.emplace_back(
                [this, i, task_points, &promises]() {
                    try {
                        double result = calculatePiPortion(task_points);
                        promises[i].set_value(result);  // Устанавливаем значение
                    } catch (...) {
                        // Перехватываем исключение и передаем через promise
                        promises[i].set_exception(std::current_exception());
                    }
                }
            );
        }
        
        // Собираем результаты
        double total = 0.0;
        int total_points_calculated = 0;
        
        for (size_t i = 0; i < futures.size(); ++i) {
            try {
                double result = futures[i].get();
                int task_points = points_per_task + (static_cast<int>(i) < remainder ? 1 : 0);
                
                total += result * task_points;
                total_points_calculated += task_points;
                
            } catch (const std::exception& e) {
                std::cerr << "Задача " << i + 1 << " завершилась с ошибкой: " 
                          << e.what() << "\n";
            }
        }
        
        // Завершаем потоки
        for (auto& thread : threads) {
            thread.join();
        }
        
        return total / total_points_calculated;
    }
    
    // Тестирование точности метода Монте-Карло
    void testMonteCarloAccuracy(int max_points = 100000000) {
        std::cout << "\n" << std::string(70, '=') << "\n";
        std::cout << "ТЕСТИРОВАНИЕ ТОЧНОСТИ МЕТОДА МОНТЕ-КАРЛО\n";
        std::cout << std::string(70, '=') << "\n";
        
        std::cout << std::left << std::setw(15) << "Точек" 
                  << std::setw(25) << "Приближение π" 
                  << std::setw(25) << "Погрешность" 
                  << std::setw(15) << "Относит. ошибка" << "\n";
        std::cout << std::string(70, '-') << "\n";
        
        int points = 10;
        while (points <= max_points) {
            double pi_approx = calculatePiPortion(points);
            double error = std::abs(pi_approx - M_PI);
            double relative_error = error / M_PI * 100;
            
            std::cout << std::left << std::setw(15) << points 
                      << std::setw(25) << std::fixed << std::setprecision(10) << pi_approx
                      << std::setw(25) << std::scientific << std::setprecision(6) << error
                      << std::fixed << std::setw(15) << std::setprecision(4) 
                      << relative_error << "%\n";
            
            points *= 10;
        }
    }
    
    // Сравнение производительности разных подходов
    void benchmarkPerformance(int total_points = 10000000) {
        std::cout << "\n" << std::string(70, '=') << "\n";
        std::cout << "СРАВНЕНИЕ ПРОИЗВОДИТЕЛЬНОСТИ\n";
        std::cout << "Всего точек: " << total_points << "\n";
        std::cout << std::string(70, '=') << "\n";
        
        // Однопоточное вычисление
        auto start = std::chrono::high_resolution_clock::now();
        double single_result = calculatePiSingleThread(total_points);
        auto end = std::chrono::high_resolution_clock::now();
        auto single_time = std::chrono::duration_cast<std::chrono::milliseconds>(
            end - start).count();
        
        std::cout << "\n" << std::string(70, '-') << "\n";
        std::cout << std::left << std::setw(20) << "Метод" 
                  << std::setw(20) << "Потоки/задачи" 
                  << std::setw(20) << "Время (мс)" 
                  << std::setw(20) << "Ускорение" << "\n";
        std::cout << std::string(70, '-') << "\n";
        
        std::cout << std::left << std::setw(20) << "Однопоточный" 
                  << std::setw(20) << "1" 
                  << std::setw(20) << single_time 
                  << std::setw(20) << "1.00x" << "\n";
        
        // Тестируем разное количество задач
        std::vector<int> task_counts = {2, 4, 8, 16, 32};
        
        for (int tasks : task_counts) {
            start = std::chrono::high_resolution_clock::now();
            double parallel_result = calculatePiParallel(total_points, tasks);
            end = std::chrono::high_resolution_clock::now();
            auto parallel_time = std::chrono::duration_cast<std::chrono::milliseconds>(
                end - start).count();
            
            double speedup = static_cast<double>(single_time) / parallel_time;
            
            std::cout << std::left << std::setw(20) << "std::async" 
                      << std::setw(20) << tasks 
                      << std::setw(20) << parallel_time 
                      << std::fixed << std::setprecision(2) 
                      << std::setw(20) << speedup << "x" << "\n";
            
            // Проверяем, что результаты совпадают в пределах погрешности
            double result_diff = std::abs(single_result - parallel_result);
            if (result_diff > 1e-10) {
                std::cout << "   ⚠️  Замечено расхождение результатов: " 
                          << std::scientific << result_diff << "\n";
            }
        }
        
        // Дополнительные методы (для сравнения)
        std::cout << "\n" << std::string(70, '-') << "\n";
        std::cout << "ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ:\n";
        std::cout << std::string(70, '-') << "\n";
        
        for (int tasks : {4, 8}) {
            start = std::chrono::high_resolution_clock::now();
            double packaged_result = calculatePiWithPackagedTask(total_points, tasks);
            end = std::chrono::high_resolution_clock::now();
            auto packaged_time = std::chrono::duration_cast<std::chrono::milliseconds>(
                end - start).count();
            
            double speedup = static_cast<double>(single_time) / packaged_time;
            
            std::cout << std::left << std::setw(20) << "packaged_task" 
                      << std::setw(20) << tasks 
                      << std::setw(20) << packaged_time 
                      << std::fixed << std::setprecision(2) 
                      << std::setw(20) << speedup << "x" << "\n";
            
            start = std::chrono::high_resolution_clock::now();
            double promise_result = calculatePiWithPromise(total_points, tasks);
            end = std::chrono::high_resolution_clock::now();
            auto promise_time = std::chrono::duration_cast<std::chrono::milliseconds>(
                end - start).count();
            
            speedup = static_cast<double>(single_time) / promise_time;
            
            std::cout << std::left << std::setw(20) << "promise" 
                      << std::setw(20) << tasks 
                      << std::setw(20) << promise_time 
                      << std::fixed << std::setprecision(2) 
                      << std::setw(20) << speedup << "x" << "\n";
        }
    }
    
    // Демонстрация разных политик запуска std::async
    void demonstrateAsyncPolicies(int points = 1000000) {
        std::cout << "\n" << std::string(70, '=') << "\n";
        std::cout << "ДЕМОНСТРАЦИЯ ПОЛИТИК ЗАПУСКА STD::ASYNC\n";
        std::cout << std::string(70, '=') << "\n";
        
        // std::launch::async - гарантирует запуск в отдельном потоке
        {
            Timer timer("std::launch::async");
            auto future = std::async(std::launch::async, 
                [this, points]() { return calculatePiPortion(points); });
            
            // Можно делать другие работы, пока вычисляется π
            std::cout << "Вычисление π запущено асинхронно...\n";
            
            // Получаем результат (блокирует, если еще не готов)
            double result = future.get();
            std::cout << "Результат (async): " << std::setprecision(10) << result << "\n";
        }
        
        // std::launch::deferred - отложенное выполнение
        {
            Timer timer("std::launch::deferred");
            auto future = std::async(std::launch::deferred, 
                [this, points]() { return calculatePiPortion(points); });
            
            std::cout << "Вычисление π отложено...\n";
            std::cout << "Задача будет выполнена при первом вызове get() или wait()\n";
            
            // Выполнение начнется только здесь
            double result = future.get();
            std::cout << "Результат (deferred): " << std::setprecision(10) << result << "\n";
        }
        
        // std::launch::async | std::launch::deferred - решение за компилятором
        {
            Timer timer("std::launch::async|deferred (по умолчанию)");
            auto future = std::async(
                std::launch::async | std::launch::deferred,
                [this, points]() { return calculatePiPortion(points); });
            
            std::cout << "Политика запуска определяется реализацией...\n";
            
            double result = future.get();
            std::cout << "Результат (по умолчанию): " << std::setprecision(10) << result << "\n";
        }
    }
};

// Демонстрация исключений в асинхронных задачах
void demonstrateExceptions() {
    std::cout << "\n" << std::string(70, '=') << "\n";
    std::cout << "ОБРАБОТКА ИСКЛЮЧЕНИЙ В АСИНХРОННЫХ ЗАДАЧАХ\n";
    std::cout << std::string(70, '=') << "\n";
    
    PiCalculator calculator;
    
    // Задача, которая бросает исключение
    auto throwing_task = []() -> double {
        throw std::runtime_error("Имитация ошибки в вычислениях");
        return 0.0;
    };
    
    // Запускаем задачу с исключением
    std::future<double> future = std::async(std::launch::async, throwing_task);
    
    try {
        std::cout << "Пытаемся получить результат...\n";
        double result = future.get();
        std::cout << "Результат: " << result << "\n";
    } catch (const std::exception& e) {
        std::cout << "Поймано исключение: " << e.what() << "\n";
    }
    
    // Несколько задач, некоторые с ошибками
    std::cout << "\nЗапуск нескольких задач с возможными ошибками:\n";
    
    std::vector<std::future<double>> futures;
    for (int i = 0; i < 5; ++i) {
        if (i == 2) {  // Третья задача с ошибкой
            futures.push_back(std::async(std::launch::async, throwing_task));
        } else {
            futures.push_back(std::async(std::launch::async, 
                [i, &calculator]() { return calculator.calculatePiPortion(100000); }));
        }
    }
    
    for (size_t i = 0; i < futures.size(); ++i) {
        try {
            double result = futures[i].get();
            std::cout << "Задача " << i + 1 << " успешно завершена: " 
                      << std::setprecision(6) << result << "\n";
        } catch (const std::exception& e) {
            std::cout << "Задача " << i + 1 << " завершилась с ошибкой: " 
                      << e.what() << "\n";
        }
    }
}

int main() {
    std::cout << "ЛАБОРАТОРНАЯ РАБОТА №5: ЗАДАНИЕ 4\n";
    std::cout << "Асинхронные вычисления с std::async\n";
    std::cout << "Метод Монте-Карло для вычисления π\n";
    
    PiCalculator calculator;
    
    try {
        // Демонстрация 1: Базовые вычисления
        {
            std::cout << "\n" << std::string(70, '=') << "\n";
            std::cout << "ДЕМОНСТРАЦИЯ 1: БАЗОВЫЕ ВЫЧИСЛЕНИЯ π\n";
            std::cout << std::string(70, '=') << "\n";
            
            std::cout << "\nИстинное значение π: " << std::setprecision(15) << M_PI << "\n";
            
            // Однопоточное вычисление
            calculator.calculatePiSingleThread(1000000);
            
            // Параллельное вычисление
            calculator.calculatePiParallel(1000000, 4);
        }
        
        // Демонстрация 2: Точность метода Монте-Карло
        calculator.testMonteCarloAccuracy(10000000);
        
        // Демонстрация 3: Сравнение производительности
        calculator.benchmarkPerformance(5000000);
        
        // Демонстрация 4: Политики запуска std::async
        calculator.demonstrateAsyncPolicies(500000);
        
        // Демонстрация 5: Обработка исключений
        demonstrateExceptions();
        
        // Демонстрация 6: Большое вычисление
        {
            std::cout << "\n" << std::string(70, '=') << "\n";
            std::cout << "ДЕМОНСТРАЦИЯ 6: БОЛЬШОЕ ВЫЧИСЛЕНИЕ\n";
            std::cout << std::string(70, '=') << "\n";
            
            std::cout << "Вычисление π с 100 миллионами точек...\n";
            
            calculator.calculatePiParallel(100000000, 8);
        }
        
        // Заключение
        std::cout << "\n" << std::string(70, '=') << "\n";
        std::cout << "ВЫВОДЫ И ЗАКЛЮЧЕНИЕ\n";
        std::cout << std::string(70, '=') << "\n";
        
        std::cout << "\nПреимущества std::async:\n";
        std::cout << "1. Простота использования по сравнению с std::thread\n";
        std::cout << "2. Автоматическое управление потоками\n";
        std::cout << "3. Возможность отложенного выполнения (deferred)\n";
        std::cout << "4. Легкая передача результатов через std::future\n";
        std::cout << "5. Автоматическая передача исключений\n";
        
        std::cout << "\nОсобенности метода Монте-Карло:\n";
        std::cout << "1. Точность ∝ √N (увеличивается медленно)\n";
        std::cout << "2. Легко распараллеливается\n";
        std::cout << "3. Требует много точек для высокой точности\n";
        std::cout << "4. Зависит от качества генератора случайных чисел\n";
        
        std::cout << "\nРекомендации по использованию:\n";
        std::cout << "• Используйте std::launch::async для гарантированного параллелизма\n";
        std::cout << "• Обрабатывайте исключения через try-catch при вызове get()\n";
        std::cout << "• Для CPU-bound задач оптимально 1-2 задачи на ядро CPU\n";
        std::cout << "• Используйте std::future::wait_for() для timeout\n";
        
    } catch (const std::exception& e) {
        std::cerr << "\nКритическая ошибка: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}