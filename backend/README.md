# Backend Setup

This is the backend server for the Asadel Technologies application. It's built with Flask and uses MySQL as the database.

## Prerequisites

- Python 3.8 or higher
- MySQL Server
- pip (Python package installer)

## Setup Instructions

1. Create and activate virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create `.env` file in the backend directory with the following content:
   ```
   JWT_SECRET_KEY=your-secure-secret-key
   MYSQL_HOST=localhost
   MYSQL_USER=your_username
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=asadel_db
   ```

4. Set up the database:
   ```bash
   # Log into MySQL and run:
   mysql -u root -p < ../database/schema.sql
   ```

5. Run the server:
   ```bash
   python app.py
   ```

The server will start on `http://localhost:5000`.

## API Endpoints

### Authentication
- POST `/api/login` - User login
  - Request body: `{ "username": "string", "password": "string" }`
  - Response: `{ "token": "string", "user": { "id": number, "username": "string" } }`

## Development

To deactivate the virtual environment when you're done:
```bash
deactivate
``` 