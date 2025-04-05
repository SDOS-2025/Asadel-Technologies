from flask import Blueprint, request, jsonify, current_app
import json
import logging
from datetime import datetime
from mysql.connector import Error
from backend.utils import get_db_connection

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
cameras_bp = Blueprint('cameras', __name__, url_prefix='/api')

@cameras_bp.route('/cameras', methods=['GET'])
def get_cameras():
    """Get a list of cameras with pagination"""
    try:
        page = int(request.args.get('page', 1))
        per_page = 10
        offset = (page - 1) * per_page

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get total count of cameras
        cursor.execute('SELECT COUNT(*) as total FROM cameras')
        result = cursor.fetchone()
        total_cameras = result['total'] if result else 0
        total_pages = (total_cameras + per_page - 1) // per_page if total_cameras > 0 else 1

        # Get paginated cameras with region and sub-region names
        cursor.execute('''
            SELECT 
                c.id, 
                c.name, 
                c.rtsp_url, 
                c.region as region_id,
                r.name as region_name, 
                c.sub_region as sub_region_id,
                sr.name as sub_region_name, 
                c.description, 
                c.access_level,
                c.status,
                c.created_at
            FROM cameras c
            LEFT JOIN regions r ON c.region = r.id
            LEFT JOIN sub_regions sr ON c.sub_region = sr.id
            ORDER BY c.created_at DESC
            LIMIT %s OFFSET %s
        ''', (per_page, offset))
        
        cameras = cursor.fetchall()

        # Format the response
        for camera in cameras:
            if 'created_at' in camera and camera['created_at']:
                camera['created_at'] = camera['created_at'].strftime('%d/%m/%y')

        return jsonify({
            'cameras': cameras,
            'total_pages': total_pages,
            'current_page': page
        })

    except Error as e:
        logger.error(f"Database error while fetching cameras: {e}")
        return jsonify({'error': 'Database error'}), 500
    except Exception as e:
        logger.error(f"Unexpected error while fetching cameras: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

@cameras_bp.route('/cameras/<int:camera_id>', methods=['GET'])
def get_camera(camera_id):
    """Get details of a specific camera"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute('''
            SELECT 
                c.id, 
                c.name, 
                c.rtsp_url, 
                c.region as region_id,
                r.name as region_name, 
                c.sub_region as sub_region_id,
                sr.name as sub_region_name, 
                c.description, 
                c.access_level,
                c.status,
                c.created_at
            FROM cameras c
            LEFT JOIN regions r ON c.region = r.id
            LEFT JOIN sub_regions sr ON c.sub_region = sr.id
            WHERE c.id = %s
        ''', (camera_id,))
        
        camera = cursor.fetchone()
        
        if not camera:
            return jsonify({'error': 'Camera not found'}), 404

        # Format the date
        if 'created_at' in camera and camera['created_at']:
            camera['created_at'] = camera['created_at'].strftime('%d/%m/%y')

        return jsonify(camera)

    except Error as e:
        logger.error(f"Database error while fetching camera: {e}")
        return jsonify({'error': 'Database error'}), 500
    except Exception as e:
        logger.error(f"Unexpected error while fetching camera: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

@cameras_bp.route('/cameras', methods=['POST'])
def create_camera():
    """Add a new camera"""
    try:
        # Handle both JSON and form data
        if request.is_json:
            data = request.get_json()
            logger.debug(f"Received JSON data for camera creation: {data}")
        else:
            data = request.form.to_dict()
            logger.debug(f"Received form data for camera creation: {data}")
        
        # Validate required fields
        required_fields = ['name', 'rtsp_url', 'region', 'sub_region', 'description', 'access_level']
        for field in required_fields:
            if field not in data:
                logger.error(f"Missing required field: {field}")
                return jsonify({'error': f'{field} is required'}), 400

        # Prepare data for insertion
        name = data.get('name')
        rtsp_url = data.get('rtsp_url')
        region = data.get('region')
        sub_region = data.get('sub_region')
        description = data.get('description')
        access_level = data.get('access_level')
        status = data.get('status', 'Active')  # Default to Active

        logger.debug(f"Processed camera data: name={name}, region={region}, status={status}")

        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert new camera
        query = '''
            INSERT INTO cameras (
                name, 
                rtsp_url, 
                region, 
                sub_region, 
                description, 
                access_level, 
                status, 
                created_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        '''
        values = (
            name,
            rtsp_url,
            region,
            sub_region,
            description,
            access_level,
            status,
            datetime.now()
        )
        
        logger.debug(f"Executing query: {query} with values: {values}")
        
        cursor.execute(query, values)
        
        new_camera_id = cursor.lastrowid
        logger.debug(f"New camera created with ID: {new_camera_id}")
        
        conn.commit()
        logger.info(f"Camera added successfully: ID={new_camera_id}, Name={name}")

        return jsonify({
            'message': 'Camera added successfully',
            'camera_id': new_camera_id
        }), 201

    except Error as e:
        logger.error(f"Database error while creating camera: {e}")
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        logger.error(f"Unexpected error while creating camera: {e}")
        logger.error(f"Exception type: {type(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

@cameras_bp.route('/cameras/<int:camera_id>', methods=['PUT'])
def update_camera(camera_id):
    """Update an existing camera"""
    try:
        data = request.get_json()
        
        # Check if any data was provided
        if not data:
            return jsonify({'error': 'No update data provided'}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check if camera exists
        cursor.execute('SELECT id FROM cameras WHERE id = %s', (camera_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Camera not found'}), 404

        # Build update query dynamically based on provided fields
        update_fields = []
        values = []

        # Fields that can be updated
        updatable_fields = {
            'name': 'name',
            'rtsp_url': 'rtsp_url',
            'region': 'region',
            'sub_region': 'sub_region',
            'description': 'description',
            'access_level': 'access_level',
            'status': 'status'
        }

        for client_field, db_field in updatable_fields.items():
            if client_field in data:
                update_fields.append(f"{db_field} = %s")
                values.append(data[client_field])

        if not update_fields:
            return jsonify({'error': 'No valid update fields provided'}), 400

        # Add camera_id to values for WHERE clause
        values.append(camera_id)

        # Execute update query
        cursor.execute(f'''
            UPDATE cameras 
            SET {', '.join(update_fields)}
            WHERE id = %s
        ''', tuple(values))

        conn.commit()

        return jsonify({'message': 'Camera updated successfully'})

    except Error as e:
        logger.error(f"Database error while updating camera: {e}")
        return jsonify({'error': 'Database error'}), 500
    except Exception as e:
        logger.error(f"Unexpected error while updating camera: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

@cameras_bp.route('/cameras/<int:camera_id>', methods=['DELETE'])
def delete_camera(camera_id):
    """Delete a camera"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check if camera exists
        cursor.execute('SELECT id FROM cameras WHERE id = %s', (camera_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Camera not found'}), 404
        
        # Delete the camera
        cursor.execute('DELETE FROM cameras WHERE id = %s', (camera_id,))
        conn.commit()
        
        return jsonify({'message': 'Camera deleted successfully'})
        
    except Error as e:
        logger.error(f"Database error while deleting camera: {e}")
        return jsonify({'error': 'Database error'}), 500
    except Exception as e:
        logger.error(f"Unexpected error while deleting camera: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

@cameras_bp.route('/cameras/<int:camera_id>/status', methods=['PUT'])
def update_camera_status(camera_id):
    """Update camera status (Active/Inactive)"""
    try:
        data = request.get_json()
        
        if 'status' not in data:
            return jsonify({'error': 'Status is required'}), 400
            
        status = data['status']
        
        # Validate status
        if status not in ['Active', 'Inactive']:
            return jsonify({'error': 'Status must be either Active or Inactive'}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check if camera exists
        cursor.execute('SELECT id FROM cameras WHERE id = %s', (camera_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Camera not found'}), 404
            
        # Update status
        cursor.execute('''
            UPDATE cameras 
            SET status = %s
            WHERE id = %s
        ''', (status, camera_id))

        conn.commit()

        return jsonify({'message': f'Camera status updated to {status}'})

    except Error as e:
        logger.error(f"Database error while updating camera status: {e}")
        return jsonify({'error': 'Database error'}), 500
    except Exception as e:
        logger.error(f"Unexpected error while updating camera status: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

@cameras_bp.route('/AddCamera', methods=['POST'])
def add_camera_alt():
    """Alternative route for adding a camera (for compatibility)"""
    logger.debug("AddCamera route accessed, forwarding to create_camera")
    return create_camera() 