from flask import Flask, request, jsonify, send_from_directory, url_for
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
import json
from werkzeug.utils import secure_filename
from functools import wraps

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Load environment variables
load_dotenv()

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads', 'profile_images')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_profile_image(file, user_id):
    try:
        logger.debug(f"Starting save_profile_image. File: {file.filename}, Content-Type: {file.content_type}")
        if file and allowed_file(file.filename):
            # Create secure filename with timestamp
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = secure_filename(f"{user_id}_{timestamp}_{file.filename}")
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            # Debug logs
            logger.debug(f"Saving profile image: {filename}")
            logger.debug(f"File path: {filepath}")
            logger.debug(f"Upload folder exists: {os.path.exists(app.config['UPLOAD_FOLDER'])}")
            
            # Save file
            file.save(filepath)
            logger.debug(f"File saved successfully to: {filepath}")
            
            # Return relative path for database storage using forward slashes
            relative_path = os.path.join('uploads', 'profile_images', filename).replace('\\', '/')
            logger.debug(f"Image saved successfully. Relative path: {relative_path}")
            return relative_path
        else:
            logger.error(f"Invalid file type or no file provided: {file.filename if file else 'None'}")
            logger.error(f"Allowed extensions: {ALLOWED_EXTENSIONS}")
            return None
    except Exception as e:
        logger.error(f"Error saving profile image: {e}")
        logger.error(f"Exception type: {type(e)}")
        return None

# Database configuration
db_config = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', ''),
    'database': os.getenv('MYSQL_DATABASE', 'asadel_db')
}

