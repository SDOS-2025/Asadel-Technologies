import cv2
from ultralytics import YOLO
import yt_dlp
import logging
import os
import sys

# Add the parent directory to sys.path to make imports work
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))
from backend.utils import get_db_connection

# Configure logging
logger = logging.getLogger(__name__)

# Path to the model file
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'Ml_Model', 'best.pt')

# Load model
try:
    model = YOLO(MODEL_PATH)
    logger.info(f"YOLO model loaded successfully from {MODEL_PATH}")
except Exception as e:
    logger.error(f"Failed to load YOLO model: {str(e)}")
    model = None

# Configuration
CONF_THRESHOLDS = {"fire": 0.2, "smoke": 0.2}
FRAME_SKIP = 4

def is_youtube_url(url):
    """Check if URL is a YouTube URL"""
    return "youtube.com" in url or "youtu.be" in url

def get_youtube_stream_url(youtube_url):
    """Get streamable URL from YouTube video"""
    ydl_opts = {
        "quiet": True,
        "skip_download": True,
        "format": "best[ext=mp4]/best",
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(youtube_url, download=False)
        return info["url"]

def get_camera_feeds():
    """Get active camera feeds from the database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT 
                c.id, 
                c.name, 
                c.rtsp_url, 
                r.name as region_name,
                sr.name as sub_region_name,
                c.status
            FROM cameras c
            JOIN regions r ON c.region = r.id
            JOIN sub_regions sr ON c.sub_region = sr.id
            WHERE c.status = 'Active'
        """
        
        logger.info("Executing query to fetch camera feeds")
        cursor.execute(query)
        cameras = cursor.fetchall()
        logger.info(f"Found {len(cameras)} active cameras")

        cursor.close()
        conn.close()
        return cameras
    except Exception as e:
        logger.error(f"Error fetching camera feeds: {str(e)}")
        return []

def process_video(video_path):
    """Process video with object detection and stream the results"""
    # Handle YouTube URLs
    if is_youtube_url(video_path):
        try:
            logger.info(f"Processing YouTube URL: {video_path}")
            video_path = get_youtube_stream_url(video_path)
        except Exception as e:
            logger.error(f"Failed to process YouTube URL: {str(e)}")
            return None

    # Open video capture
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        logger.error(f"Error: Could not open video: {video_path}")
        return None

    # Processing variables
    frame_count = 0

    try:
        while cap.isOpened():
            # Read frame
            ret, frame = cap.read()
            if not ret:
                logger.warning("End of video stream reached")
                break

            # Skip frames to improve performance
            frame_count += 1
            if frame_count % FRAME_SKIP != 0:
                continue

            # Run inference with YOLO
            if model:
                results = model.predict(source=frame, save=False)

                # Filter detections by confidence threshold
                for result in results:
                    filtered_boxes = []
                    for box in result.boxes:
                        class_id = int(box.cls[0].item())
                        conf = box.conf[0].item()
                        class_label = model.names[class_id]

                        if class_label in CONF_THRESHOLDS and conf >= CONF_THRESHOLDS[class_label]:
                            filtered_boxes.append(box)

                    result.boxes = filtered_boxes

                # Draw bounding boxes on frame
                annotated_frame = results[0].plot()
            else:
                # If model not available, use original frame
                annotated_frame = frame

            # Convert to JPEG for streaming
            _, buffer = cv2.imencode('.jpg', annotated_frame)
            frame_bytes = buffer.tobytes()
            
            # Yield frame in multipart format for streaming
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
    
    except Exception as e:
        logger.error(f"Error processing video: {str(e)}")
    finally:
        # Always release the video capture
        cap.release()

def get_camera_by_id(camera_id):
    """Get a specific camera by ID"""
    cameras = get_camera_feeds()
    return next((cam for cam in cameras if cam['id'] == camera_id), None) 