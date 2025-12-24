-- ============================================
-- СОЗДАНИЕ БАЗЫ ДАННЫХ И ТАБЛИЦ
-- Реализация ER-диаграммы в нотации Мартина
-- ============================================

-- Удаляем базу данных если существует (для тестирования)
DROP DATABASE IF EXISTS fast_food_restaurant;

-- Создание базы данных
CREATE DATABASE fast_food_restaurant 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE fast_food_restaurant;

-- ============================================
-- ТАБЛИЦА 1: ДОЛЖНОСТИ (POSITIONS)
-- ============================================
CREATE TABLE positions (
    id INT NOT NULL AUTO_INCREMENT,                     -- Первичный ключ
    position_name VARCHAR(255) NOT NULL,               -- Название должности
    description TEXT,                                   -- Описание должности
    PRIMARY KEY (id)                                    -- Ограничение: первичный ключ
);

-- ============================================
-- ТАБЛИЦА 2: ПОДРАЗДЕЛЕНИЯ (DIVISION)
-- ============================================
CREATE TABLE division (
    id INT NOT NULL AUTO_INCREMENT,                     -- Первичный ключ
    division_name VARCHAR(255) NOT NULL,                -- Название филиала
    address VARCHAR(500),                               -- Адрес филиала
    phone VARCHAR(20),                                  -- Телефон филиала
    PRIMARY KEY (id)                                    -- Ограничение: первичный ключ
);

-- ============================================
-- ТАБЛИЦА 3: РУКОВОДИТЕЛИ (CHIEF)
-- ============================================
CREATE TABLE chief (
    id INT NOT NULL AUTO_INCREMENT,                     -- Первичный ключ
    first_name VARCHAR(255) NOT NULL,                   -- Имя руководителя
    second_name VARCHAR(255) NOT NULL,                  -- Фамилия руководителя
    division_id INT DEFAULT NULL,                       -- Внешний ключ к division
    email VARCHAR(255),                                 -- Email руководителя
    PRIMARY KEY (id),                                   -- Ограничение: первичный ключ
    INDEX idx_division (division_id)                    -- Индекс для внешнего ключа
);

-- ============================================
-- ТАБЛИЦА 4: СОТРУДНИКИ (EMPLOYEES)
-- ============================================
CREATE TABLE employees (
    id INT NOT NULL AUTO_INCREMENT,                     -- Первичный ключ
    first_name VARCHAR(255) NOT NULL,                   -- Имя сотрудника
    second_name VARCHAR(255) NOT NULL,                  -- Фамилия сотрудника
    position_id INT DEFAULT NULL,                       -- Внешний ключ к positions
    division_id INT DEFAULT NULL,                       -- Внешний ключ к division
    hire_date DATE,                                     -- Дата найма
    email VARCHAR(255),                                 -- Email сотрудника
    phone VARCHAR(20),                                  -- Телефон сотрудника
    PRIMARY KEY (id),                                   -- Ограничение: первичный ключ
    INDEX idx_position (position_id),                   -- Индекс для внешнего ключа
    INDEX idx_division (division_id)                    -- Индекс для внешнего ключа
);

-- ============================================
-- ТАБЛИЦА 5: РАСПИСАНИЕ (SCHEDULE)
-- ============================================
CREATE TABLE schedule (
    id INT NOT NULL AUTO_INCREMENT,                     -- Первичный ключ
    employee_id INT NOT NULL,                           -- Внешний ключ к employees
    work_date DATE NOT NULL,                            -- Дата работы
    start_time TIME NOT NULL,                           -- Время начала
    end_time TIME NOT NULL,                             -- Время окончания
    shift_type VARCHAR(50),                             -- Тип смены
    PRIMARY KEY (id),                                   -- Ограничение: первичный ключ
    INDEX idx_employee (employee_id)                    -- Индекс для внешнего ключа
);

-- ============================================
-- ТАБЛИЦА 6: ТОВАРЫ (GOODS)
-- ============================================
CREATE TABLE goods (
    id INT NOT NULL AUTO_INCREMENT,                     -- Первичный ключ
    name VARCHAR(255) NOT NULL,                         -- Название товара
    description TEXT,                                   -- Описание товара
    price DECIMAL(10, 2) NOT NULL,                     -- Цена товара
    category VARCHAR(100),                              -- Категория товара
    available BOOLEAN DEFAULT TRUE,                     -- Доступность товара
    PRIMARY KEY (id),                                   -- Ограничение: первичный ключ
    UNIQUE KEY unique_name (name)                       -- Ограничение: уникальное название
);

