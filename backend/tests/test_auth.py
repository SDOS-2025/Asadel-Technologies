import unittest
import json
import jwt
from datetime import datetime, timedelta
from flask import Flask
from unittest.mock import patch, MagicMock
from backend.blueprints.auth.routes import auth_bp

class TestAuthBlueprint(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'test_secret_key'
        self.app.config['TESTING'] = True
        self.app.register_blueprint(auth_bp)
        self.client = self.app.test_client()

    @patch('backend.blueprints.auth.routes.get_db_connection')
    @patch('backend.blueprints.auth.routes.bcrypt.checkpw')
    def test_login_success(self, mock_checkpw, mock_get_db):
        # Setup mock database connection
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_db.return_value = mock_conn
        
        # Setup mock query result
        user_data = {
            'id': 1,
            'username': 'testuser',
            'email': 'test@example.com',
            'password': b'hashed_password'
        }
        mock_cursor.fetchone.return_value = user_data
        
        # Setup password verification to succeed
        mock_checkpw.return_value = True
        
        # Test login request
        response = self.client.post(
            '/api/login',
            data=json.dumps({
                'email': 'test@example.com',
                'password': 'password123'
            }),
            content_type='application/json'
        )
        
        # Verify the response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('token', data)
        
        # Verify the token
        decoded_token = jwt.decode(
            data['token'], 
            self.app.config['SECRET_KEY'], 
            algorithms=['HS256']
        )
        self.assertEqual(decoded_token['user_id'], user_data['id'])
        self.assertEqual(decoded_token['username'], user_data['username'])

    @patch('backend.blueprints.auth.routes.get_db_connection')
    def test_login_invalid_credentials(self, mock_get_db):
        # Setup mock database connection
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_db.return_value = mock_conn
        
        # Setup mock query result for user not found
        mock_cursor.fetchone.return_value = None
        
        # Test login request with non-existent user
        response = self.client.post(
            '/api/login',
            data=json.dumps({
                'email': 'nonexistent@example.com',
                'password': 'password123'
            }),
            content_type='application/json'
        )
        
        # Verify the response
        self.assertEqual(response.status_code, 401)
        data = json.loads(response.data)
        self.assertEqual(data['error'], 'Invalid credentials')

    def test_login_missing_fields(self):
        # Test login request with missing email
        response = self.client.post(
            '/api/login',
            data=json.dumps({
                'password': 'password123'
            }),
            content_type='application/json'
        )
        
        # Verify the response
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertEqual(data['error'], 'Email and password are required')

if __name__ == '__main__':
    unittest.main() 