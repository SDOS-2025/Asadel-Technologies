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
import re

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

# Validation functions
def validate_email(email):
    # RFC 5322 compliant email regex with dot and TLD requirements
    email_pattern = r'^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$'
    
    # Additional length checks
    if len(email) > 254:
        return False
        
    # Split into local and domain parts
    parts = email.split('@')
    if len(parts) != 2:
        return False
        
    local_part, domain = parts
    
    # Check local part length (max 64 characters)
    if len(local_part) > 64:
        return False
        
    # Check for consecutive dots in local part
    if '..' in local_part:
        return False
        
    # Check domain part
    if not domain:
        return False
        
    # Check if domain has at least one dot
    if '.' not in domain:
        return False
        
    # Check domain parts length (max 63 characters each)
    domain_parts = domain.split('.')
    if any(len(part) > 63 for part in domain_parts):
        return False
        
    # Check if TLD is at least 2 characters
    if len(domain_parts[-1]) < 2:
        return False
        
    return bool(re.match(email_pattern, email))

def validate_password(password):
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character"
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one digit"
    return True, None

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

@app.route('/api/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        logger.info(f"Received user creation request with data: {data}")
        
        # Validate required fields
        required_fields = ['username', 'password', 'email', 'role', 'date_of_birth', 'country', 'access_type']
        for field in required_fields:
            if field not in data:
                logger.error(f"Missing required field: {field}")
                return jsonify({'error': f'{field} is required'}), 400

        # Validate email format
        if not validate_email(data['email']):
            logger.error(f"Invalid email format: {data['email']}")
            return jsonify({'error': 'Invalid email format'}), 400

        # Validate password
        is_valid_password, password_error = validate_password(data['password'])
        if not is_valid_password:
            logger.error(f"Invalid password: {password_error}")
            return jsonify({'error': password_error}), 400

        # Hash the password
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())

        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if email already exists
        cursor.execute('SELECT id FROM users WHERE email = %s', (data['email'],))
        if cursor.fetchone():
            logger.error(f"Email already exists: {data['email']}")
            return jsonify({'error': 'Email already exists'}), 400

        # Insert new user
        try:
            cursor.execute('''
                INSERT INTO users (username, password, email, role, date_of_birth, country, access_type)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            ''', (
                data['username'],
                hashed_password,
                data['email'],
                data['role'],
                data['date_of_birth'],
                data['country'],
                data['access_type']
            ))
            
            conn.commit()
            new_user_id = cursor.lastrowid
            logger.info(f"Successfully created user with ID: {new_user_id}")

            return jsonify({
                'message': 'User created successfully',
                'user_id': new_user_id
            }), 201
        except Error as e:
            logger.error(f"Database error while inserting user: {e}")
            return jsonify({'error': f'Database error: {str(e)}'}), 500

    except Error as e:
        logger.error(f"Database error while creating user: {e}")
        return jsonify({'error': 'Database error'}), 500
    except Exception as e:
        logger.error(f"Unexpected error while creating user: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000) 