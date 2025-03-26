from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import bcrypt
import jwt
import os
import logging
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# Database configuration
db_config = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', ''),
    'database': os.getenv('MYSQL_DATABASE', 'asadel_db')
}

# JWT Configuration
app.config['SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')

def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        if connection.is_connected():
            logger.info('Successfully connected to the database')
            return connection
    except Error as e:
        logger.error(f"Error connecting to MySQL: {e}")
        raise



@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Query user from database
        cursor.execute('SELECT * FROM users WHERE username = %s', (username,))
        user = cursor.fetchone()

        if not user:
            logger.warning(f"Login attempt failed: User {username} not found")
            return jsonify({'error': 'Invalid credentials'}), 401

        # Verify password
        stored_password = user['password']
        if isinstance(stored_password, str):
            stored_password = stored_password.encode('utf-8')
            
        if not bcrypt.checkpw(password.encode('utf-8'), stored_password):
            logger.warning(f"Login attempt failed: Invalid password for user {username}")
            return jsonify({'error': 'Invalid credentials'}), 401

        # Generate JWT token
        token = jwt.encode({
            'user_id': user['id'],
            'username': user['username'],
            'exp': datetime.utcnow() + timedelta(days=1)
        }, app.config['SECRET_KEY'])

        logger.info(f"User {username} logged in successfully")
        return jsonify({
            'token': token,
            'user': {
                'id': user['id'],
                'username': user['username']
            }
        })

    except Error as e:
        logger.error(f"Database error during login: {e}")
        return jsonify({'error': 'Database connection error'}), 500
    except Exception as e:
        logger.error(f"Unexpected error during login: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        page = int(request.args.get('page', 1))
        per_page = 10
        offset = (page - 1) * per_page

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get total count of users
        cursor.execute('SELECT COUNT(*) as total FROM users')
        total_users = cursor.fetchone()['total']
        total_pages = (total_users + per_page - 1) // per_page

        # Get paginated users
        cursor.execute('''
            SELECT 
                id, 
                username as full_name, 
                role, 
                access_type as access_level,
                created_at,
                country,
                date_of_birth
            FROM users 
            LIMIT %s OFFSET %s
        ''', (per_page, offset))
        
        users = cursor.fetchall()

        return jsonify({
            'users': users,
            'total_pages': total_pages,
            'current_page': page
        })

    except Error as e:
        logger.error(f"Database error while fetching users: {e}")
        return jsonify({'error': 'Database error'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if user exists
        cursor.execute('SELECT id FROM users WHERE id = %s', (user_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'User not found'}), 404

        # Delete the user
        cursor.execute('DELETE FROM users WHERE id = %s', (user_id,))
        conn.commit()

        return jsonify({'message': 'User deleted successfully'})

    except Error as e:
        logger.error(f"Database error while deleting user: {e}")
        return jsonify({'error': 'Database error'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute('''
            SELECT 
                id, 
                username as full_name, 
                role, 
                access_type as access_level,
                created_at,
                country,
                date_of_birth
            FROM users 
            WHERE id = %s
        ''', (user_id,))
        
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify(user)

    except Error as e:
        logger.error(f"Database error while fetching user: {e}")
        return jsonify({'error': 'Database error'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000) 