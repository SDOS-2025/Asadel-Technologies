-- Asadel Technologies Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS asadel_db;
USE asadel_db;

-- Users table
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('Admin', 'User') NOT NULL DEFAULT 'User',
    date_of_birth DATE NOT NULL,
    country VARCHAR(100) NOT NULL,
    access_type JSON NOT NULL ,
    profile_image_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (JSON_VALID(access_type)),
    CHECK (
        JSON_CONTAINS(access_type, '"Dashboard"') OR
        JSON_CONTAINS(access_type, '"Area Management"') OR
        JSON_CONTAINS(access_type, '"Camera Management"') OR
        JSON_CONTAINS(access_type, '"User Management"') OR
        JSON_CONTAINS(access_type, '"Reports and Analytics"')
    ),
    CHECK (
        LENGTH(password) >= 8 AND  -- Password must be at least 8 characters long
        password REGEXP '[A-Z]' AND  -- At least one uppercase letter
        password REGEXP '[a-z]' AND  -- At least one lowercase letter
        password REGEXP '[0-9]' AND  -- At least one number
        password REGEXP '[!@#$%^&*(),.?":{}|<>]'  -- At least one special character
    )
);


-- Drop tables if they exist to ensure proper relationships
DROP TABLE IF EXISTS cameras;
DROP TABLE IF EXISTS sub_regions;
DROP TABLE IF EXISTS regions;

-- Regions table
CREATE TABLE regions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sub-regions table
CREATE TABLE sub_regions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    region_id INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_subregion_per_region (name, region_id)
);

-- Cameras table
CREATE TABLE cameras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rtsp_url VARCHAR(255) NOT NULL,
    region INT NOT NULL,
    sub_region INT NOT NULL,
    description TEXT,
    access_level INT NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (region) REFERENCES regions(id) ON DELETE RESTRICT,
    FOREIGN KEY (sub_region) REFERENCES sub_regions(id) ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS detections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    camera_id INT NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    confidence FLOAT NOT NULL,
    time_stamp VARCHAR(8) NOT NULL,
    date_created VARCHAR(8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (camera_id) REFERENCES cameras(id)
);

-- Future tables can be added below as the system expands:

-- Example: Detections table for storing detection events
-- CREATE TABLE detections (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     camera_id INT NOT NULL,
--     detection_type ENUM('fire', 'smoke', 'ppe', 'human') NOT NULL,
--     confidence FLOAT NOT NULL,
--     image_path VARCHAR(255),
--     detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (camera_id) REFERENCES cameras(id) ON DELETE CASCADE
-- );

