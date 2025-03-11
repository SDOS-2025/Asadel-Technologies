# 🔥 Fire & Smoke Detection System

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.0-7952B3?logo=bootstrap)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)

A modular detection system designed for real-time fire and smoke detection with a scalable architecture that can be extended to other detection tasks such as PPE detection, human detection, and more.



## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [License](#license)

## 🔍 Overview

This project is a comprehensive frontend solution for a fire/smoke detection system that integrates with pretrained AI models to provide real-time detection alerts. The system is designed with modularity in mind, allowing for easy extension to other detection tasks in the future.

The dashboard provides a user-friendly interface for monitoring multiple camera feeds, configuring detection parameters, and viewing detection logs and analytics.

## ✨ Features

### 🖥️ Dashboard
- Real-time monitoring of multiple camera feeds
- Intuitive navigation between different system modules
- Responsive design for desktop and mobile devices

### 📹 Camera Management
- Add, edit, and delete camera configurations
- Configure RTSP URLs for video streams
- Organize cameras by regions and sub-regions

### 🚨 Detection Alerts
- Real-time fire and smoke detection alerts
- Configurable alert thresholds
- Visual and optional audio notifications

### 📊 Analytics & Reporting
- Historical detection data visualization
- Exportable reports in multiple formats
- Customizable date range filtering

### 👥 User Management
- Role-based access control
- User activity logging
- Secure authentication system

### ⚙️ System Configuration
- Adjustable detection sensitivity
- Notification preferences
- System performance settings

## 🛠️ Tech Stack

### Frontend
- **React**: Core framework for building the user interface
- **React Router**: For navigation and routing
- **React Bootstrap**: UI component library
- **React Icons**: For iconography


### Backend
- **Node.js**: Runtime environment
- **Express**: Web framework
- **Socket.IO**: For real-time communication

### Database
- **MySQL**: For storing detection logs, user data, and system configuration

### AI/ML
- **TensorFlow.js**: For client-side model inference
- **Custom pretrained models**: For fire and smoke detection


## 🏗️ System Architecture

The system follows a modular architecture with the following components:

1. **Frontend Module**: React-based dashboard for user interaction
2. **Detection Module**: Handles integration with AI models
3. **Database Module**: Manages data storage and retrieval
4. **API Module**: Facilitates communication between frontend and backend

This modular approach allows for:
- Independent development and testing of components
- Easy replacement or upgrade of individual modules
- Scalability to handle additional detection tasks

## 📥 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- MySQL (v8.0 or higher)

### Steps

1. Clone the repository:
```bash
git clone https://github.com/your-organization/fire-smoke-detection.git
cd fire-smoke-detection
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
# Run the SQL script to create the database schema
mysql -u username -p < database/schema.sql
```

5. Start the development server:
```bash
npm start
```

## 🚀 Usage

### Accessing the Dashboard
Navigate to `http://localhost:3000` in your web browser to access the dashboard.

### Adding Cameras
1. Go to the Camera Management section
2. Click "Add Camera"
3. Enter the camera details including RTSP URL
4. Assign to a region and sub-region
5. Save the configuration

### Configuring Detection Settings
1. Go to the Settings section
2. Adjust detection sensitivity
3. Configure notification preferences
4. Save changes

### Viewing Detection Logs
1. Go to the Reports & Analytics section
2. Select the desired date range
3. View detection events and export reports as needed

## 📚 API Documentation

The system exposes the following API endpoints:

### Authentication
- `POST /api/auth/login`: User login
- `POST /api/auth/logout`: User logout

### Cameras
- `GET /api/cameras`: List all cameras
- `POST /api/cameras`: Add a new camera
- `PUT /api/cameras/:id`: Update camera details
- `DELETE /api/cameras/:id`: Remove a camera

### Detections
- `GET /api/detections`: Get detection logs
- `POST /api/detections`: Record a new detection event

### Settings
- `GET /api/settings`: Get system settings
- `PUT /api/settings`: Update system settings

## 💾 Database Schema

The database consists of the following main tables:

### Users
- `id`: Primary key
- `username`: User's login name
- `password_hash`: Hashed password
- `role`: User role (admin, operator, viewer)
- `created_at`: Account creation timestamp

### Cameras
- `id`: Primary key
- `name`: Camera name
- `rtsp_url`: RTSP URL for the video stream
- `region_id`: Foreign key to regions table
- `sub_region_id`: Foreign key to sub_regions table
- `status`: Camera status (active, inactive)

### Detections
- `id`: Primary key
- `camera_id`: Foreign key to cameras table
- `detection_type`: Type of detection (fire, smoke)
- `confidence`: Detection confidence score
- `timestamp`: Detection timestamp
- `image_path`: Path to saved detection image

### Settings
- `id`: Primary key
- `key`: Setting name
- `value`: Setting value
- `updated_at`: Last update timestamp

## 🔄 Extending the System

The system is designed to be easily extended to other detection tasks:




## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
