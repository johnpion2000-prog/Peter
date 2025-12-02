#include <iostream>
#include <vector>
#include <thread>
#include <mutex>
#include <chrono>
#include <random>
#include <algorithm>
#include <iomanip>
#include <string>
#include <sstream>
#include <cmath>
#include <fstream>
#include <atomic>

class ImageProcessor {
private:
    std::vector<std::vector<int>> image;
    std::vector<std::vector<int>> processed_image;
    int width, height;
    
public:
    ImageProcessor(int w, int h) : width(w), height(h) {
        // Инициализация случайными значениями (от 0 до 255)
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<int> dist(0, 255);
        
        image.resize(static_cast<size_t>(height), 
                     std::vector<int>(static_cast<size_t>(width)));
        processed_image.resize(static_cast<size_t>(height), 
                               std::vector<int>(static_cast<size_t>(width)));
        
        for (int y = 0; y < height; ++y) {
            for (int x = 0; x < width; ++x) {
                image[static_cast<size_t>(y)][static_cast<size_t>(x)] = dist(gen);
            }
        }
        
        std::cout << "Изображение " << width << "x" << height 
                  << " создано (" << width * height << " пикселей)\n";
    }
    
    // Получить значение пикселя с проверкой границ
    int getPixel(int x, int y) const {
        if (x < 0) x = 0;
        if (x >= width) x = width - 1;
        if (y < 0) y = 0;
        if (y >= height) y = height - 1;
        return image[static_cast<size_t>(y)][static_cast<size_t>(x)];
    }
    
    // Фильтр размытия (усреднение 3x3)
    int blurPixel(int x, int y) {
        int sum = 0;
        int count = 0;
        
        // Проходим по окрестности 3x3
        for (int dy = -1; dy <= 1; ++dy) {
            for (int dx = -1; dx <= 1; ++dx) {
                int nx = x + dx;
                int ny = y + dy;
                
                // Используем getPixel для обработки граничных пикселей
                sum += getPixel(nx, ny);
                count++;
            }
        }
        
        return sum / count;
    }
    
    // Однопоточное применение фильтра
    void applyFilterSingleThread() {
        auto start_time = std::chrono::high_resolution_clock::now();
        
        for (int y = 0; y < height; ++y) {
            for (int x = 0; x < width; ++x) {
                processed_image[static_cast<size_t>(y)][static_cast<size_t>(x)] = blurPixel(x, y);
            }
        }
        
        auto end_time = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(
            end_time - start_time);
        
        std::cout << "Однопоточная обработка: " 
                  << duration.count() << " мс\n";
    }
    
    // Многопоточное применение фильтра (версия 1: простые потоки)
    void applyFilterMultiThread(int num_threads) {
        auto start_time = std::chrono::high_resolution_clock::now();
        
        std::vector<std::thread> threads;
        int rows_per_thread = height / num_threads;
        int remainder = height % num_threads;
        
        // Функция для обработки части изображения
        auto process_chunk = [this](int start_row, int end_row) {
            for (int y = start_row; y < end_row; ++y) {
                for (int x = 0; x < width; ++x) {
                    processed_image[static_cast<size_t>(y)][static_cast<size_t>(x)] = blurPixel(x, y);
                }
            }
        };
        
        // Создаем потоки
        int current_row = 0;
        for (int i = 0; i < num_threads; ++i) {
            int end_row = current_row + rows_per_thread;
            
            // Распределяем остаточные строки
            if (remainder > 0) {
                end_row++;
                remainder--;
            }
            
            threads.emplace_back(process_chunk, current_row, end_row);
            current_row = end_row;
        }
        
        // Ждем завершения всех потоков
        for (auto& thread : threads) {
            thread.join();
        }
        
        auto end_time = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(
            end_time - start_time);
        
        std::cout << "Многопоточная обработка (" << num_threads 
                  << " потока): " << duration.count() << " мс\n";
    }
    
    // Многопоточное применение фильтра с балансировкой нагрузки
    void applyFilterMultiThreadBalanced(int num_threads) {
        auto start_time = std::chrono::high_resolution_clock::now();
        
        std::vector<std::thread> threads;
        std::atomic<int> current_row{0};
        
        // Функция для потока
        auto thread_function = [this, &current_row]() {
            while (true) {
                int row = current_row.fetch_add(1);
                if (row >= height) break;
                
                for (int x = 0; x < width; ++x) {
                    processed_image[static_cast<size_t>(row)][static_cast<size_t>(x)] = blurPixel(x, row);
                }
            }
        };
        
        // Создаем потоки
        for (int i = 0; i < num_threads; ++i) {
            threads.emplace_back(thread_function);
        }
        
        // Ждем завершения всех потоков
        for (auto& thread : threads) {
            thread.join();
        }
        
        auto end_time = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(
            end_time - start_time);
        
        std::cout << "Балансированная многопоточная обработка (" << num_threads 
                  << " потока): " << duration.count() << " мс\n";
    }
    
