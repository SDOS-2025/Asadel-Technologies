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
    
    # Increase timeout for streaming responses
    app.config['TIMEOUT'] = 300  # 5 minutes timeout for streaming
    
    # Import utils (import here to avoid circular imports)
    from backend.utils import UPLOAD_FOLDER
    
    # Configure app
    app.config['SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    
    # Register error handlers
    @app.errorhandler(500)
    def handle_500_error(e):
        logger.error(f"Internal server error: {str(e)}")
        return "Internal server error. Please check server logs.", 500
    
    @app.errorhandler(ConnectionError)
    def handle_connection_error(e):
        logger.error(f"Connection error: {str(e)}")
        return "Connection error occurred.", 500
    
    # Import blueprints (import here to avoid circular imports)
    from backend.blueprints.auth.routes import auth_bp
    from backend.blueprints.users.routes import users_bp
    from backend.blueprints.settings.routes import settings_bp
    from backend.blueprints.cameras.routes import cameras_bp
    from backend.blueprints.areas.routes import areas_bp
    from backend.blueprints.dashboard.routes import dashboard_bp
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(settings_bp)
    app.register_blueprint(cameras_bp)
    app.register_blueprint(areas_bp)
    app.register_blueprint(dashboard_bp)
    
    return app

if __name__ == '__main__':
    # Add parent directory to sys.path
    import sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    app = create_app()
    app.run(debug=True, port=5000, threaded=True, use_reloader=False)
