import logging
import os
import re
import bcrypt
import mysql.connector
from mysql.connector import Error
from werkzeug.utils import secure_filename
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Constants
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads', 'profile_images')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Database configuration
db_config = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', ''),
    'database': os.getenv('MYSQL_DATABASE', 'asadel_db')
}

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
    try:
        connection = mysql.connector.connect(**db_config)
        if connection.is_connected():
            logger.info('Successfully connected to the database')
            return connection
    except Error as e:
        logger.error(f"Error connecting to MySQL: {e}")
        raise 