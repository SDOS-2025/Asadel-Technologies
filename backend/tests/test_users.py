import unittest
import json
import jwt
from datetime import datetime, timedelta
from flask import Flask
from unittest.mock import patch, MagicMock
from functools import wraps
from backend.blueprints.users.routes import users_bp
from flask.testing import FlaskClient

# Create a custom test client class that includes an auth token
class AuthenticatedClient(FlaskClient):
    def open(self, *args, **kwargs):
        # Add Authorization header with JWT token for authenticated requests
        kwargs.setdefault('headers', {})
        
        # Generate a valid token
        token = jwt.encode(
            {
                'user_id': 1, 
                'username': 'testuser',
                'exp': datetime.utcnow() + timedelta(days=1)
            },
            'test_secret_key',
            algorithm='HS256'
        )
        
        kwargs['headers'].setdefault('Authorization', f'Bearer {token}')
        return super().open(*args, **kwargs)

class TestUsersBlueprint(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'test_secret_key'
        self.app.config['TESTING'] = True
        self.app.config['UPLOAD_FOLDER'] = '/tmp/test_uploads'
        self.app.config['SERVER_NAME'] = 'localhost:5000'
        
        # Replace the token_required decorator with a simplified version for testing
        def mock_token_decorator(f):
            @wraps(f)
            def decorated(*args, **kwargs):
                # In tests, always set the current_user
                current_user = {'user_id': 1, 'username': 'testuser', 'role': 'admin'}
                return f(current_user, *args, **kwargs)
            return decorated
        
        # Apply the patch
        self.patcher = patch('backend.blueprints.users.routes.token_required', mock_token_decorator)
        self.mock_token_required = self.patcher.start()
        
        # Register the blueprint after patching
        self.app.register_blueprint(users_bp)
        
        # Use the custom client with auth token
        self.app.test_client_class = AuthenticatedClient
        self.client = self.app.test_client()
        
    def tearDown(self):
        self.patcher.stop()

    @patch('backend.blueprints.users.routes.get_db_connection')
    def test_get_users(self, mock_get_db):
        # Setup mock database connection
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_db.return_value = mock_conn
        
        # Create a real datetime object
        now = datetime.now()
        
        # Setup mock query results for total count
        mock_cursor.fetchone.return_value = {'total': 15}
        
        # Setup mock users data
        users_data = [
            {
                'id': 1, 
                'full_name': 'Admin User', 
                'role': 'admin',
                'access_level': 'Full',
                'created_at': now.strftime('%Y-%m-%d'),
                'country': 'United States',
                'date_of_birth': '1990-01-01'
            },
            {
                'id': 2, 
                'full_name': 'Regular User', 
                'role': 'user',
                'access_level': 'Limited',
                'created_at': now.strftime('%Y-%m-%d'),
                'country': 'Canada',
                'date_of_birth': '1995-05-05'
            }
        ]
        
        mock_cursor.fetchall.return_value = users_data
        
        # Test endpoint
        response = self.client.get('/api/users?page=1')
        
        # Verify the response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data['users']), 2)
        self.assertEqual(data['current_page'], 1)
        self.assertEqual(data['total_pages'], 2)  # 15 users, 10 per page = 2 pages

    @patch('backend.blueprints.users.routes.get_db_connection')
    def test_get_user(self, mock_get_db):
        # Setup mock database connection
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_db.return_value = mock_conn
        
        # Create a real datetime object
        now = datetime.now()
        
        # Setup mock query result
        user_data = {
            'id': 1, 
            'full_name': 'Test User', 
            'role': 'admin',
            'access_level': 'Full',
            'created_at': now.strftime('%Y-%m-%d'),
            'country': 'United States',
            'date_of_birth': '1990-01-01',
            'email': 'test@example.com',
            'profile_image_url': 'profile.jpg'
        }
        
        mock_cursor.fetchone.return_value = user_data
        
        # Use a request context
        with self.app.test_request_context('http://localhost:5000/api/users/1'):
            # Patch the host_url instead of patching request
            self.app.config['SERVER_NAME'] = 'localhost:5000'
            
            # Test endpoint
            response = self.client.get('/api/users/1')
            
            # Verify the response
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data)
            self.assertEqual(data['id'], 1)
            self.assertEqual(data['full_name'], 'Test User')

    @patch('backend.blueprints.users.routes.get_db_connection')
    @patch('backend.blueprints.users.routes.validate_email')
    @patch('backend.blueprints.users.routes.validate_password')
    @patch('backend.blueprints.users.routes.hash_password')
    def test_create_user(self, mock_hash_password, mock_validate_password, mock_validate_email, mock_get_db):
        # Setup mock database connection
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_db.return_value = mock_conn
        
        # Configure mocks
        mock_validate_email.return_value = True
        mock_validate_password.return_value = (True, None)
        mock_hash_password.return_value = b'hashed_password'
        
        # Configure mock to indicate email doesn't exist
        mock_cursor.fetchone.return_value = None
        
        # Configure mock for successful insert
        mock_cursor.lastrowid = 3
        
        # Test endpoint with form data
        user_data = {
            'username': 'newuser',
            'password': 'Password123!',
            'email': 'newuser@example.com',
            'role': 'user',
            'date_of_birth': '1995-05-05',
            'country': 'Australia',
            'access_type': 'Restricted'
        }
        
        response = self.client.post(
            '/api/users',
            data=user_data
        )
        
        # Verify the response
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data['message'], 'User created successfully')

    @patch('backend.blueprints.users.routes.get_db_connection')
    @patch('backend.blueprints.users.routes.validate_email')
    def test_create_user_duplicate_email(self, mock_validate_email, mock_get_db):
        # Setup mock database connection
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_db.return_value = mock_conn
        
        # Configure mocks
        mock_validate_email.return_value = True
        
        # Configure mock to indicate email already exists
        mock_cursor.fetchone.return_value = {'id': 2}
        
        # Test endpoint with form data
        user_data = {
            'username': 'existinguser',
            'password': 'Password123!',
            'email': 'existing@example.com',
            'role': 'user',
            'date_of_birth': '1995-05-05',
            'country': 'Australia',
            'access_type': 'Restricted'
        }
        
        response = self.client.post(
            '/api/users',
            data=user_data
        )
        
        # Verify the response
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertEqual(data['error'], 'Email already exists')

    @patch('backend.blueprints.users.routes.get_db_connection')
    @patch('backend.blueprints.users.routes.os.path.exists')
    @patch('backend.blueprints.users.routes.os.remove')
    def test_delete_user(self, mock_remove, mock_path_exists, mock_get_db):
        # Setup mock database connection
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_db.return_value = mock_conn
        
        # Setup mock query result
        user_data = {
            'profile_image_url': '/tmp/test_uploads/profile.jpg'
        }
        
        mock_cursor.fetchone.return_value = user_data
        
        # Mock file existence check
        mock_path_exists.return_value = True
        
        # Test endpoint
        response = self.client.delete('/api/users/2')
        
        # Verify the response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['message'], 'User deleted successfully')

if __name__ == '__main__':
    unittest.main() 