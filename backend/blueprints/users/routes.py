from flask import Blueprint, request, jsonify, current_app
import json
import os
import logging
import bcrypt
from mysql.connector import Error
from backend.utils import (
    get_db_connection, validate_email, validate_password, 
    hash_password, save_profile_image, MAX_FILE_SIZE
)

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
users_bp = Blueprint('users', __name__, url_prefix='/api')

@users_bp.route('/users', methods=['GET'])
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

@users_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # First get the user's profile image URL
        cursor.execute('SELECT profile_image_url FROM users WHERE id = %s', (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Delete the profile image if it exists
        if user['profile_image_url']:
            image_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 
                                     user['profile_image_url'])
            if os.path.exists(image_path):
                os.remove(image_path)
        
        # Delete the user from database
        cursor.execute('DELETE FROM users WHERE id = %s', (user_id,))
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

@users_bp.route('/users/<int:user_id>', methods=['GET'])
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

@users_bp.route('/users', methods=['POST'])
def create_user():
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
        hashed_password = hash_password(data['password'])

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

@users_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
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
        cursor.execute('SELECT id, password, email, profile_image_url FROM users WHERE id = %s', (user_id,))
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
            cursor.execute('SELECT id FROM users WHERE email = %s AND id != %s', (new_email, user_id))
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
            hashed_password = hash_password(data['newPassword'])
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
                old_image_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 
                                           user['profile_image_url'])
                profile_to_be_deleted = True
            
            # Save new image
            new_image_path = save_profile_image(profile_image, user_id)
            if new_image_path:
                profile_image_url = new_image_path
                logger.debug(f"New image saved. New URL: {profile_image_url}")
            else:
                return jsonify({'error': 'Failed to save new image'}), 400
                
        elif data.get('profileImage') == 'null':  # Image explicitly removed
            logger.debug("Image removal requested")
            # Set up old image path if exists
            if user['profile_image_url']:
                old_image_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 
                                           user['profile_image_url'])
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
                user_id
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
                new_image_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 
                                           new_image_path)
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