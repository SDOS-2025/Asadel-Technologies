from flask import Blueprint, request, jsonify, send_from_directory, current_app
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
settings_bp = Blueprint('settings', __name__, url_prefix='/api')

# Add routes for settings functionality here
# This can include app settings, user profile settings, etc.

@settings_bp.route('/uploads/profile_images/<path:filename>')
def serve_profile_image(filename):
    """
    Serve profile image files
    """
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

@settings_bp.route('/settings/user/<int:user_id>', methods=['PUT'])
def update_user_settings(user_id):
    """
    Update user settings/profile information
    This is similar to the update_user function in users/routes.py but with a different endpoint
    """
    try:
        # Always use form data
        data = request.form.to_dict()
        profile_image = request.files.get('profileImage')
        
        # Debug logs
        logger.debug(f"Received form data in settings: {data}")
        logger.debug(f"Profile image received in settings: {profile_image is not None}")
        
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
        logger.debug(f"Current user data in settings: {user}")

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
            logger.debug("New image file received in settings")
            # Set up old image path if exists
            if user['profile_image_url']:
                old_image_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 
                                           user['profile_image_url'])
                profile_to_be_deleted = True
            
            # Save new image
            new_image_path = save_profile_image(profile_image, user_id)
            if new_image_path:
                profile_image_url = new_image_path
                logger.debug(f"New image saved in settings. New URL: {profile_image_url}")
            else:
                return jsonify({'error': 'Failed to save new image'}), 400
                
        elif data.get('profileImage') == 'null':  # Image explicitly removed
            logger.debug("Image removal requested in settings")
            # Set up old image path if exists
            if user['profile_image_url']:
                old_image_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 
                                           user['profile_image_url'])
                profile_to_be_deleted = True
            profile_image_url = None
            logger.debug("Image removed in settings, profile_image_url set to None")
        # If no image is sent, keep the existing image
        logger.debug(f"Final profile_image_url in settings: {profile_image_url}")

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
            logger.debug("User data updated successfully from settings")

            # Only after successful database update, delete old image if needed
            if profile_to_be_deleted and old_image_path and os.path.exists(old_image_path):
                logger.debug(f"Deleting old image from settings: {old_image_path}")
                os.remove(old_image_path)

            return jsonify({'message': 'User settings updated successfully'})

        except Error as e:
            # Rollback transaction and clean up new image if it exists
            conn.rollback()
            if new_image_path:
                new_image_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 
                                           new_image_path)
                if os.path.exists(new_image_path):
                    os.remove(new_image_path)
            logger.error(f"Database error while updating user settings: {e}")
            return jsonify({'error': 'Database error'}), 500

    except Error as e:
        logger.error(f"Database error while updating user settings: {e}")
        return jsonify({'error': 'Database error'}), 500
    except Exception as e:
        logger.error(f"Unexpected error while updating user settings: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close() 