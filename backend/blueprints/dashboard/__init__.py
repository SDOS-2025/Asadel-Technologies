"""
Dashboard blueprint package initialization
"""
from flask import Blueprint

dashboard_bp = Blueprint('dashboard', __name__)

# Import routes after Blueprint definition to avoid circular imports
from . import routes 