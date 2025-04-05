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
  - Response: Camera details including region and sub-region names

- `POST /api/cameras`: Add a new camera
  - Request: 
  ```json
  { 
    "name": "Camera Name", 
    "rtsp_url": "rtsp://...", 
    "region": "1", 
    "sub_region": "1",
    "description": "Description",
    "access_level": "1"
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

### Area Management

- `GET /api/regions`: Get all regions with their sub-regions
  - Response: 
  ```json
  { 
    "success": true, 
    "data": [
      {
        "id": 1,
        "region": "Building A",
        "subRegions": [
          {
            "id": 1,
            "name": "Floor 1",
            "region_id": 1
          },
          {
            "id": 2,
            "name": "Floor 2",
            "region_id": 1
          }
        ]
      }
    ]
  }
  ```

- `GET /api/regions/:id`: Get details of a specific region
  - Response: Region details with its sub-regions

- `GET /api/regions-list`: Get a simplified list of regions
  - Response: Basic list of regions for dropdown menus

- `POST /api/regions`: Create a new region
  - Request: `{ "name": "Region Name", "description": "Description" }`
  - Response: `{ "message": "Region added successfully", "region_id": 1 }`

- `PUT /api/regions/:id`: Update region details
  - Request: JSON with region fields to update
  - Response: `{ "message": "Region updated successfully" }`

- `DELETE /api/regions/:id`: Delete a region
  - Response: `{ "message": "Region deleted successfully" }`

- `POST /api/sub-regions`: Add a sub-region to a region
  - Request: `{ "name": "Sub-region Name", "region_id": 1, "description": "Description" }`
  - Response: `{ "message": "Sub-region added successfully", "sub_region_id": 1 }`

- `PUT /api/sub-regions/:id`: Update sub-region details
  - Request: JSON with sub-region fields to update
  - Response: `{ "message": "Sub-region updated successfully" }`

- `DELETE /api/sub-regions/:id`: Delete a sub-region
  - Response: `{ "message": "Sub-region deleted successfully" }`

### File Serving

- `GET /api/uploads/profile_images/:filename`: Serve profile image files 

## Project Structure

The backend follows a modular architecture using Flask Blueprints:

```
backend/
├── app.py                  # Main Flask application
├── init_db.py              # Database initialization script
├── schema.sql              # SQL schema definitions
├── utils.py                # Utility functions
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables
├── blueprints/             # API endpoints organized by feature
│   ├── auth/               # Authentication endpoints
│   ├── users/              # User management endpoints
│   ├── cameras/            # Camera management endpoints
│   └── areas/              # Area management endpoints
└── uploads/                # For storing uploaded files
```

## Database Schema

The database includes the following tables:

- `users`: User account information
- `cameras`: Camera configurations
- `regions`: Physical locations/areas
- `sub_regions`: Sub-divisions of regions

See `schema.sql` for detailed table structures. 