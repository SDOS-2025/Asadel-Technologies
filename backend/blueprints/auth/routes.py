from flask import Blueprint, request, jsonify, current_app
import jwt
import bcrypt
from datetime import datetime, timedelta
import logging
from backend.utils import get_db_connection
from mysql.connector import Error

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/api')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    conn = None
    cursor = None
    try:
        # Attempt to connect to the database
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

        # Get JWT secret key from app config
        secret_key = current_app.config['SECRET_KEY']

        # Generate JWT token
        token = jwt.encode({
            'user_id': user['id'],
            'username': user['username'],
            # 'role': user['role'],
            'exp': datetime.utcnow() + timedelta(days=1)
        }, secret_key)

        logger.info(f"User {username} logged in successfully")
        return jsonify({
            'token': token
            
        })

    except Error as e:
        logger.error(f"Database error during login: {e}")
        error_message = "Database connection error"
        
        # Provide more specific error messages based on the MySQL error
        if hasattr(e, 'errno'):
            if e.errno == 1045:  # Access denied for user
                error_message = "Database access denied. Please contact an administrator."
            elif e.errno == 1049:  # Unknown database
                error_message = "Database does not exist. Please contact an administrator."
            elif e.errno == 2003:  # Can't connect to MySQL server
                error_message = "Cannot connect to database server. Please check if it's running."
        
        return jsonify({'error': error_message}), 500
    except Exception as e:
        logger.error(f"Unexpected error during login: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close() 