# JWT Configuration
app.config['SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
            
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = data
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

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

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Query user from database
        cursor.execute('SELECT * FROM users WHERE username = %s', (username,))
        user = cursor.fetchone()  # Fetch the result immediately

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
            'token': token
        })

    except Error as e:
        logger.error(f"Database error during login: {e}")
        return jsonify({'error': 'Database connection error'}), 500
    except Exception as e:
        logger.error(f"Unexpected error during login: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        try:
            if cursor:
                cursor.close()
        except Exception as e:
            logger.error(f"Error closing cursor: {e}")
        try:
            if conn and conn.is_connected():
                conn.close()
        except Exception as e:
            logger.error(f"Error closing connection: {e}")

@app.route('/api/users', methods=['GET'])
@token_required
def get_users(current_user):
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

@app.route('/api/users/me', methods=['DELETE'])
@token_required
def delete_user(current_user):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # First get the user's profile image URL
        cursor.execute('SELECT profile_image_url FROM users WHERE id = %s', (current_user['user_id'],))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Delete the profile image if it exists
        if user['profile_image_url']:
            image_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), user['profile_image_url'])
            if os.path.exists(image_path):
                os.remove(image_path)
        
        # Delete the user from database
        cursor.execute('DELETE FROM users WHERE id = %s', (current_user['user_id'],))
        conn.commit()
        
        return jsonify({'message': 'User deleted successfully'})
        
    except Error as e:
        logger.error(f"Database error while deleting user: {e}")
        return jsonify({'error': 'Database error'}), 500
    except Exception as e:
        logger.error(f"Unexpected error while deleting user: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user_by_id(current_user, user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check if the user to be deleted exists
        cursor.execute('SELECT profile_image_url FROM users WHERE id = %s', (user_id,))
        user_result = cursor.fetchone()
        
        if not user_result:
            return jsonify({'error': 'User not found'}), 404
            
        # Delete the profile image if it exists
        if user_result['profile_image_url']:
            try:
                # Get the full path to the image
                image_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), user_result['profile_image_url'])
                logger.debug(f"Attempting to delete image at path: {image_path}")
                
                if os.path.exists(image_path):
                    os.remove(image_path)
                    logger.info(f"Successfully deleted profile image: {image_path}")
                else:
                    logger.warning(f"Profile image not found at path: {image_path}")
            except Exception as e:
                logger.error(f"Error deleting profile image: {str(e)}")
        
        # Delete the user from database
        cursor.execute('DELETE FROM users WHERE id = %s', (user_id,))
        conn.commit()
        
        return jsonify({'message': 'User deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        return jsonify({'error': 'Failed to delete user'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

@app.route('/uploads/profile_images/<path:filename>')
def serve_profile_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/users/me', methods=['GET'])
@token_required
def get_current_user(current_user):
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
                date_of_birth,
                email,
                profile_image_url
            FROM users 
            WHERE id = %s
        ''', (current_user['user_id'],))
        
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # If there's a profile image, construct the full URL
        if user.get('profile_image_url'):
            # Get the base URL of the server
            base_url = request.host_url.rstrip('/')
            # Construct the full URL for the image
            user['profile_image_url'] = f"{base_url}/{user['profile_image_url']}"

        return jsonify(user)

    except Error as e:
        logger.error(f"Database error while fetching user: {e}")
        return jsonify({'error': 'Database error'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

@app.route('/api/users/<int:user_id>', methods=['GET'])
@token_required
def get_user_by_id(current_user, user_id):
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
                date_of_birth,
                email,
                profile_image_url
            FROM users 
            WHERE id = %s
        ''', (user_id,))
        
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # If there's a profile image, construct the full URL
        if user.get('profile_image_url'):
            # Get the base URL of the server
            base_url = request.host_url.rstrip('/')
            # Construct the full URL for the image
            user['profile_image_url'] = f"{base_url}/{user['profile_image_url']}"

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
@token_required
def create_user(current_user):
    try:
       
            
        data = request.form.to_dict()
        profile_image = request.files.get('profileImage')
        
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
            
            new_user_id = cursor.lastrowid

            # Handle profile image if provided
            profile_image_url = None
            if profile_image:
                if profile_image.content_length > MAX_FILE_SIZE:
                    return jsonify({'error': 'Profile image must be less than 5MB'}), 400
                    
                profile_image_url = save_profile_image(profile_image, new_user_id)
                if profile_image_url:
                    cursor.execute('''
                        UPDATE users 
                        SET profile_image_url = %s 
                        WHERE id = %s
                    ''', (profile_image_url, new_user_id))
            
            conn.commit()

            return jsonify({
                'message': 'User created successfully',
                'user_id': new_user_id,
                'profile_image_url': profile_image_url
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

@app.route('/api/users/me', methods=['PUT'])
@token_required
def update_user(current_user):
    try:
        # Always use form data
        data = request.form.to_dict()
        profile_image = request.files.get('profileImage')
        
        # Debug logs
        logger.debug(f"Received form data: {data}")
        logger.debug(f"Profile image received: {profile_image is not None}")
        
        # Parse JSON strings back to Python objects
        access_data = json.loads(data.get('access', '[]'))
        if not isinstance(access_data, list):
            return jsonify({'error': 'Access data must be an array'}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check if user exists
        cursor.execute('SELECT id, password, email, profile_image_url FROM users WHERE id = %s', (current_user['user_id'],))
        user = cursor.fetchone()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Debug log current user data
        logger.debug(f"Current user data: {user}")

        # Validate email if it's being updated
        new_email = data.get('email')
        if new_email and new_email != user['email']:  # Only validate if email is being changed
            if not validate_email(new_email):
                return jsonify({'error': 'Invalid email format'}), 400

            # Check if new email already exists for another user
            cursor.execute('SELECT id FROM users WHERE email = %s AND id != %s', (new_email, current_user['user_id']))
            if cursor.fetchone():
                return jsonify({'error': 'Email already exists'}), 400

        # Handle password change if provided
        if data.get('oldPassword') and data.get('newPassword'):
            # Verify old password
            stored_password = user['password']
            if isinstance(stored_password, str):
                stored_password = stored_password.encode('utf-8')
            
            if not bcrypt.checkpw(data['oldPassword'].encode('utf-8'), stored_password):
                return jsonify({'error': 'Invalid old password'}), 401

            # Validate new password
            is_valid_password, password_error = validate_password(data['newPassword'])
            if not is_valid_password:
                return jsonify({'error': password_error}), 400

            # Hash new password
            hashed_password = bcrypt.hashpw(data['newPassword'].encode('utf-8'), bcrypt.gensalt())
        else:
            hashed_password = user['password']

        # Initialize variables for image handling
        old_image_path = None
        profile_to_be_deleted = False
        new_image_path = None

        # Handle profile image
        profile_image_url = user['profile_image_url']
        if profile_image is not None:  # New image uploaded
            logger.debug("New image file received")
            # Set up old image path if exists
            if user['profile_image_url']:
                old_image_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), user['profile_image_url'])
                profile_to_be_deleted = True
            
            # Save new image
            new_image_path = save_profile_image(profile_image, current_user['user_id'])
            if new_image_path:
                profile_image_url = new_image_path
                logger.debug(f"New image saved. New URL: {profile_image_url}")
            else:
                return jsonify({'error': 'Failed to save new image'}), 400
                
        elif data.get('profileImage') == 'null':  # Image explicitly removed
            logger.debug("Image removal requested")
            # Set up old image path if exists
            if user['profile_image_url']:
                old_image_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), user['profile_image_url'])
                profile_to_be_deleted = True
            profile_image_url = None
            logger.debug("Image removed, profile_image_url set to None")
        # If no image is sent, keep the existing image
        logger.debug(f"Final profile_image_url: {profile_image_url}")

        try:
            # Update user data
            cursor.execute('''
                UPDATE users 
                SET username = %s,
                    role = %s,
                    access_type = %s,
                    date_of_birth = %s,
                    country = %s,
                    email = %s,
                    password = %s,
                    profile_image_url = %s
                WHERE id = %s
            ''', (
                data.get('name'),
                data.get('role'),
                json.dumps(access_data),
                data.get('dateOfBirth'),
                data.get('country'),
                new_email or user['email'],
                hashed_password,
                profile_image_url,
                current_user['user_id']
            ))

            conn.commit()
            logger.debug("User data updated successfully")

            # Only after successful database update, delete old image if needed
            if profile_to_be_deleted and old_image_path and os.path.exists(old_image_path):
                logger.debug(f"Deleting old image: {old_image_path}")
                os.remove(old_image_path)

            return jsonify({'message': 'User updated successfully'})

        except Error as e:
            # Rollback transaction and clean up new image if it exists
            conn.rollback()
            if new_image_path:
                new_image_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), new_image_path)
                if os.path.exists(new_image_path):
                    os.remove(new_image_path)
            logger.error(f"Database error while updating user: {e}")
            return jsonify({'error': 'Database error'}), 500

    except Error as e:
        logger.error(f"Database error while updating user: {e}")
        return jsonify({'error': 'Database error'}), 500
    except Exception as e:
        logger.error(f"Unexpected error while updating user: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

@app.route('/api/users/<int:user_id>', methods=['PUT'])
@token_required
def update_user_by_id(current_user, user_id):
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'role' not in data or 'access' not in data:
            return jsonify({'error': 'Role and access fields are required'}), 400

        # Validate role
        if not data['role']:
            return jsonify({'error': 'Role is required'}), 400

        # Validate access
        if not isinstance(data['access'], list) or len(data['access']) == 0:
            return jsonify({'error': 'At least one access level is required'}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check if user exists
        cursor.execute('SELECT id FROM users WHERE id = %s', (user_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'User not found'}), 404

        # Update only role and access fields
        cursor.execute('''
            UPDATE users 
            SET role = %s,
                access_type = %s
            WHERE id = %s
        ''', (
            data['role'],
            json.dumps(data['access']),
            user_id
        ))

        conn.commit()
        return jsonify({'message': 'User updated successfully'})

    except Error as e:
        logger.error(f"Database error while updating user: {e}")
        return jsonify({'error': 'Database error'}), 500
    except Exception as e:
        logger.error(f"Unexpected error while updating user: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000) 