    // Получить статистику изображения
    void printStatistics(const std::string& label) const {
        int min_val = 255;
        int max_val = 0;
        long long sum = 0;
        
        const auto& img = (label == "Исходное") ? image : processed_image;
        
        for (const auto& row : img) {
            for (int val : row) {
                if (val < min_val) min_val = val;
                if (val > max_val) max_val = val;
                sum += val;
            }
        }
        
        double average = static_cast<double>(sum) / (width * height);
        
        std::cout << "\n" << label << " изображение:\n";
        std::cout << "  Минимальное значение: " << min_val << "\n";
        std::cout << "  Максимальное значение: " << max_val << "\n";
        std::cout << "  Среднее значение: " << std::fixed << std::setprecision(2) 
                  << average << "\n";
    }
    
    // Визуализация изображения в ASCII (для маленьких изображений)
    void visualizeAsASCII(int max_width = 50, int max_height = 20) const {
        if (width > max_width || height > max_height) {
            std::cout << "\nИзображение слишком большое для ASCII-визуализации\n";
            return;
        }
        
        const std::string gradient = " .:-=+*#%@";
        
        std::cout << "\nВизуализация (используются символы: \"" << gradient << "\"):\n";
        
        for (int y = 0; y < height; ++y) {
            for (int x = 0; x < width; ++x) {
                int val = image[static_cast<size_t>(y)][static_cast<size_t>(x)];
                size_t index = static_cast<size_t>((val * (gradient.length() - 1)) / 255);
                std::cout << gradient[index];
            }
            std::cout << " | ";
            
            for (int x = 0; x < width; ++x) {
                int val = processed_image[static_cast<size_t>(y)][static_cast<size_t>(x)];
                size_t index = static_cast<size_t>((val * (gradient.length() - 1)) / 255);
                std::cout << gradient[index];
            }
            std::cout << "\n";
        }
        
        std::cout << "Исходное       | Обработанное\n";
    }
    
    // Сравнение производительности разных подходов
    void benchmarkPerformance(int max_threads = 8) {
        std::cout << "\n" << std::string(70, '=') << "\n";
        std::cout << "ТЕСТИРОВАНИЕ ПРОИЗВОДИТЕЛЬНОСТИ\n";
        std::cout << std::string(70, '=') << "\n";
        
        // Запускаем однопоточную обработку несколько раз для стабильности
        long long single_thread_time = 0;
        for (int i = 0; i < 3; ++i) {
            auto start = std::chrono::high_resolution_clock::now();
            applyFilterSingleThread();
            auto end = std::chrono::high_resolution_clock::now();
            single_thread_time += std::chrono::duration_cast<std::chrono::milliseconds>(
                end - start).count();
        }
        single_thread_time /= 3;
        
        std::cout << "\nСреднее время однопоточной обработки: " 
                  << single_thread_time << " мс\n";
        
        // Тестируем разное количество потоков
        std::cout << "\n" << std::string(70, '-') << "\n";
        std::cout << std::left << std::setw(15) << "Потоки" 
                  << std::setw(25) << "Простая (мс)" 
                  << std::setw(25) << "Балансированная (мс)" 
                  << std::setw(15) << "Ускорение" << "\n";
        std::cout << std::string(70, '-') << "\n";
        
        for (int threads = 1; threads <= max_threads; ++threads) {
            // Простая многопоточная обработка
            auto start = std::chrono::high_resolution_clock::now();
            applyFilterMultiThread(threads);
            auto end = std::chrono::high_resolution_clock::now();
            long long simple_time = std::chrono::duration_cast<std::chrono::milliseconds>(
                end - start).count();
            
            // Балансированная многопоточная обработка
            start = std::chrono::high_resolution_clock::now();
            applyFilterMultiThreadBalanced(threads);
            end = std::chrono::high_resolution_clock::now();
            long long balanced_time = std::chrono::duration_cast<std::chrono::milliseconds>(
                end - start).count();
            
            // Вычисляем ускорение
            double speedup = static_cast<double>(single_thread_time) / balanced_time;
            
            std::cout << std::left << std::setw(15) << threads 
                      << std::setw(25) << simple_time 
                      << std::setw(25) << balanced_time 
                      << std::fixed << std::setprecision(2) 
                      << speedup << "x\n";
        }
    }
};

