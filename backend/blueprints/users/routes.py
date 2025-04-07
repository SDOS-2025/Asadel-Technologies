from flask import Blueprint, request, jsonify, current_app
import json
import os
import logging
import bcrypt
from mysql.connector import Error
from backend.utils import (
    get_db_connection, validate_email, validate_password, 
    hash_password, save_profile_image, MAX_FILE_SIZE, token_required
)

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
users_bp = Blueprint('users', __name__, url_prefix='/api')

@users_bp.route('/users', methods=['GET'])
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

@users_bp.route('/users/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user(current_user, user_id):
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
            filename = os.path.basename(user['profile_image_url'])
            image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
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
@token_required
def get_user(current_user, user_id):
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
            filename = os.path.basename(user['profile_image_url'])
            user['profile_image_url'] = f"{base_url}/api/settings/uploads/profile_images/{filename}"

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
