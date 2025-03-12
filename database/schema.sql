-- Basic Fire Detection System Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS fire_detection;
USE fire_detection;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
CREATE TABLE detections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    camera_id INT NOT NULL,
    type ENUM('fire', 'smoke') NOT NULL,
    confidence FLOAT NOT NULL,
    image_path VARCHAR(255),
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (camera_id) REFERENCES cameras(id) ON DELETE CASCADE
);

-- Alerts table
CREATE TABLE alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    detection_id INT NOT NULL,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    sent_at TIMESTAMP,
    FOREIGN KEY (detection_id) REFERENCES detections(id) ON DELETE CASCADE
);

-- Add indexes for better performance
ALTER TABLE detections ADD INDEX idx_camera_date (camera_id, detected_at);
ALTER TABLE alerts ADD INDEX idx_detection (detection_id);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@example.com', '$2a$10$JK5QXwRUvD5e5xf5rT5YP.sQQ/Nz1RKE1GXxFRz9POyFn3t1KQjiG', 'admin'); 