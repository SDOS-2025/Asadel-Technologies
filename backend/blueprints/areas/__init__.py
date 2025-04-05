"""
Areas blueprint package initialization
"""

from flask import Blueprint
from backend.blueprints.areas.routes import areas_bp

def init_app(app):
    """Register the areas blueprint with the Flask application."""
    app.register_blueprint(areas_bp)
    
    # Log that the areas blueprint was registered
    app.logger.info("Areas blueprint registered") 