import unittest
import json
import jwt
from datetime import datetime, timedelta
from flask import Flask
from unittest.mock import patch, MagicMock
from functools import wraps
from flask.testing import FlaskClient
import sys

# Mock the required modules
sys.modules['ultralytics'] = MagicMock()
sys.modules['yt_dlp'] = MagicMock()
# Now we can safely import the dashboard_bp
from backend.blueprints.dashboard.routes import dashboard_bp
# Also mock flask_cors
from flask_cors import cross_origin

class TestDashboardBlueprint(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'test_secret_key'
        self.app.config['TESTING'] = True
        
        # Mock the cross_origin decorator
        self.patcher = patch('backend.blueprints.dashboard.routes.cross_origin')
        self.mock_cross_origin = self.patcher.start()
        self.mock_cross_origin.return_value = lambda f: f  # Make it a pass-through decorator
        
        # Mock the testing_script module
        self.patcher2 = patch('backend.blueprints.dashboard.routes.testing_script')
        self.mock_testing_script = self.patcher2.start()
        
        # Register the blueprint after patching
        self.app.register_blueprint(dashboard_bp)
        
        # Use a regular client (no auth needed for dashboard endpoints)
        self.client = self.app.test_client()
        
    def tearDown(self):
        self.patcher.stop()
        self.patcher2.stop()

    def test_cameras(self):
        # Setup mock camera feeds
        camera_feeds = [
            {"id": 1, "name": "Camera 1", "url": "rtsp://example.com/camera1"},
            {"id": 2, "name": "Camera 2", "url": "rtsp://example.com/camera2"}
        ]
        self.mock_testing_script.get_camera_feeds.return_value = camera_feeds
        
        # Test endpoint
        response = self.client.get('/api/cameras')
        
        # Verify the response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['id'], 1)
        self.assertEqual(data[0]['name'], 'Camera 1')
        self.assertEqual(data[1]['id'], 2)
        self.assertEqual(data[1]['name'], 'Camera 2')

    @patch('backend.blueprints.dashboard.routes.get_db_connection')
    def test_get_detections(self, mock_get_db):
        # Setup mock database connection
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_db.return_value = mock_conn
        
        # Create a real datetime object
        now = datetime.now()
        
        # Setup mock query results
        detections_data = [
            {
                'id': 1,
                'camera_id': 1,
                'camera_name': 'Camera 1',
                'region_name': 'Region 1',
                'sub_region_name': 'Sub Region 1',
                'alert_type': 'Person',
                'confidence': 0.95,
                'time_stamp': '10:30:00',
                'date_created': now.strftime('%Y-%m-%d')
            },
            {
                'id': 2,
                'camera_id': 2,
                'camera_name': 'Camera 2',
                'region_name': 'Region 1',
                'sub_region_name': 'Sub Region 2',
                'alert_type': 'Vehicle',
                'confidence': 0.88,
                'time_stamp': '10:35:00',
                'date_created': now.strftime('%Y-%m-%d')
            }
        ]
        
        # Configure mock to return detections
        mock_cursor.fetchall.return_value = detections_data
        
        # Test endpoint
        response = self.client.get('/api/detections')
        
        # Verify the response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['id'], 1)
        self.assertEqual(data[0]['camera_name'], 'Camera 1')
        self.assertEqual(data[0]['alert_type'], 'Person')
        self.assertEqual(data[1]['id'], 2)
        self.assertEqual(data[1]['camera_name'], 'Camera 2')
        self.assertEqual(data[1]['alert_type'], 'Vehicle')

if __name__ == '__main__':
    unittest.main() 