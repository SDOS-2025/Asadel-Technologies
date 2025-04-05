from flask import Blueprint, request, jsonify, send_from_directory, current_app
import logging
from backend.utils import get_db_connection

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