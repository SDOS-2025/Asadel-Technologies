import cv2
from ultralytics import YOLO
import yt_dlp
import logging
import os
import sys
from datetime import datetime
import time
import numpy as np

# Add the parent directory to sys.path to make imports work
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))
from backend.utils import get_db_connection
from backend.test import check_and_send_unique_log_email

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

def get_camera_info(camera_id):
    """Get camera information including region and sub-region"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT c.id, c.region, c.sub_region
            FROM cameras c
            WHERE c.id = %s
        """
        
        cursor.execute(query, (camera_id,))
        camera = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return camera
    except Exception as e:
        logger.error(f"Error getting camera info: {str(e)}")
        return None

def process_video(video_path, camera_id):
    """Process video with object detection and stream the results"""
    # Handle YouTube URLs
    if is_youtube_url(video_path):
        try:
            logger.info(f"Processing YouTube URL: {video_path}")
            video_path = get_youtube_stream_url(video_path)
        except Exception as e:
            logger.error(f"Failed to process YouTube URL: {str(e)}")
            yield (b'--frame\r\n'
                   b'Content-Type: text/plain\r\n\r\n' + 
                   f"Error processing YouTube URL: {str(e)}".encode() + b'\r\n')
            return

    # Set OpenCV parameters for better RTSP handling
    logger.info(f"Attempting to open video stream: {video_path}")
    
    # Set OpenCV parameters for better RTSP handling
    os.environ['OPENCV_FFMPEG_CAPTURE_OPTIONS'] = 'rtsp_transport;tcp'
    
    # Configure capture with appropriate parameters
    cap = cv2.VideoCapture(video_path, cv2.CAP_FFMPEG)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 3)  # Set buffer size
    
    # Set connection timeout
    max_retries = 3
    retry_count = 0
    connection_successful = False
    
    while retry_count < max_retries and not connection_successful:
        retry_count += 1
        if cap.isOpened():
            connection_successful = True
            logger.info(f"Successfully opened video stream after {retry_count} attempt(s)")
            break
        else:
            logger.warning(f"Failed to open stream on attempt {retry_count}/{max_retries}, retrying...")
            time.sleep(2)  # Wait before retry
            cap = cv2.VideoCapture(video_path, cv2.CAP_FFMPEG)
    
    if not cap.isOpened():
        logger.error(f"Error: Could not open video after {max_retries} attempts: {video_path}")
        # Return a friendly error image instead of None
        error_img = create_error_image(f"Camera {camera_id} unavailable")
        _, buffer = cv2.imencode('.jpg', error_img)
        frame_bytes = buffer.tobytes()
        
        # Yield the error frame once
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        return

    # Processing variables
    frame_count = 0
    error_reported = False
    last_frame_time = time.time()
    
    try:
        while cap.isOpened():
            # Check for stream timeout
            current_time = time.time()
            if current_time - last_frame_time > 10:  # 10 seconds timeout
                logger.error(f"Stream timeout for camera {camera_id}")
                break
                
            # Read frame
            ret, frame = cap.read()
            if not ret:
                # Try to reconnect once if stream dropped
                if not error_reported:
                    logger.warning(f"Stream dropped for camera {camera_id}, attempting to reconnect")
                    cap.release()
                    cap = cv2.VideoCapture(video_path, cv2.CAP_FFMPEG)
                    if cap.isOpened():
                        ret, frame = cap.read()
                        if not ret:
                            logger.warning("End of video stream reached after reconnection attempt")
                            break
                    else:
                        logger.warning("Failed to reconnect to stream")
                        break
                    error_reported = True
                else:
                    logger.warning("End of video stream reached")
                    break

            # Reset error flag and update last frame time on successful frame read
            error_reported = False
            last_frame_time = time.time()
                
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
                    detections = []
                    for box in result.boxes:
                        class_id = int(box.cls[0].item())
                        conf = box.conf[0].item()
                        class_label = model.names[class_id]

                        if class_label in CONF_THRESHOLDS and conf >= CONF_THRESHOLDS[class_label]:
                            filtered_boxes.append(box)
                            detections.append({
                                'type': class_label,
                                'confidence': float(conf),
                                'timestamp': datetime.now().strftime('%H:%M:%S'),
                                'date': datetime.now().strftime('%d/%m/%y')
                            })

                    # Save detections to database if any found
                    if detections:
                        try:
                            conn = get_db_connection()
                            cursor = conn.cursor()
                            for detection in detections:
                                query = """
                                INSERT INTO detections 
                                (camera_id, alert_type, confidence, time_stamp, date_created)
                                VALUES (%s, %s, %s, %s, %s)
                                """
                                cursor.execute(query, (
                                    camera_id,
                                    detection['type'],
                                    detection['confidence'],
                                    detection['timestamp'],
                                    detection['date']
                                ))
                                
                                # Get camera info and check for unique detection
                                camera_info = get_camera_info(camera_id)
                                if camera_info:
                                    check_and_send_unique_log_email(
                                        camera_id,
                                        camera_info['region'],
                                        camera_info['sub_region'],
                                        detection['type']
                                    )
                                
                            conn.commit()
                            cursor.close()
                            conn.close()
                        except Exception as e:
                            logger.error(f"Error saving detections to database: {str(e)}")

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

def create_error_image(message):
    """Create an image with error text"""
    # Create a black image
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    
    # Add text
    font = cv2.FONT_HERSHEY_SIMPLEX
    text_size = cv2.getTextSize(message, font, 1, 2)[0]
    text_x = (img.shape[1] - text_size[0]) // 2
    text_y = (img.shape[0] + text_size[1]) // 2
    
    cv2.putText(img, message, (text_x, text_y), font, 1, (255, 255, 255), 2)
    cv2.putText(img, "Connection Error", (text_x, text_y + 40), font, 0.8, (200, 0, 0), 2)
    
    return img 