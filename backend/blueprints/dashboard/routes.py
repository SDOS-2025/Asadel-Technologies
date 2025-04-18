from flask import Blueprint, Response, jsonify
from flask_cors import cross_origin
import logging
from . import testing_script
from backend.utils import get_db_connection

# Configure logging
logger = logging.getLogger(__name__)
dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route("/api/cameras")
@cross_origin()
def cameras():
    """API endpoint to get all active cameras"""
    try:
        feeds = testing_script.get_camera_feeds()
        logger.info(f"Returning {len(feeds)} camera feeds")
        return jsonify(feeds)
    except Exception as e:
        logger.error(f"Error in cameras endpoint: {str(e)}")
        return jsonify({
            'error': str(e)
        }), 500

@dashboard_bp.route("/video_feed/<int:camera_id>")
@cross_origin()
def video_feed(camera_id):
    """Stream video feed from a specific camera"""
    try:
        camera = testing_script.get_camera_by_id(camera_id)
        
        if not camera:
            return "Camera not found", 404
            
        # Get the RTSP URL from the camera
        video_url = camera['rtsp_url']
        logger.info(f"Streaming from camera {camera_id} with URL: {video_url}")
        
        # Process and stream the video feed with camera_id
        return Response(
            testing_script.process_video(video_url, camera_id),
            mimetype='multipart/x-mixed-replace; boundary=frame'
        )
    except Exception as e:
        logger.error(f"Error in video_feed endpoint: {str(e)}")
        return str(e), 500

@dashboard_bp.route("/api/detections")
@cross_origin()
def get_detections():
    """Get recent detections from the database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT 
                d.id,
                d.camera_id,
                c.name as camera_name,
                r.name as region_name,
                sr.name as sub_region_name,
                d.alert_type,
                d.confidence,
                d.time_stamp,
                d.date_created
            FROM detections d
            JOIN cameras c ON d.camera_id = c.id
            JOIN regions r ON c.region = r.id
            JOIN sub_regions sr ON c.sub_region = sr.id
            ORDER BY d.date_created DESC, d.time_stamp DESC
            LIMIT 100
        """
        
        cursor.execute(query)
        detections = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify(detections)
    except Exception as e:
        logger.error(f"Error fetching detections: {str(e)}")
        return jsonify({'error': str(e)}), 500 