-- ============================================
-- ЛАБОРАТОРНАЯ РАБОТА ПО РЕЛЯЦИОННЫМ БАЗАМ ДАННЫХ
-- ИСПРАВЛЕННАЯ ВЕРСИЯ
-- ============================================

-- Часть 2.2: Создание базы данных
-- ============================================
-- В терминале выполнить: mysql -u rudn_student_2 -p

-- Удаляем базу если существует (для тестирования)
DROP DATABASE IF EXISTS fast_food_resto_test123;

-- Создание базы данных
CREATE DATABASE fast_food_resto_test123 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_0900_ai_ci;

USE fast_food_resto_test123;

-- Часть 2.3: Создание таблиц
-- ============================================

-- 1. Таблица positions (должности)
CREATE TABLE IF NOT EXISTS positions (
    id INT NOT NULL AUTO_INCREMENT,
    position_name VARCHAR(255) NOT NULL,
    description TEXT,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Таблица division (подразделения)
CREATE TABLE IF NOT EXISTS division (
    id INT NOT NULL AUTO_INCREMENT,
    division_name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    phone VARCHAR(20),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Таблица chief (руководители)
CREATE TABLE IF NOT EXISTS chief (
    id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(255) NOT NULL,
    second_name VARCHAR(255) NOT NULL,
    division_id INT DEFAULT NULL,
    email VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. Таблица employees (сотрудники)
CREATE TABLE IF NOT EXISTS employees (
    id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(255) NOT NULL,
    second_name VARCHAR(255) NOT NULL,
    position_id INT DEFAULT NULL,
    division_id INT DEFAULT NULL,
    hire_date DATE,
    email VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(20),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5. Таблица schedule (расписание)
CREATE TABLE IF NOT EXISTS schedule (
    id INT NOT NULL AUTO_INCREMENT,
    employee_id INT NOT NULL,
    work_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    shift_type VARCHAR(50),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6. Таблица goods (товары) - УПРОЩЕННАЯ без CHECK
CREATE TABLE IF NOT EXISTS goods (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    available BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (id),
    UNIQUE KEY unique_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 7. Таблица orders (заказы)
CREATE TABLE IF NOT EXISTS orders (
    id INT NOT NULL AUTO_INCREMENT,
    employee_id INT NOT NULL,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    customer_name VARCHAR(255),
    total_price DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'pending',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 8. Таблица orders_goods (связь заказов и товаров)
CREATE TABLE IF NOT EXISTS orders_goods (
    id INT NOT NULL AUTO_INCREMENT,
    order_id INT NOT NULL,
    good_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_time DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Часть 2.4: Создание ограничений на внешние ключи
-- ============================================

-- 1. Связь employees -> schedule
ALTER TABLE schedule 
ADD CONSTRAINT fk_schedule_employees
FOREIGN KEY (employee_id) 
REFERENCES employees(id)
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- 2. Связь employees -> orders
ALTER TABLE orders 
ADD CONSTRAINT fk_orders_employees
FOREIGN KEY (employee_id) 
REFERENCES employees(id)
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- 3. Связь employees -> positions
ALTER TABLE employees 
ADD CONSTRAINT fk_employees_positions
FOREIGN KEY (position_id) 
REFERENCES positions(id)
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- 4. Связь employees -> division
ALTER TABLE employees 
ADD CONSTRAINT fk_employees_division
FOREIGN KEY (division_id) 
REFERENCES division(id)
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- 5. Связь chief -> division
ALTER TABLE chief 
ADD CONSTRAINT fk_chief_division
FOREIGN KEY (division_id) 
REFERENCES division(id)
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- 6. Связь orders -> orders_goods
ALTER TABLE orders_goods 
ADD CONSTRAINT fk_ordersgoods_orders
FOREIGN KEY (order_id) 
REFERENCES orders(id)
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- 7. Связь orders_goods -> goods
ALTER TABLE orders_goods 
ADD CONSTRAINT fk_ordersgoods_goods
FOREIGN KEY (good_id) 
REFERENCES goods(id)
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- Заполнение базы тестовыми данными
-- ============================================

-- positions
INSERT INTO positions (position_name, description) VALUES
('Менеджер', 'Управление рестораном'),
('Повар', 'Приготовление пищи'),
('Кассир', 'Обслуживание клиентов'),
('Уборщик', 'Поддержание чистоты');

-- division
INSERT INTO division (division_name, address, phone) VALUES
('Центральный ресторан', 'ул. Центральная, 1', '+79990000001'),
('Северный филиал', 'ул. Северная, 15', '+79990000002');

-- chief
INSERT INTO chief (first_name, second_name, division_id, email) VALUES
('Александр', 'Петров', 1, 'chief1@email.com'),
('Елена', 'Сидорова', 2, 'chief2@email.com');

-- employees
INSERT INTO employees (first_name, second_name, position_id, division_id, hire_date, email) VALUES
('Иван', 'Иванов', 1, 1, '2023-01-15', 'ivanov@email.com'),
('Петр', 'Петров', 2, 1, '2023-02-20', 'petrov@email.com'),
('Сергей', 'Сидоров', 3, 2, '2023-03-10', 'sidorov@email.com'),
('Анна', 'Смирнова', 3, 1, '2023-04-05', 'smirnova@email.com');

-- goods
INSERT INTO goods (name, price, category) VALUES
('Чизбургер', 150.00, 'Бургеры'),
('Гамбургер', 120.00, 'Бургеры'),
('Картофель фри', 80.00, 'Гарниры'),
('Кола', 90.00, 'Напитки'),
('Мороженое', 60.00, 'Десерты');

-- schedule
INSERT INTO schedule (employee_id, work_date, start_time, end_time, shift_type) VALUES
(1, '2024-01-15', '09:00:00', '17:00:00', 'Дневная'),
(2, '2024-01-15', '10:00:00', '18:00:00', 'Дневная'),
(3, '2024-01-15', '12:00:00', '20:00:00', 'Вечерная');

-- orders
INSERT INTO orders (employee_id, customer_name, status) VALUES
(3, 'Алексей', 'completed'),
(4, 'Мария', 'completed'),
(3, 'Дмитрий', 'pending');

-- orders_goods
INSERT INTO orders_goods (order_id, good_id, quantity, price_at_time) VALUES
(1, 2, 2, 120.00),
(1, 4, 1, 90.00),
(2, 3, 1, 80.00),
(2, 4, 2, 90.00),
(3, 5, 3, 60.00);

-- Часть 2.5: Проверка ограничений в таблицах
-- ============================================
SHOW CREATE TABLE goods;
SHOW CREATE TABLE employees;

-- Часть 2.6: Вставка записей, нарушающих ограничения
-- ============================================
-- Эти команды должны вызвать ошибки:

-- 1. price < 0 (вызовет ошибку при вставке, но не из-за CHECK)
INSERT INTO goods (name, price) VALUES ('Биг Мак', -100.00);

-- 2. Не передан price (NOT NULL constraint)
INSERT INTO goods (name) VALUES ('Биг Мак');

-- 3. name не уникален (UNIQUE constraint)
INSERT INTO goods (name, price) VALUES ('Чизбургер', 200.00);

-- 4. name - пустая строка (пройдет, так как пустая строка ≠ NULL)
-- Для этого лучше использовать триггер или проверку приложением
INSERT INTO goods (name, price) VALUES ('', 100.00);

-- Часть 2.7: Проверка работы внешних ключей
-- ============================================

-- 1. Попытка удалить сотрудника с расписанием (должно завершиться неудачей)
DELETE FROM employees WHERE id = 1;

-- 2. Удаление заказа с каскадным удалением
DELETE FROM orders WHERE id = 1;

-- Проверка каскадного удаления
SELECT 'Проверка каскадного удаления:' as info;
SELECT * FROM orders_goods WHERE order_id = 1;

-- Восстанавливаем удаленный заказ
INSERT INTO orders (id, employee_id, customer_name, status) 
VALUES (1, 3, 'Алексей', 'completed');

INSERT INTO orders_goods (order_id, good_id, quantity, price_at_time) 
VALUES (1, 2, 2, 120.00), (1, 4, 1, 90.00);

-- Часть 3: Работа с данными
-- ============================================

-- 1. Все столбцы
SELECT * FROM employees;

-- 2. Конкретные столбцы
SELECT first_name, second_name, email FROM employees;

-- 3. Уникальные значения
SELECT DISTINCT position_id FROM employees;

-- 4. Ограничение количества
SELECT * FROM goods LIMIT 3;

-- 5. Сортировка ASC
SELECT * FROM employees ORDER BY second_name ASC;

-- 6. Сортировка по нескольким столбцам
SELECT * FROM employees ORDER BY division_id DESC, second_name ASC;

-- 7. Несколько условий WHERE
SELECT * FROM employees 
WHERE position_id = 3 AND (division_id = 1 OR division_id = 2);

-- 8. Фильтрация по конкретному значению
SELECT * FROM goods WHERE category = 'Бургеры';

-- 9. Проверка на неравенство
SELECT * FROM goods WHERE price != 120.00;

-- 10. Диапазон значений
SELECT * FROM goods WHERE price BETWEEN 50 AND 100;

-- 11. Оператор IN
SELECT * FROM employees WHERE id IN (1, 3, 4);
SELECT * FROM employees WHERE id NOT IN (2);

-- 12. Оператор LIKE
SELECT * FROM employees WHERE first_name LIKE 'И%';
SELECT * FROM employees WHERE second_name LIKE '%ов';
SELECT * FROM employees WHERE email LIKE '%@email.com';
SELECT * FROM goods WHERE name LIKE '_ам%';

-- Часть 4: Объединение таблиц
-- ============================================

-- 1. Обновление total_price
UPDATE orders o
SET total_price = (
    SELECT IFNULL(SUM(og.quantity * og.price_at_time), 0)
    FROM orders_goods og
    WHERE og.order_id = o.id
);

SELECT * FROM orders;

-- 2. Товар, который не покупали
SELECT g.id, g.name, g.category
FROM goods g
LEFT JOIN orders_goods og ON g.id = og.good_id
WHERE og.good_id IS NULL;

-- 3. Сотрудник с наибольшим количеством заказов
SELECT 
    e.first_name,
    e.second_name,
    COUNT(o.id) as order_count
FROM employees e
LEFT JOIN orders o ON e.id = o.employee_id
GROUP BY e.id
ORDER BY order_count DESC
LIMIT 1;

-- 4. Средняя сумма заказа
SELECT 
    ROUND(AVG(total_price), 2) as average_order_price
FROM orders
WHERE status = 'completed';

-- 5. Средняя сумма по месяцам
SELECT 
    DATE_FORMAT(order_date, '%Y-%m') as month,
    ROUND(AVG(total_price), 2) as average_monthly_order_price,
    COUNT(*) as orders_count
FROM orders
WHERE status = 'completed'
GROUP BY DATE_FORMAT(order_date, '%Y-%m')
ORDER BY month DESC;

-- 6. Рейтинг сотрудников (упрощенная версия без CTE)
-- Сначала считаем среднее
SELECT @avg_sold := AVG(total_sold) FROM (
    SELECT 
        e.id,
        COALESCE(SUM(og.quantity), 0) as total_sold
    FROM employees e
    LEFT JOIN orders o ON e.id = o.employee_id
    LEFT JOIN orders_goods og ON o.id = og.order_id AND og.good_id = 4
    GROUP BY e.id
) as sales;

-- Теперь выбираем сотрудников с продажами выше среднего
SELECT 
    e.first_name,
    e.second_name,
    COALESCE(SUM(og.quantity), 0) as total_sold
FROM employees e
LEFT JOIN orders o ON e.id = o.employee_id
LEFT JOIN orders_goods og ON o.id = og.order_id AND og.good_id = 4
GROUP BY e.id
HAVING COALESCE(SUM(og.quantity), 0) > @avg_sold
ORDER BY total_sold DESC;

-- Часть 5: Транзакции (основные команды)
-- ============================================

-- 1. Переменные транзакций
SHOW VARIABLES LIKE '%transaction%';

-- 2. Изменение уровня изоляции
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
SELECT @@transaction_isolation;
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- 3. Простая транзакция
START TRANSACTION;
INSERT INTO orders (employee_id, customer_name, status) 
VALUES (3, 'Транзакционный клиент', 'pending');
SET @new_id = LAST_INSERT_ID();
INSERT INTO orders_goods (order_id, good_id, quantity, price_at_time) 
VALUES (@new_id, 1, 1, 150.00);
COMMIT;

-- Проверка
SELECT * FROM orders WHERE id = @new_id;

-- 4. Дополнительные проверки
SHOW TABLES;
DESCRIBE goods;
DESCRIBE orders;