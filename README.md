# 🔥 Fire & Smoke Detection System

![Version](https://img.shields.io/badge/version-1.1.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.0-7952B3?logo=bootstrap)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)
![Flask](https://img.shields.io/badge/Flask-2.0.1-000000?logo=flask)
![YOLO](https://img.shields.io/badge/YOLO-v8-00FFFF?logo=yolo)

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
- [Notification System](#notification-system)
- [Video Sources](#video-sources)
- [Environment Configuration](#environment-configuration)
- [License](#license)

## 🔍 Overview

This project is a comprehensive solution for a fire/smoke detection system that integrates with pretrained AI models to provide real-time detection alerts. The system is designed with modularity in mind, allowing for easy extension to other detection tasks in the future.

The dashboard provides a user-friendly interface for monitoring multiple camera feeds, configuring detection parameters, managing camera regions and sub-regions, and viewing detection logs and analytics.

## ✨ Features

### 🖥️ Dashboard
- Real-time monitoring of multiple camera feeds
- Intuitive navigation between different system modules
- Responsive design for desktop and mobile devices

### 📹 Camera Management
- Add, edit, and delete camera configurations
- Configure RTSP URLs for video streams
- Organize cameras by regions and sub-regions
- Toggle camera status (Active/Inactive)
- Assign access levels to control camera visibility

### 🗺️ Area Management
- Create and manage regions and sub-regions
- Hierarchical organization of physical spaces
- Associate cameras with specific areas for better organization
- Simplified navigation through camera feeds by location

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
- **Flask**: Python web framework for the API
- **MySQL Connector**: For database interactions
- **JWT**: For secure authentication
- **OpenCV**: For video feed processing and frame extraction
- **yt-dlp**: For YouTube video stream extraction

### Database
- **MySQL**: For storing user data, camera configurations, regions, and system settings

### AI/ML
- **Ultralytics YOLO**: For object detection and fire/smoke identification
- **OpenCV**: For image processing and computer vision tasks
- **Custom pretrained models**: For fire and smoke detection

## 🏗️ System Architecture

The system follows a modular architecture with the following components:

1. **Frontend Module**: React-based dashboard for user interaction
2. **Backend Module**: Flask API with Blueprint-based organization
3. **Detection Module**: Handles integration with AI models
4. **Database Module**: Manages data storage and retrieval
5. **Authentication Module**: Handles user authentication and authorization
6. **Notification Module**: Manages alerts and notifications to administrators

This modular approach allows for:
- Independent development and testing of components
- Easy replacement or upgrade of individual modules
- Scalability to handle additional detection tasks or features

## 📥 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Python (v3.8 or higher)
- MySQL (v8.0 or higher)

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/your-organization/fire-smoke-detection.git
cd fire-smoke-detection
```

2. Set up Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r backend/requirements.txt
```

3. Configure environment variables:
```bash
# Edit backend/.env file with your database credentials
MYSQL_HOST=localhost
MYSQL_USER=your_mysql_username
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=asadel_db
JWT_SECRET_KEY=your_secret_key
EMAIL_APP_PASSWORD=your_email_app_password
```

4. Initialize the database:
```bash
python backend/init_db.py
```

5. Start the backend server:
```bash
python backend/app.py
```

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
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
4. Select a region and sub-region from the dropdown menus
5. Set the access level and description
6. Save the configuration

### Managing Areas
1. Go to the Area Management section
2. Use the interface to add new regions
3. For each region, add relevant sub-regions
4. Existing regions and sub-regions can be edited or deleted

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
- `POST /api/login`: User login

### Users
- `GET /api/users`: List all users (paginated)
- `GET /api/users/:id`: Get user details
- `POST /api/users`: Create a new user
- `PUT /api/users/:id`: Update user details
- `DELETE /api/users/:id`: Delete a user

### Cameras
- `GET /api/cameras`: List all cameras (paginated)
- `GET /api/cameras/:id`: Get camera details
- `POST /api/cameras`: Add a new camera
- `PUT /api/cameras/:id`: Update camera details
- `PUT /api/cameras/:id/status`: Update camera status
- `DELETE /api/cameras/:id`: Delete a camera

### Regions & Sub-regions
- `GET /api/regions`: Get all regions with their sub-regions
- `GET /api/regions/:id`: Get details of a specific region
- `GET /api/regions-list`: Get a simplified list of regions
- `POST /api/regions`: Create a new region
- `PUT /api/regions/:id`: Update a region
- `DELETE /api/regions/:id`: Delete a region
- `POST /api/sub-regions`: Add a sub-region to a region
- `PUT /api/sub-regions/:id`: Update a sub-region
- `DELETE /api/sub-regions/:id`: Delete a sub-region

## 💾 Database Schema

The database consists of the following main tables:

### Users
- `id`: Primary key
- `username`: User's login name
- `password_hash`: Hashed password
- `role`: User role (admin, operator, viewer)
- `created_at`: Account creation timestamp
- `email`: Email address for notifications

### Cameras
- `id`: Primary key
- `name`: Camera name
- `rtsp_url`: RTSP URL for the video stream
- `region`: Foreign key to regions table
- `sub_region`: Foreign key to sub_regions table
- `description`: Camera description
- `access_level`: Access level required to view this camera
- `status`: Camera status (Active, Inactive)
- `created_at`: Creation timestamp

### Regions
- `id`: Primary key
- `name`: Region name
- `description`: Optional description
- `created_at`: Creation timestamp

### Sub_Regions
- `id`: Primary key
- `name`: Sub-region name
- `region_id`: Foreign key to regions table
- `description`: Optional description
- `created_at`: Creation timestamp

### Detection_Logs
- `id`: Primary key
- `camera_id`: Foreign key to cameras table
- `region_id`: Foreign key to regions table
- `sub_region_id`: Foreign key to sub_regions table
- `detection_type`: Type of detection (fire, smoke)
- `confidence`: Detection confidence level
- `timestamp`: When the detection occurred
- `image_path`: Path to saved screenshot of detection

## 🔄 Extending the System

The system is designed to be easily extended to other detection tasks:
- Add new detection models to the frontend
- Create new database tables and API endpoints for new features
- Implement new UI components for additional functionality

## 📧 Notification System

The system includes a robust email notification system to alert administrators when fire or smoke is detected:

### Email Notifications
- Automatic email alerts to all admin users when fire/smoke is detected
- Detailed information including camera name, region, sub-region, and timestamp
- Intelligent deduplication to prevent alert fatigue
- Configurable thresholds for notification triggering

### Setup Requirements
- Gmail account for sending alert emails
- App password for secure authentication (2FA required)
- Admin user emails stored in database

### Configuration
Email notification system is configured through the `.env` file with the following parameters:
```
EMAIL_APP_PASSWORD=your_app_password
```

The system uses a dedicated Gmail account (`warningfireasadel@gmail.com`) to send notifications.

## 📹 Video Sources

The system supports multiple video sources for detection:

### Supported Video Inputs
- **RTSP Streams**: Connect to IP cameras or security DVR/NVR systems
- **YouTube Links**: Process live streams or uploaded videos from YouTube
- **Local Files**: Analyze video files stored on the server
- **CCTV Cameras**: Connect to existing CCTV infrastructure

### YouTube Integration
YouTube links can be directly entered as camera sources. The system will:
1. Extract the video stream using yt-dlp
2. Process frames through the detection model
3. Display the results on the dashboard

### URL Format Examples
- RTSP: `rtsp://username:password@192.168.1.100:554/stream1`
- YouTube: `https://www.youtube.com/watch?v=VIDEO_ID`
- Local File: `/path/to/local/video.mp4`

## ⚙️ Environment Configuration

The application uses environment variables for configuration. Create a `.env` file in the project root:

```
# Database configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=asadel_db

# JWT secret key for authentication
JWT_SECRET_KEY=your-secret-key

# Email credentials
EMAIL_APP_PASSWORD=your_app_password

# Server configuration
PORT=5000
DEBUG=True
```

## 📄 License

This project is licensed under the MIT License
