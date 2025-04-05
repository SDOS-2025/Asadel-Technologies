# Asadel Technologies Backend

This is the backend server for Asadel Technologies web application.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- Windows: `venv\Scripts\activate`
- Linux/Mac: `source venv/bin/activate`

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file with the following content:
```
MYSQL_HOST=localhost
MYSQL_USER=your_mysql_username
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=asadel_db
JWT_SECRET_KEY=your_secret_key
```

5. Initialize the database:
```bash
python backend/init_db.py
```

6. Run the server:
```bash
python backend/app.py
```

## API Endpoints

### Authentication

- `POST /api/login`: User login
  - Request: `{ "username": "username", "password": "password" }`
  - Response: `{ "token": "jwt_token", "user": { "id": 1, "username": "username" } }`

### User Management

- `GET /api/users`: Get all users (paginated)
  - Query parameters: `page` (default: 1)
  - Response: `{ "users": [...], "total_pages": 5, "current_page": 1 }`

- `GET /api/users/:id`: Get user details
  - Response: User details including profile image URL

- `POST /api/users`: Create a new user
  - Request: Form data with user details and optional profile image
  - Response: `{ "message": "User created successfully", "user_id": 1 }`

- `PUT /api/users/:id`: Update user details
  - Request: Form data with user details to update
  - Response: `{ "message": "User updated successfully" }`

- `DELETE /api/users/:id`: Delete a user
  - Response: `{ "message": "User deleted successfully" }`

### Camera Management

- `GET /api/cameras`: Get all cameras (paginated)
  - Query parameters: `page` (default: 1)
  - Response: `{ "cameras": [...], "total_pages": 5, "current_page": 1 }`

- `GET /api/cameras/:id`: Get camera details
  - Response: Camera details

- `POST /api/cameras`: Add a new camera
  - Request: 
  ```json
  { 
    "name": "Camera Name", 
    "rtsp_url": "rtsp://...", 
    "region": "Region", 
    "sub_region": "Sub-region",
    "description": "Description",
    "access_level": "Admin"
  }
  ```
  - Response: `{ "message": "Camera added successfully", "camera_id": 1 }`

- `PUT /api/cameras/:id`: Update camera details
  - Request: JSON with camera fields to update
  - Response: `{ "message": "Camera updated successfully" }`

- `PUT /api/cameras/:id/status`: Update camera status
  - Request: `{ "status": "Active" }` or `{ "status": "Inactive" }`
  - Response: `{ "message": "Camera status updated to Active" }`

- `DELETE /api/cameras/:id`: Delete a camera
  - Response: `{ "message": "Camera deleted successfully" }`

### Settings

- `GET /api/uploads/profile_images/:filename`: Serve profile image files 