// Демонстрация различных размеров изображений
void demonstrateDifferentSizes() {
    std::cout << "\n" << std::string(70, '=') << "\n";
    std::cout << "ДЕМОНСТРАЦИЯ ДЛЯ РАЗНЫХ РАЗМЕРОВ ИЗОБРАЖЕНИЙ\n";
    std::cout << std::string(70, '=') << "\n";
    
    // Исправление: используем vector пар
    std::vector<std::pair<int, int>> sizes = {
        {100, 100},     // Маленькое
        {500, 500},     // Среднее
        {1000, 1000},   // Большое
        {2000, 1500}    // Очень большое
    };
    
    for (const auto& size_pair : sizes) {
        int width = size_pair.first;
        int height = size_pair.second;
        
        std::cout << "\n\nРазмер изображения: " << width << "x" << height 
                  << " (" << width * height << " пикселей)\n";
        
        ImageProcessor processor(width, height);
        
        // Быстрое тестирование производительности
        auto start = std::chrono::high_resolution_clock::now();
        processor.applyFilterSingleThread();
        auto end = std::chrono::high_resolution_clock::now();
        long long single_time = std::chrono::duration_cast<std::chrono::milliseconds>(
            end - start).count();
        
        start = std::chrono::high_resolution_clock::now();
        processor.applyFilterMultiThreadBalanced(4);
        end = std::chrono::high_resolution_clock::now();
        long long multi_time = std::chrono::duration_cast<std::chrono::milliseconds>(
            end - start).count();
        
        double speedup = static_cast<double>(single_time) / multi_time;
        
        std::cout << "Ускорение (4 потока): " << std::fixed << std::setprecision(2) 
                  << speedup << "x\n";
    }
}

int main() {
    std::cout << "ЛАБОРАТОРНАЯ РАБОТА №5: ЗАДАНИЕ 3\n";
    std::cout << "Параллельная обработка изображений\n";
    
    // Демонстрация 1: Базовый пример
    {
        std::cout << "\n" << std::string(70, '=') << "\n";
        std::cout << "ДЕМОНСТРАЦИЯ 1: БАЗОВЫЙ ПРИМЕР\n";
        std::cout << std::string(70, '=') << "\n";
        
        // Создаем небольшое изображение для демонстрации
        ImageProcessor processor(10, 10);
        
        // Показываем исходное изображение
        processor.printStatistics("Исходное");
        
        // Обработка разными способами
        processor.applyFilterSingleThread();
        processor.applyFilterMultiThread(4);
        processor.applyFilterMultiThreadBalanced(4);
        
        // Показываем результат
        processor.printStatistics("Обработанное");
        processor.visualizeAsASCII();
    }
    
    // Демонстрация 2: Производительность для большого изображения
    {
        std::cout << "\n" << std::string(70, '=') << "\n";
        std::cout << "ДЕМОНСТРАЦИЯ 2: БОЛЬШОЕ ИЗОБРАЖЕНИЕ\n";
        std::cout << std::string(70, '=') << "\n";
        
        ImageProcessor processor(2000, 1500);  // 3 миллиона пикселей
        
        processor.benchmarkPerformance();
    }
    
    // Демонстрация 3: Разные размеры изображений
    demonstrateDifferentSizes();
    
    // Заключение
    std::cout << "\n" << std::string(70, '=') << "\n";
    std::cout << "ВЫВОДЫ И ЗАКЛЮЧЕНИЕ\n";
    std::cout << std::string(70, '=') << "\n";
    
    std::cout << "\nКлючевые моменты параллельной обработки изображений:\n\n";
    std::cout << "1. РАЗДЕЛЕНИЕ ДАННЫХ:\n";
    std::cout << "   - Изображение делится на горизонтальные полосы\n";
    std::cout << "   - Каждый поток обрабатывает свою полосу\n";
    std::cout << "   - Минимальные накладные расходы на синхронизацию\n\n";
    
    std::cout << "2. БАЛАНСИРОВКА НАГРУЗКИ:\n";
    std::cout << "   - Простое разделение: фиксированные полосы\n";
    std::cout << "   - Динамическая балансировка: потоки берут строки по мере готовности\n";
    std::cout << "   - Динамический подход лучше для неоднородных вычислений\n\n";
    
    std::cout << "3. ЛОКАЛЬНОСТЬ ДАННЫХ:\n";
    std::cout << "   - Фильтры работают с локальной окрестностью пикселей\n";
    std::cout << "   - Минимизация обращений к памяти других потоков\n";
    std::cout << "   - Кэш - дружественная обработка\n\n";
    
    return 0;
}