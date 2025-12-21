// Created by Kirill on 04.12.2025.
//

/*
**Задача:**
1. Создайте класс `DatabaseManager` с методами для подключения к базе данных
2. Реализуйте создание таблиц `students` и `grades`
3. Добавьте базовую оптимизацию базы данных
 */

#include "lib/sqlite3.h"
#include <iostream>
#include <string>
#include <stdexcept>

class DatabaseManager {
private:
    sqlite3* db;
    bool isOpen;

public:
    DatabaseManager() : db(nullptr), isOpen(false) {}

    ~DatabaseManager() {
        closeDatabase();
    }

    bool initialize(const std::string& filename) {
        // Закрываем существующее соединение, если есть
        closeDatabase();
        
        if (sqlite3_open(filename.c_str(), &db) != SQLITE_OK) {
            std::cerr << "Cannot open database: " << sqlite3_errmsg(db) << std::endl;
            return false;
        }
        
        isOpen = true;

        // Настройка базы данных
        if (!optimizeDatabase()) {
            std::cerr << "Failed to optimize database" << std::endl;
            return false;
        }
        
        if (!createTables()) {
            std::cerr << "Failed to create tables" << std::endl;
            return false;
        }

        return true;
    }

    void closeDatabase() {
        if (db) {
            sqlite3_close(db);
            db = nullptr;
        }
        isOpen = false;
    }

    bool optimizeDatabase() {
        // Проверяем каждую команду
        if (!execute("PRAGMA journal_mode = WAL;")) return false;
        if (!execute("PRAGMA foreign_keys = ON;")) return false;
        if (!execute("PRAGMA cache_size = -64000;")) return false;
        if (!execute("PRAGMA synchronous = NORMAL;")) return false;
        
        sqlite3_busy_timeout(db, 5000);
        return true;
    }

    bool createTables() {
        const char* sql = R"(
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE,
                group_name TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS grades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                subject TEXT NOT NULL,
                grade INTEGER CHECK (grade >= 0 AND grade <= 10),
                exam_date DATE DEFAULT CURRENT_DATE,
                FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
            );

            -- Индексы для оптимизации запросов
            CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
            CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
            CREATE INDEX IF NOT EXISTS idx_grades_subject ON grades(subject);
        )";

        return execute(sql);
    }

    bool execute(const std::string& sql) {
        if (!isOpen || !db) {
            std::cerr << "Database not initialized" << std::endl;
            return false;
        }

        char* errorMessage = nullptr;
        int result = sqlite3_exec(db, sql.c_str(), nullptr, nullptr, &errorMessage);

        if (result != SQLITE_OK) {
            std::cerr << "SQL error: " << errorMessage << std::endl;
            sqlite3_free(errorMessage);
            return false;
        }

        return true;
    }

    bool executeWithTransaction(const std::string& sql) {
        if (!execute("BEGIN TRANSACTION;")) {
            return false;
        }
        
        bool success = execute(sql);
        
        if (success) {
            execute("COMMIT;");
        } else {
            execute("ROLLBACK;");
        }
        
        return success;
    }

    sqlite3* getHandle() const {
        return db;
    }

    bool isDatabaseOpen() const {
        return isOpen;
    }
};

int main() {
    DatabaseManager dbManager;

    try {
        if (!dbManager.initialize("test.db")) {
            std::cerr << "Failed to initialize database" << std::endl;
            return 1;
        }

        // Создаем студента
        if (!dbManager.execute(
            "INSERT INTO students (name, email, group_name) "
            "VALUES ('Иван Петров', 'ivan@example.com', 'CS-101');"
        )) {
            std::cerr << "Failed to insert student" << std::endl;
            return 1;
        }

        // Создаем оценку для студента
        if (!dbManager.execute(
            "INSERT INTO grades (student_id, subject, grade) "
            "VALUES (1, 'Математика', 5);"
        )) {
            std::cerr << "Failed to insert grade" << std::endl;
            return 1;
        }

        std::cout << "Database operations completed successfully!" << std::endl;
        
    } catch (const std::exception& e) {
        std::cerr << "Exception: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}