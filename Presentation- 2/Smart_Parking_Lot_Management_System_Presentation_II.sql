-- Smart Parking Lot Management System
-- Presentation-II SQL File
-- Name: Mithesh Kosanam
-- Roll Number: 25WU0102130

DROP DATABASE IF EXISTS smart_parking_db;
CREATE DATABASE smart_parking_db;
USE smart_parking_db;

-- =========================================================
-- 1. TABLE CREATION
-- =========================================================

CREATE TABLE customer (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(100)
);

CREATE TABLE vehicle (
    vehicle_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type VARCHAR(50) NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

CREATE TABLE parking_slot (
    slot_id INT PRIMARY KEY AUTO_INCREMENT,
    slot_number VARCHAR(10) NOT NULL UNIQUE,
    slot_type ENUM('Car', 'Bike') NOT NULL,
    status ENUM('FREE', 'OCCUPIED') NOT NULL DEFAULT 'FREE'
);

CREATE TABLE parking_session (
    session_id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT NOT NULL,
    slot_id INT NOT NULL,
    entry_time DATETIME NOT NULL,
    exit_time DATETIME NULL,
    status ENUM('ACTIVE', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id),
    FOREIGN KEY (slot_id) REFERENCES parking_slot(slot_id)
);

CREATE TABLE bill (
    bill_id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    bill_time DATETIME NOT NULL,
    FOREIGN KEY (session_id) REFERENCES parking_session(session_id)
);

CREATE TABLE payment (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    bill_id INT NOT NULL,
    payment_time DATETIME NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_mode ENUM('UPI', 'CARD', 'CASH') NOT NULL,
    status ENUM('SUCCESS', 'PENDING', 'FAILED') NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES bill(bill_id)
);

-- =========================================================
-- 2. DATA INSERTION
-- =========================================================

INSERT INTO customer (name, phone, email) VALUES
('Anjali Nair', '9876543219', 'anjali.nair@example.com'),
('Rahul Sharma', '9876543220', 'rahul.sharma@example.com'),
('Priya Reddy', '9876543221', 'priya.reddy@example.com'),
('Arjun Kumar', '9876543222', 'arjun.kumar@example.com'),
('Sneha Rao', '9876543223', 'sneha.rao@example.com');

INSERT INTO vehicle (customer_id, license_plate, vehicle_type) VALUES
(1, 'TS19UV8901', 'Car'),
(2, 'TS10CD5678', 'Bike'),
(3, 'TS11EF9012', 'Car'),
(4, 'TS12GH3456', 'Car'),
(5, 'TS13IJ7890', 'Bike');

INSERT INTO parking_slot (slot_number, slot_type, status) VALUES
('A01', 'Car', 'FREE'),
('A02', 'Car', 'OCCUPIED'),
('B01', 'Bike', 'OCCUPIED'),
('B02', 'Bike', 'FREE'),
('C01', 'Car', 'FREE');

INSERT INTO parking_session
(vehicle_id, slot_id, entry_time, exit_time, status)
VALUES
(1, 1, '2026-10-05 10:00:00', '2026-10-05 12:00:00', 'COMPLETED'),
(2, 3, '2026-10-05 13:00:00', NULL, 'ACTIVE'),
(3, 2, '2026-10-05 14:00:00', NULL, 'ACTIVE'),
(4, 4, '2026-10-05 09:00:00', '2026-10-05 10:20:00', 'COMPLETED'),
(5, 5, '2026-10-05 11:00:00', '2026-10-05 12:00:00', 'COMPLETED');

INSERT INTO bill (session_id, amount, bill_time) VALUES
(1, 120.00, '2026-10-05 12:00:00'),
(2, 50.00, '2026-10-05 14:00:00'),
(3, 80.00, '2026-10-05 15:00:00'),
(4, 40.00, '2026-10-05 10:20:00'),
(5, 60.00, '2026-10-05 12:00:00');

INSERT INTO payment
(bill_id, payment_time, amount_paid, payment_mode, status)
VALUES
(1, '2026-10-05 12:05:00', 120.00, 'UPI', 'SUCCESS'),
(2, '2026-10-05 14:05:00', 50.00, 'CARD', 'SUCCESS'),
(3, '2026-10-05 15:05:00', 80.00, 'CASH', 'SUCCESS'),
(4, '2026-10-05 10:25:00', 40.00, 'UPI', 'SUCCESS'),
(5, '2026-10-05 12:05:00', 60.00, 'CARD', 'SUCCESS');

-- =========================================================
-- 3. BASIC SELECT STATEMENTS
-- =========================================================

SHOW TABLES;

SELECT * FROM customer;

SELECT * FROM vehicle;

SELECT * FROM parking_slot;

SELECT * FROM parking_session;

SELECT * FROM bill;

SELECT * FROM payment;

-- =========================================================
-- 4. REQUIRED SELECT QUERIES
-- =========================================================

-- Occupied parking slots
SELECT slot_id, slot_number, slot_type, status
FROM parking_slot
WHERE status = 'OCCUPIED';

-- Active parking sessions
SELECT s.session_id,
       v.license_plate,
       ps.slot_number,
       s.entry_time,
       s.status
FROM parking_session s
JOIN vehicle v ON v.vehicle_id = s.vehicle_id
JOIN parking_slot ps ON ps.slot_id = s.slot_id
WHERE s.status = 'ACTIVE';

-- Customer and vehicle details
SELECT c.name,
       v.license_plate,
       v.vehicle_type
FROM customer c
JOIN vehicle v ON c.customer_id = v.customer_id
ORDER BY c.customer_id;

-- Total successful payment amount
SELECT SUM(amount_paid) AS total_revenue
FROM payment
WHERE status = 'SUCCESS';

-- =========================================================
-- 5. PRESENTATION-II QUERY
-- Customer: Anjali Nair
--
-- Retrieves:
-- Customer name
-- Vehicle license plate
-- Parking status
-- Total parking duration in minutes
-- Amount paid
-- Payment status
-- =========================================================

SELECT c.name,
       v.license_plate,
       s.status AS parking_status,
       TIMESTAMPDIFF(
           MINUTE,
           s.entry_time,
           COALESCE(s.exit_time, NOW())
       ) AS parking_minutes,
       p.amount_paid,
       CASE UPPER(p.status)
           WHEN 'SUCCESS' THEN 'PAID'
           ELSE UPPER(p.status)
       END AS payment_status
FROM customer c
JOIN vehicle v
    ON v.customer_id = c.customer_id
JOIN parking_session s
    ON s.vehicle_id = v.vehicle_id
LEFT JOIN bill b
    ON b.session_id = s.session_id
LEFT JOIN payment p
    ON p.bill_id = b.bill_id
WHERE c.name = 'Anjali Nair';

-- =========================================================
-- 6. ADDITIONAL VERIFICATION QUERIES
-- =========================================================

-- Complete customer-to-payment information
SELECT c.name,
       v.license_plate,
       ps.slot_number,
       s.entry_time,
       s.exit_time,
       s.status AS parking_status,
       b.amount AS bill_amount,
       p.amount_paid,
       p.payment_mode,
       p.status AS payment_status
FROM customer c
JOIN vehicle v
    ON c.customer_id = v.customer_id
JOIN parking_session s
    ON v.vehicle_id = s.vehicle_id
JOIN parking_slot ps
    ON s.slot_id = ps.slot_id
LEFT JOIN bill b
    ON s.session_id = b.session_id
LEFT JOIN payment p
    ON b.bill_id = p.bill_id
ORDER BY c.customer_id;

-- Number of customers
SELECT COUNT(*) AS total_customers
FROM customer;

-- Number of registered vehicles
SELECT COUNT(*) AS total_vehicles
FROM vehicle;

-- Number of occupied slots
SELECT COUNT(*) AS occupied_slots
FROM parking_slot
WHERE status = 'OCCUPIED';

-- Number of free slots
SELECT COUNT(*) AS free_slots
FROM parking_slot
WHERE status = 'FREE';

-- Average payment
SELECT AVG(amount_paid) AS average_payment
FROM payment
WHERE status = 'SUCCESS';

-- Maximum payment
SELECT MAX(amount_paid) AS maximum_payment
FROM payment
WHERE status = 'SUCCESS';

-- Minimum payment
SELECT MIN(amount_paid) AS minimum_payment
FROM payment
WHERE status = 'SUCCESS';

-- =========================================================
-- END OF PRESENTATION-II SQL FILE
-- =========================================================
