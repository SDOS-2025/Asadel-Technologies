from flask import Blueprint, request, jsonify, current_app
import jwt
import bcrypt
from datetime import datetime, timedelta
import logging
from backend.utils import get_db_connection

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

        # Get JWT secret key from app config
        secret_key = current_app.config['SECRET_KEY']

        # Generate JWT token
        token = jwt.encode({
            'user_id': user['id'],
            'username': user['username'],
            'exp': datetime.utcnow() + timedelta(days=1)
        }, secret_key)

        logger.info(f"User {username} logged in successfully")
        return jsonify({
            'token': token,
            'user': {
                'id': user['id'],
                'username': user['username']
            }
        })

    except Exception as e:
        logger.error(f"Error during login: {e}")
        return jsonify({'error': 'Server error'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close() 