-- ============================================
-- ТАБЛИЦА 7: ЗАКАЗЫ (ORDERS)
-- ============================================
CREATE TABLE orders (
    id INT NOT NULL AUTO_INCREMENT,                     -- Первичный ключ
    employee_id INT NOT NULL,                           -- Внешний ключ к employees
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,      -- Дата заказа
    customer_name VARCHAR(255),                         -- Имя клиента
    total_price DECIMAL(10, 2) DEFAULT 0.00,           -- Общая сумма заказа
    status VARCHAR(50) DEFAULT 'pending',              -- Статус заказа
    PRIMARY KEY (id),                                   -- Ограничение: первичный ключ
    INDEX idx_employee (employee_id)                    -- Индекс для внешнего ключ
);

-- ============================================
-- ТАБЛИЦА 8: ЗАКАЗЫ_ТОВАРЫ (ORDERS_GOODS)
-- ============================================
CREATE TABLE orders_goods (
    id INT NOT NULL AUTO_INCREMENT,                     -- Первичный ключ
    order_id INT NOT NULL,                              -- Внешний ключ к orders
    good_id INT NOT NULL,                               -- Внешний ключ к goods
    quantity INT NOT NULL,                              -- Количество товара
    price_at_time DECIMAL(10, 2) NOT NULL,             -- Цена товара на момент заказа
    PRIMARY KEY (id),                                   -- Ограничение: первичный ключ
    UNIQUE KEY unique_order_good (order_id, good_id),   -- Ограничение: уникальная комбинация заказ-товар
    INDEX idx_order (order_id),                         -- Индекс для внешнего ключа
    INDEX idx_good (good_id)                            -- Индекс для внешнего ключа
);

-- ============================================
-- ЗАПОЛНЕНИЕ ТЕСТОВЫМИ ДАННЫМИ
-- ============================================

-- Заполнение таблицы positions
INSERT INTO positions (position_name, description) VALUES
('Менеджер', 'Управление рестораном'),
('Повар', 'Приготовление пищи'),
('Кассир', 'Обслуживание клиентов'),
('Уборщик', 'Поддержание чистоты'),
('Официант', 'Обслуживание посетителей');

-- Заполнение таблицы division
INSERT INTO division (division_name, address, phone) VALUES
('Центральный ресторан', 'ул. Центральная, 1', '+79990000001'),
('Северный филиал', 'ул. Северная, 15', '+79990000002'),
('Южный филиал', 'ул. Южная, 25', '+79990000003');

-- Заполнение таблицы chief
INSERT INTO chief (first_name, second_name, division_id, email) VALUES
('Александр', 'Петров', 1, 'chief1@email.com'),
('Елена', 'Сидорова', 2, 'chief2@email.com'),
('Игорь', 'Кузнецов', 3, 'chief3@email.com');

-- Заполнение таблицы employees
INSERT INTO employees (first_name, second_name, position_id, division_id, hire_date, email, phone) VALUES
('Иван', 'Иванов', 1, 1, '2023-01-15', 'ivanov@email.com', '+79110000001'),
('Петр', 'Петров', 2, 1, '2023-02-20', 'petrov@email.com', '+79110000002'),
('Сергей', 'Сидоров', 3, 2, '2023-03-10', 'sidorov@email.com', '+79110000003'),
('Анна', 'Смирнова', 3, 1, '2023-04-05', 'smirnova@email.com', '+79110000004'),
('Мария', 'Козлова', 5, 3, '2023-05-12', 'kozlova@email.com', '+79110000005');

-- Заполнение таблицы goods
INSERT INTO goods (name, description, price, category, available) VALUES
('Чизбургер', 'Булочка с сыром и котлетой', 150.00, 'Бургеры', TRUE),
('Гамбургер', 'Булочка с котлетой', 120.00, 'Бургеры', TRUE),
('Картофель фри', 'Хрустящий картофель', 80.00, 'Гарниры', TRUE),
('Кола', 'Газированный напиток', 90.00, 'Напитки', TRUE),
('Мороженое', 'Пломбир ванильный', 60.00, 'Десерты', TRUE),
('Шаурма', 'Лаваш с мясом и овощами', 180.00, 'Горячее', TRUE),
('Салат Цезарь', 'Салат с курицей и соусом', 130.00, 'Салаты', FALSE);

-- Заполнение таблицы orders
INSERT INTO orders (employee_id, customer_name, total_price, status) VALUES
(3, 'Алексей', 330.00, 'completed'),
(4, 'Мария', 260.00, 'completed'),
(3, 'Дмитрий', 180.00, 'pending'),
(5, 'Ольга', 400.00, 'processing'),
(4, 'Николай', 210.00, 'completed');

