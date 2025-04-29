import unittest
import json
import jwt
from datetime import datetime, timedelta
from flask import Flask
from unittest.mock import patch, MagicMock
from functools import wraps
from backend.blueprints.cameras.routes import cameras_bp
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

class TestCamerasBlueprint(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'test_secret_key'
        self.app.config['TESTING'] = True
        
        # Replace the token_required decorator with a simplified version for testing
        def mock_token_decorator(f):
            @wraps(f)
            def decorated(*args, **kwargs):
                # In tests, always set the current_user
                current_user = {'user_id': 1, 'username': 'testuser'}
                return f(current_user, *args, **kwargs)
            return decorated
        
        # Apply the patch
        self.patcher = patch('backend.blueprints.cameras.routes.token_required', mock_token_decorator)
        self.mock_token_required = self.patcher.start()
        
        # Register the blueprint after patching
        self.app.register_blueprint(cameras_bp)
        
        # Use the custom client with auth token
        self.app.test_client_class = AuthenticatedClient
        self.client = self.app.test_client()
        
    def tearDown(self):
        self.patcher.stop()

    @patch('backend.blueprints.cameras.routes.get_db_connection')
    def test_get_cameras(self, mock_get_db):
        # Setup mock database connection
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_db.return_value = mock_conn
        
        # Setup mock query results
        mock_cursor.fetchone.return_value = {'total': 15}  # Total cameras count
        
        # Create a real datetime object
        now = datetime.now()
        
        cameras_data = [
            {
                'id': 1, 
                'name': 'Camera 1', 
                'rtsp_url': 'rtsp://example.com/camera1', 
                'region_id': 1,
                'region_name': 'Region 1', 
                'sub_region_id': 1,
                'sub_region_name': 'Sub Region 1', 
                'description': 'Test Camera 1', 
                'access_level': 'Admin',
                'status': 'Active',
                'created_at': now
            },
            {
                'id': 2, 
                'name': 'Camera 2', 
                'rtsp_url': 'rtsp://example.com/camera2', 
                'region_id': 1,
                'region_name': 'Region 1', 
                'sub_region_id': 2,
                'sub_region_name': 'Sub Region 2', 
                'description': 'Test Camera 2', 
                'access_level': 'User',
                'status': 'Active',
                'created_at': now
            }
        ]
        
        mock_cursor.fetchall.return_value = cameras_data
        
        # Test endpoint
        response = self.client.get('/api/cameras?page=1')
        
        # Verify the response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data['cameras']), 2)
        self.assertEqual(data['current_page'], 1)

    @patch('backend.blueprints.cameras.routes.get_db_connection')
    def test_get_camera(self, mock_get_db):
        # Setup mock database connection
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_db.return_value = mock_conn
        
        # Create a real datetime object
        now = datetime.now()
        
        # Setup mock query result
        camera_data = {
            'id': 1, 
            'name': 'Camera 1', 
            'rtsp_url': 'rtsp://example.com/camera1', 
            'region_id': 1,
            'region_name': 'Region 1', 
            'sub_region_id': 1,
            'sub_region_name': 'Sub Region 1', 
            'description': 'Test Camera 1', 
            'access_level': 'Admin',
            'status': 'Active',
            'created_at': now
        }
        
        mock_cursor.fetchone.return_value = camera_data
        
        # Test endpoint
        response = self.client.get('/api/cameras/1')
        
        # Verify the response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['id'], 1)
        self.assertEqual(data['name'], 'Camera 1')

    @patch('backend.blueprints.cameras.routes.get_db_connection')
    def test_create_camera(self, mock_get_db):
        # Setup mock database connection
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_db.return_value = mock_conn
        
        # Configure mock for successful insert
        mock_cursor.lastrowid = 1
        
        # Test endpoint
        camera_data = {
            'name': 'New Camera',
            'rtsp_url': 'rtsp://example.com/new_camera',
            'region': 1,
            'sub_region': 1,
            'description': 'New Test Camera',
            'access_level': 'Admin',
            'status': 'Active'
        }
        
        response = self.client.post(
            '/api/cameras',
            json=camera_data
        )
        
        # Verify the response
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data['message'], 'Camera added successfully')
        self.assertEqual(data['camera_id'], 1)

    @patch('backend.blueprints.cameras.routes.get_db_connection')
    def test_update_camera(self, mock_get_db):
        # Setup mock database connection
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_db.return_value = mock_conn
        
        # Configure mock to indicate camera exists
        mock_cursor.fetchone.return_value = {'id': 1}
        mock_cursor.rowcount = 1
        
        # Test endpoint
        camera_data = {
            'name': 'Updated Camera',
            'rtsp_url': 'rtsp://example.com/updated_camera',
            'region': 1,
            'sub_region': 1,
            'description': 'Updated Test Camera',
            'access_level': 'Admin',
            'status': 'Active'
        }
        
        response = self.client.put(
            '/api/cameras/1',
            json=camera_data
        )
        
        # Verify the response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['message'], 'Camera updated successfully')

    @patch('backend.blueprints.cameras.routes.get_db_connection')
    def test_delete_camera(self, mock_get_db):
        # Setup mock database connection
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_db.return_value = mock_conn
        
        # Configure mock to indicate camera exists and was deleted
        mock_cursor.rowcount = 1
        
        # Test endpoint
        response = self.client.delete('/api/cameras/1')
        
        # Verify the response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['message'], 'Camera deleted successfully')

if __name__ == '__main__':
    unittest.main() 