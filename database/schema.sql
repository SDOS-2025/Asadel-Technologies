-- Basic Fire Detection System Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS asadel_db;
USE asadel_db;


-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('Admin', 'User') NOT NULL DEFAULT 'User',
    date_of_birth DATE NOT NULL,
    country VARCHAR(100) NOT NULL,
    access_type JSON NOT NULL DEFAULT ('["All"]'),
    profile_image_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (JSON_VALID(access_type)),
    CHECK (
        JSON_CONTAINS(access_type, '"All"') OR
        JSON_CONTAINS(access_type, '"Dashboard"') OR
        JSON_CONTAINS(access_type, '"Area Management"') OR
        JSON_CONTAINS(access_type, '"Camera Management"') OR
        JSON_CONTAINS(access_type, '"User Management"') OR
        JSON_CONTAINS(access_type, '"Reports and Analysis"')
    ),
    CHECK (
        LENGTH(password) >= 8 AND  -- Password must be at least 8 characters long
        password REGEXP '[A-Z]' AND  -- At least one uppercase letter
        password REGEXP '[a-z]' AND  -- At least one lowercase letter
        password REGEXP '[0-9]' AND  -- At least one number
        password REGEXP '[!@#$%^&*(),.?":{}|<>]'  -- At least one special character
    )
);
-- Users table
-- CREATE TABLE IF NOT EXISTS users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     username VARCHAR(255) NOT NULL UNIQUE,
--     password VARCHAR(255) NOT NULL,
--     email VARCHAR(255) UNIQUE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );




-- Cameras table
-- CREATE TABLE cameras (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(100) NOT NULL,
--     location VARCHAR(100),
--     rtsp_url VARCHAR(255) NOT NULL,
--     status ENUM('active', 'inactive') DEFAULT 'active',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Detections table
-- CREATE TABLE detections (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     camera_id INT NOT NULL,
--     type ENUM('fire', 'smoke') NOT NULL,
--     confidence FLOAT NOT NULL,
--     image_path VARCHAR(255),
--     detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (camera_id) REFERENCES cameras(id) ON DELETE CASCADE
-- );

-- Alerts table
-- CREATE TABLE alerts (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     detection_id INT NOT NULL,
--     status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
--     sent_at TIMESTAMP,
--     FOREIGN KEY (detection_id) REFERENCES detections(id) ON DELETE CASCADE
-- );

-- Add indexes for better performance
-- ALTER TABLE detections ADD INDEX idx_camera_date (camera_id, detected_at);
-- ALTER TABLE alerts ADD INDEX idx_detection (detection_id);

-- Drop table users;

Select * from users;




-- Cameras table
CREATE TABLE cameras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    rtsp_url VARCHAR(255) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Detections table
-- CREATE TABLE detections (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     camera_id INT NOT NULL,
--     type ENUM('fire', 'smoke') NOT NULL,
--     confidence FLOAT NOT NULL,
--     image_path VARCHAR(255),
--     detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (camera_id) REFERENCES cameras(id) ON DELETE CASCADE
-- );

-- Alerts table
-- CREATE TABLE alerts (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     detection_id INT NOT NULL,
--     status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
--     sent_at TIMESTAMP,
--     FOREIGN KEY (detection_id) REFERENCES detections(id) ON DELETE CASCADE
-- );

-- Add indexes for better performance
-- ALTER TABLE detections ADD INDEX idx_camera_date (camera_id, detected_at);
-- ALTER TABLE alerts ADD INDEX idx_detection (detection_id);

-- Insert default admin user (password: admin123)
-- INSERT INTO users (username, email, password, role, date_of_birth, country, access_type) 
-- VALUES ('admin', 'admin@example.com', '$2a$10$JK5QXwRUvD5e5xf5rT5YP.sQQ/Nz1RKE1GXxFRz9POyFn3t1KQjiG', 'admin', '1990-01-01', 'United States', '["all"]');

