from flask import Blueprint, request, jsonify, send_from_directory, current_app
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
settings_bp = Blueprint('settings', __name__, url_prefix='/api')

# Add routes for settings functionality here
# This can include app settings, user profile settings, etc.

@settings_bp.route('/settings/uploads/profile_images/<path:filename>')
def serve_profile_image(filename):
    """
    Serve profile image files
    """
    full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    logger.info(f"Trying to serve profile image: {full_path}")
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

@settings_bp.route('/settings/current-user', methods=['GET'])
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
            # Construct the full URL for the image - just use the filename, not the full path
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


@settings_bp.route('/settings/user', methods=['PUT'])
@token_required
def update_user(current_user):
    try:
        # Always use form data
        data = request.form.to_dict()
        profile_image = request.files.get('profileImage')
        
        # Debug logs
        logger.debug(f"Received form data: {data}")
        logger.debug(f"Profile image received: {profile_image is not None}")
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check if user exists
        cursor.execute('SELECT id, password, email, profile_image_url, role, access_type FROM users WHERE id = %s', (current_user['user_id'],))
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
                filename = os.path.basename(user['profile_image_url'])
                old_image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
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
                filename = os.path.basename(user['profile_image_url'])
                old_image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
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
                    date_of_birth = %s,
                    country = %s,
                    email = %s,
                    password = %s,
                    profile_image_url = %s
                WHERE id = %s
            ''', (
                data.get('name'),
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
                filename = os.path.basename(new_image_path)
                new_image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
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

@settings_bp.route('/settings/deleteuser', methods=['DELETE'])
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
            filename = os.path.basename(user['profile_image_url'])
            image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
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