-- Asadel Technologies Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS asadel_db;
USE asadel_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    country VARCHAR(100),
    access_type JSON,
    profile_image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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

