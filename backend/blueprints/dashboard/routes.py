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

@dashboard_bp.route("/api/detections/download-pdf", methods=["GET"])
@cross_origin()
def download_detection_logs_pdf():
    """Generate and download detection logs as PDF"""
    try:
        # Log the beginning of the function for debugging
        logger.info("Starting PDF generation")
        
        # Get detections data
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT 
                d.id,
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
        
        logger.info("Executing database query")
        cursor.execute(query)
        detections = cursor.fetchall()
        logger.info(f"Retrieved {len(detections)} detections from database")
        
        cursor.close()
        conn.close()
        
        # Import needed libraries
        import io
        from flask import send_file
        from fpdf import FPDF
        
        # Process confidence values
        logger.info("Processing detection data")
        for detection in detections:
            try:
                detection['confidence'] = f"{float(detection['confidence']) * 100:.1f}%"
            except (ValueError, TypeError):
                detection['confidence'] = "N/A"
        
        # Create a basic PDF
        logger.info("Creating PDF")
        pdf = FPDF()
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_page()
        
        # Add title
        pdf.set_font("Helvetica", "B", 16)
        pdf.cell(0, 10, "Asadel Technologies", 0, 1, 'C')
        pdf.set_font("Helvetica", "I", 12)
        pdf.cell(0, 10, "Fire Detection Logs", 0, 1, 'C')
        pdf.ln(5)
        
        # Add timestamp
        from datetime import datetime
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(0, 10, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", 0, 1)
        pdf.ln(5)
        
        # Table headers
        headers = ['ID', 'Camera', 'Region', 'Sub-Region', 'Alert Type', 'Confidence', 'Time', 'Date']
        col_widths = [15, 35, 30, 30, 20, 20, 20, 20]
        
        # Add headers
        pdf.set_font("Helvetica", "B", 10)
        for i, header in enumerate(headers):
            pdf.cell(col_widths[i], 10, header, 1, 0)
        pdf.ln()
        
        # Add data rows
        pdf.set_font("Helvetica", "", 8)
        for detection in detections[:50]:  # Limit to first 50 records
            # Row data
            data = [
                str(detection['id']),
                detection['camera_name'],
                detection['region_name'],
                detection['sub_region_name'],
                detection['alert_type'],
                detection['confidence'],
                detection['time_stamp'],
                detection['date_created']
            ]
            
            # Write row to PDF
            for i, value in enumerate(data):
                pdf.cell(col_widths[i], 7, str(value), 1, 0)
            pdf.ln()
        
        # Create a buffer for the PDF
        logger.info("Saving PDF to buffer")
        buffer = io.BytesIO()
        
        # Output the PDF to the buffer
        pdf.output(buffer)
        buffer.seek(0)
        
        # Return the PDF file
        logger.info("Returning PDF file")
        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='fire_detection_logs.pdf'
        )
    
    except Exception as e:
        import traceback
        logger.error(f"Error generating PDF: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500 