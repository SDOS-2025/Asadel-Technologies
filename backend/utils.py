import logging
import os
import re
import bcrypt
import mysql.connector
from mysql.connector import Error
from werkzeug.utils import secure_filename
from datetime import datetime
import jwt
from functools import wraps
from flask import request, jsonify, current_app

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Constants
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads', 'profile_images')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Get the database password and strip any quotes that might be in the .env file
password = os.getenv('MYSQL_PASSWORD', '')
if password and (password.startswith('"') and password.endswith('"')) or (password.startswith("'") and password.endswith("'")):
    password = password[1:-1]
    logger.info("Removed quotes from database password")

# Database configuration
db_config = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': password,
    'database': os.getenv('MYSQL_DATABASE', 'asadel_db')
}

logger.info(f"Database config initialized: host={db_config['host']}, user={db_config['user']}, database={db_config['database']}")
logger.info(f"Password provided: {'Yes' if db_config['password'] else 'No'}")

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
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = data
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_profile_image(file, user_id):
    try:
        logger.debug(f"Starting save_profile_image. File: {file.filename}, Content-Type: {file.content_type}")
        if file and allowed_file(file.filename):
            # Create secure filename with timestamp
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = secure_filename(f"{user_id}_{timestamp}_{file.filename}")
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            
            # Debug logs
            logger.debug(f"Saving profile image: {filename}")
            logger.debug(f"File path: {filepath}")
            logger.debug(f"Upload folder exists: {os.path.exists(UPLOAD_FOLDER)}")
            
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

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

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
    """
    Get a connection to the MySQL database.
    
    Returns:
        mysql.connector.connection.MySQLConnection: A connection to the database.
        
    Raises:
        mysql.connector.Error: If there is a problem connecting to the database.
    """
    try:
        # Log database connection attempt
        logger.info(f"Attempting to connect to MySQL database '{db_config['database']}' on {db_config['host']} as user '{db_config['user']}'")
        
        # Check if database name is specified
        if not db_config.get('database'):
            logger.error("Database name is missing in configuration")
            raise Error("Database name is not specified in configuration")

        # Try to establish the connection
        connection = mysql.connector.connect(**db_config)
        
        # Verify connection is successful
        if connection.is_connected():
            db_info = connection.get_server_info()
            logger.info(f"Successfully connected to MySQL Server version {db_info}")
            
            cursor = connection.cursor()
            cursor.execute("SELECT DATABASE()")
            result = cursor.fetchone()
            db_name = result[0]
            cursor.close()
            
            logger.info(f"Connected to database: {db_name}")
            return connection
        else:
            logger.error("Connection established but not connected")
            raise Error("Connection established but not connected")
            
    except mysql.connector.Error as e:
        # Handle specific error types with more detailed messages
        if e.errno == 1045:  # Access denied for user
            logger.error(f"Access denied for user '{db_config['user']}'. Check username and password.")
            raise Error(f"Database connection error: Access denied for user '{db_config['user']}'")
        elif e.errno == 1049:  # Unknown database
            logger.error(f"Database '{db_config.get('database')}' does not exist")
            raise Error(f"Database '{db_config.get('database')}' does not exist")
        elif e.errno == 2003:  # Can't connect to MySQL server
            logger.error(f"Can't connect to MySQL server on '{db_config['host']}'. Verify server is running.")
            raise Error(f"Can't connect to MySQL server on '{db_config['host']}'")
        elif e.errno == 2005:  # Unknown MySQL server host
            logger.error(f"Unknown MySQL server host '{db_config['host']}'")
            raise Error(f"Unknown MySQL server host '{db_config['host']}'")
        else:
            logger.error(f"MySQL error: [{e.errno}] {e.msg}")
            raise Error(f"Database connection error: {e}")
    except Exception as e:
        logger.error(f"Unexpected error while connecting to database: {e}")
        logger.error(f"Database config (without password): {db_config['host']}, {db_config['user']}, {db_config.get('database', 'not specified')}")
        raise Error("Database connection error") 