-- Заполнение таблицы orders_goods
INSERT INTO orders_goods (order_id, good_id, quantity, price_at_time) VALUES
(1, 2, 2, 120.00),  -- 2 гамбургера
(1, 4, 1, 90.00),   -- 1 кола
(2, 3, 1, 80.00),   -- 1 картофель фри
(2, 4, 2, 90.00),   -- 2 колы
(3, 5, 3, 60.00),   -- 3 мороженых
(4, 6, 2, 180.00),  -- 2 шаурмы
(4, 4, 1, 90.00),   -- 1 кола
(5, 1, 1, 150.00),  -- 1 чизбургер
(5, 3, 1, 80.00);   -- 1 картофель фри

-- Заполнение таблицы schedule
INSERT INTO schedule (employee_id, work_date, start_time, end_time, shift_type) VALUES
(1, '2024-01-15', '09:00:00', '17:00:00', 'Дневная'),
(2, '2024-01-15', '10:00:00', '18:00:00', 'Дневная'),
(3, '2024-01-15', '12:00:00', '20:00:00', 'Вечерная'),
(4, '2024-01-16', '08:00:00', '16:00:00', 'Утренняя'),
(5, '2024-01-16', '14:00:00', '22:00:00', 'Вечерная');

-- ============================================
-- СОЗДАНИЕ ВНЕШНИХ КЛЮЧЕЙ (ПОСЛЕ ЗАПОЛНЕНИЯ ДАННЫХ)
-- ============================================

-- Связь 1: chief -> division (1:N)
ALTER TABLE chief 
ADD CONSTRAINT fk_chief_division
FOREIGN KEY (division_id) 
REFERENCES division(id)
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Связь 2: employees -> positions (1:N)
ALTER TABLE employees 
ADD CONSTRAINT fk_employees_positions
FOREIGN KEY (position_id) 
REFERENCES positions(id)
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Связь 3: employees -> division (1:N)
ALTER TABLE employees 
ADD CONSTRAINT fk_employees_division
FOREIGN KEY (division_id) 
REFERENCES division(id)
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Связь 4: schedule -> employees (1:N)
ALTER TABLE schedule 
ADD CONSTRAINT fk_schedule_employees
FOREIGN KEY (employee_id) 
REFERENCES employees(id)
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Связь 5: orders -> employees (1:N)
ALTER TABLE orders 
ADD CONSTRAINT fk_orders_employees
FOREIGN KEY (employee_id) 
REFERENCES employees(id)
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- Связь 6: orders_goods -> orders (1:N)
ALTER TABLE orders_goods 
ADD CONSTRAINT fk_ordersgoods_orders
FOREIGN KEY (order_id) 
REFERENCES orders(id)
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Связь 7: orders_goods -> goods (1:N)
ALTER TABLE orders_goods 
ADD CONSTRAINT fk_ordersgoods_goods
FOREIGN KEY (good_id) 
REFERENCES goods(id)
ON DELETE RESTRICT 
ON UPDATE CASCADE;

-- ============================================
-- СОЗДАНИЕ ДОПОЛНИТЕЛЬНЫХ ИНДЕКСОВ
-- ============================================

-- Индекс для поиска товаров по категории
CREATE INDEX idx_goods_category ON goods(category);

-- Индекс для поиска заказов по дате
CREATE INDEX idx_orders_date ON orders(order_date);

-- Индекс для поиска сотрудников по филиалу и должности
CREATE INDEX idx_employees_division_position ON employees(division_id, position_id);

-- Индекс для поиска расписания по дате
CREATE INDEX idx_schedule_date ON schedule(work_date);

-- ============================================
-- ПРОВЕРКА СТРУКТУРЫ И ДАННЫХ
-- ============================================

-- Вывод информации о всех таблицах
SHOW TABLES;

-- Количество записей в каждой таблице
SELECT 'employees' as table_name, COUNT(*) as record_count FROM employees
UNION ALL
SELECT 'goods', COUNT(*) FROM goods
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'orders_goods', COUNT(*) FROM orders_goods
UNION ALL
SELECT 'schedule', COUNT(*) FROM schedule
UNION ALL
SELECT 'positions', COUNT(*) FROM positions
UNION ALL
SELECT 'division', COUNT(*) FROM division
UNION ALL
SELECT 'chief', COUNT(*) FROM chief;

-- Пример запроса: товары дороже 100 рублей
SELECT name, price, category 
FROM goods 
WHERE price > 100 
ORDER BY price DESC;

-- Пример запроса: сотрудники по отделам
SELECT 
    e.first_name,
    e.second_name,
    p.position_name,
    d.division_name
FROM employees e
LEFT JOIN positions p ON e.position_id = p.id
LEFT JOIN division d ON e.division_id = d.id
ORDER BY d.division_name, p.position_name;

-- Показать успешное завершение
SELECT '✅ База данных успешно создана и заполнена!' as Status;