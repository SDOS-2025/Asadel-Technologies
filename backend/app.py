from flask import Flask
from flask_cors import CORS
import os
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


def create_app():
    """
    Application factory function
    """
    # Create Flask app
    app = Flask(__name__)
    
    # Enable CORS
    CORS(app)
    
    # Load environment variables
    load_dotenv()

    
    # Import utils (import here to avoid circular imports)
    from backend.utils import UPLOAD_FOLDER
    
    # Configure app
    app.config['SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    
    # Import blueprints (import here to avoid circular imports)
    from backend.blueprints.auth.routes import auth_bp
    from backend.blueprints.users.routes import users_bp
    from backend.blueprints.settings.routes import settings_bp
    from backend.blueprints.cameras.routes import cameras_bp
    from backend.blueprints.areas.routes import areas_bp
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(settings_bp)
    app.register_blueprint(cameras_bp)
    app.register_blueprint(areas_bp)
    
    return app

if __name__ == '__main__':
    # Add parent directory to sys.path
    import sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    app = create_app()
    app.run(debug=True, port=5000) 