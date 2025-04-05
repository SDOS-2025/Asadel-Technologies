from flask import Blueprint, request, jsonify, current_app
import json
import logging
from datetime import datetime
from mysql.connector import Error
from backend.utils import get_db_connection

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
areas_bp = Blueprint('areas', __name__, url_prefix='/api')

@areas_bp.route('/regions', methods=['GET'])
def get_regions():
    """Get a list of all regions with their sub-regions"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get all regions
        cursor.execute('''
            SELECT id, name, created_at
            FROM regions
            ORDER BY name ASC
        ''')
        
        regions_data = cursor.fetchall()
        
        # Format date fields
        for region in regions_data:
            if 'created_at' in region and region['created_at']:
                region['created_at'] = region['created_at'].strftime('%d/%m/%y')
        
        # Get all sub-regions for these regions
        regions_with_sub_regions = []
        
        for region in regions_data:
            cursor.execute('''
                SELECT id, name, created_at
                FROM sub_regions
                WHERE region_id = %s
                ORDER BY name ASC
            ''', (region['id'],))
            
            sub_regions = cursor.fetchall()
            
            # Format date fields for sub-regions
            for sub_region in sub_regions:
                if 'created_at' in sub_region and sub_region['created_at']:
                    sub_region['created_at'] = sub_region['created_at'].strftime('%d/%m/%y')
            
            regions_with_sub_regions.append({
                'id': region['id'],
                'region': region['name'],
                'created_at': region['created_at'],
                'subRegions': sub_regions
            })

        return jsonify({
            'success': True,
            'data': regions_with_sub_regions
        })

    except Error as e:
        logger.error(f"Database error while fetching regions: {e}")
        return jsonify({'success': False, 'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        logger.error(f"Unexpected error while fetching regions: {e}")
        return jsonify({'success': False, 'error': f'Internal server error: {str(e)}'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

@areas_bp.route('/regions/<int:region_id>', methods=['GET'])
def get_region(region_id):
    """Get details of a specific region with its sub-regions"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get region details
        cursor.execute('''
            SELECT id, name, created_at
            FROM regions
            WHERE id = %s
        ''', (region_id,))
        
        region = cursor.fetchone()
        
        if not region:
            return jsonify({'success': False, 'error': 'Region not found'}), 404
        
        # Format date fields
        if 'created_at' in region and region['created_at']:
            region['created_at'] = region['created_at'].strftime('%d/%m/%y')
        
        # Get sub-regions for this region
        cursor.execute('''
            SELECT id, name, created_at
            FROM sub_regions
            WHERE region_id = %s
            ORDER BY name ASC
        ''', (region_id,))
        
        sub_regions = cursor.fetchall()
        
        # Format date fields for sub-regions
        for sub_region in sub_regions:
            if 'created_at' in sub_region and sub_region['created_at']:
                sub_region['created_at'] = sub_region['created_at'].strftime('%d/%m/%y')
        
        result = {
            'id': region['id'],
            'region': region['name'],
            'created_at': region['created_at'],
            'subRegions': sub_regions
        }

        return jsonify({
            'success': True,
            'data': result
        })

    except Error as e:
        logger.error(f"Database error while fetching region: {e}")
        return jsonify({'success': False, 'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        logger.error(f"Unexpected error while fetching region: {e}")
        return jsonify({'success': False, 'error': f'Internal server error: {str(e)}'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

@areas_bp.route('/regions', methods=['POST'])
def create_region():
    """Create a new region"""
    try:
        data = request.get_json()
        region_name = data.get('name')
        
        if not region_name:
            return jsonify({'success': False, 'error': 'Region name is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if region name already exists
        cursor.execute('SELECT id FROM regions WHERE name = %s', (region_name,))
        if cursor.fetchone():
            return jsonify({'success': False, 'error': 'Region with this name already exists'}), 400
        
        # Insert new region
        cursor.execute('INSERT INTO regions (name) VALUES (%s)', (region_name,))
        region_id = cursor.lastrowid
        conn.commit()
        
        return jsonify({
            'success': True,
            'message': 'Region created successfully',
            'data': {
                'id': region_id,
                'name': region_name
            }
        }), 201

    except Error as e:
        logger.error(f"Database error while creating region: {e}")
        return jsonify({'success': False, 'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        logger.error(f"Unexpected error while creating region: {e}")
        return jsonify({'success': False, 'error': f'Internal server error: {str(e)}'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

@areas_bp.route('/regions/<int:region_id>', methods=['PUT'])
def update_region(region_id):
    """Update an existing region"""
    try:
        data = request.get_json()
        region_name = data.get('name')
        
        if not region_name:
            return jsonify({'success': False, 'error': 'Region name is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if region exists
        cursor.execute('SELECT id FROM regions WHERE id = %s', (region_id,))
        if not cursor.fetchone():
            return jsonify({'success': False, 'error': 'Region not found'}), 404
        
        # Check if name is already in use by another region
        cursor.execute('SELECT id FROM regions WHERE name = %s AND id != %s', (region_name, region_id))
        if cursor.fetchone():
            return jsonify({'success': False, 'error': 'Region with this name already exists'}), 400
        
        # Update region
        cursor.execute('UPDATE regions SET name = %s WHERE id = %s', (region_name, region_id))
        conn.commit()
        
        return jsonify({
            'success': True,
            'message': 'Region updated successfully'
        })

    except Error as e:
        logger.error(f"Database error while updating region: {e}")
        return jsonify({'success': False, 'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        logger.error(f"Unexpected error while updating region: {e}")
        return jsonify({'success': False, 'error': f'Internal server error: {str(e)}'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

@areas_bp.route('/regions/<int:region_id>', methods=['DELETE'])
def delete_region(region_id):
    """Delete a region and all its sub-regions"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check if region exists
        cursor.execute('SELECT id FROM regions WHERE id = %s', (region_id,))
        if not cursor.fetchone():
            return jsonify({'success': False, 'error': 'Region not found'}), 404
        
        # Check if there are cameras associated with this region
        cursor.execute('SELECT id, name FROM cameras WHERE region = %s', (region_id,))
        cameras = cursor.fetchall()
        
        if cameras:
            # Region has associated cameras
            camera_names = [camera['name'] for camera in cameras]
            logger.warning(f"Cannot delete region ID {region_id}: {len(cameras)} cameras are associated with it")
            return jsonify({
                'success': False, 
                'error': f'Cannot delete region. {len(cameras)} cameras are associated with it. Please reassign or delete these cameras first: {", ".join(camera_names)}.'
            }), 400
        
        # Get all sub-regions for this region (to log them)
        cursor.execute('SELECT id, name FROM sub_regions WHERE region_id = %s', (region_id,))
        sub_regions = cursor.fetchall()
        logger.info(f"Deleting region ID {region_id} with {len(sub_regions)} sub-regions")
        
        # Delete region (will cascade delete sub-regions due to FK constraint)
        cursor.execute('DELETE FROM regions WHERE id = %s', (region_id,))
        conn.commit()
        
        return jsonify({
            'success': True,
            'message': 'Region and all its sub-regions deleted successfully'
        })

    except Error as e:
        conn.rollback()
        logger.error(f"Database error while deleting region: {e}")
        return jsonify({'success': False, 'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        conn.rollback()
        logger.error(f"Unexpected error while deleting region: {e}")
        return jsonify({'success': False, 'error': f'Internal server error: {str(e)}'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

@areas_bp.route('/sub-regions', methods=['POST'])
def create_sub_region():
    """Create a new sub-region within a region"""
    try:
        data = request.get_json()
        sub_region_name = data.get('name')
        region_id = data.get('region_id')
        
        if not sub_region_name:
            return jsonify({'success': False, 'error': 'Sub-region name is required'}), 400
        
        if not region_id:
            return jsonify({'success': False, 'error': 'Region ID is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if region exists
        cursor.execute('SELECT id FROM regions WHERE id = %s', (region_id,))
        if not cursor.fetchone():
            return jsonify({'success': False, 'error': 'Region not found'}), 404
        
        # Check if sub-region name already exists within this region
        cursor.execute('SELECT id FROM sub_regions WHERE name = %s AND region_id = %s', (sub_region_name, region_id))
        if cursor.fetchone():
            return jsonify({'success': False, 'error': 'Sub-region with this name already exists in this region'}), 400
        
        # Insert new sub-region
        cursor.execute('INSERT INTO sub_regions (name, region_id) VALUES (%s, %s)', (sub_region_name, region_id))
        sub_region_id = cursor.lastrowid
        conn.commit()
        
        return jsonify({
            'success': True,
            'message': 'Sub-region created successfully',
            'data': {
                'id': sub_region_id,
                'name': sub_region_name,
                'region_id': region_id
            }
        }), 201

    except Error as e:
        logger.error(f"Database error while creating sub-region: {e}")
        return jsonify({'success': False, 'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        logger.error(f"Unexpected error while creating sub-region: {e}")
        return jsonify({'success': False, 'error': f'Internal server error: {str(e)}'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

@areas_bp.route('/sub-regions/<int:sub_region_id>', methods=['PUT'])
def update_sub_region(sub_region_id):
    """Update an existing sub-region"""
    try:
        data = request.get_json()
        sub_region_name = data.get('name')
        
        if not sub_region_name:
            return jsonify({'success': False, 'error': 'Sub-region name is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check if sub-region exists and get its region_id
        cursor.execute('SELECT id, region_id FROM sub_regions WHERE id = %s', (sub_region_id,))
        sub_region = cursor.fetchone()
        if not sub_region:
            return jsonify({'success': False, 'error': 'Sub-region not found'}), 404
        
        region_id = sub_region['region_id']
        
        # Check if name is already in use by another sub-region in the same region
        cursor.execute(
            'SELECT id FROM sub_regions WHERE name = %s AND region_id = %s AND id != %s', 
            (sub_region_name, region_id, sub_region_id)
        )
        if cursor.fetchone():
            return jsonify({'success': False, 'error': 'Sub-region with this name already exists in this region'}), 400
        
        # Update sub-region
        cursor.execute('UPDATE sub_regions SET name = %s WHERE id = %s', (sub_region_name, sub_region_id))
        conn.commit()
        
        return jsonify({
            'success': True,
            'message': 'Sub-region updated successfully'
        })

    except Error as e:
        logger.error(f"Database error while updating sub-region: {e}")
        return jsonify({'success': False, 'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        logger.error(f"Unexpected error while updating sub-region: {e}")
        return jsonify({'success': False, 'error': f'Internal server error: {str(e)}'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

@areas_bp.route('/sub-regions/<int:sub_region_id>', methods=['DELETE'])
def delete_sub_region(sub_region_id):
    """Delete a sub-region"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check if sub-region exists
        cursor.execute('SELECT id FROM sub_regions WHERE id = %s', (sub_region_id,))
        if not cursor.fetchone():
            return jsonify({'success': False, 'error': 'Sub-region not found'}), 404
        
        # Check if there are cameras associated with this sub-region
        cursor.execute('SELECT id, name FROM cameras WHERE sub_region = %s', (sub_region_id,))
        cameras = cursor.fetchall()
        
        if cameras:
            # Sub-region has associated cameras
            camera_names = [camera['name'] for camera in cameras]
            logger.warning(f"Cannot delete sub-region ID {sub_region_id}: {len(cameras)} cameras are associated with it")
            return jsonify({
                'success': False, 
                'error': f'Cannot delete sub-region. {len(cameras)} cameras are associated with it. Please reassign or delete these cameras first: {", ".join(camera_names)}.'
            }), 400
        
        # Delete sub-region
        cursor.execute('DELETE FROM sub_regions WHERE id = %s', (sub_region_id,))
        conn.commit()
        
        return jsonify({
            'success': True,
            'message': 'Sub-region deleted successfully'
        })

    except Error as e:
        conn.rollback()
        logger.error(f"Database error while deleting sub-region: {e}")
        return jsonify({'success': False, 'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        conn.rollback()
        logger.error(f"Unexpected error while deleting sub-region: {e}")
        return jsonify({'success': False, 'error': f'Internal server error: {str(e)}'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

@areas_bp.route('/regions-list', methods=['GET'])
def get_regions_list():
    """Get a simple list of all regions and their sub-regions for dropdown selection"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get all regions
        cursor.execute('SELECT id, name FROM regions ORDER BY name ASC')
        regions_data = cursor.fetchall()
        
        result = []
        
        # Get sub-regions for each region
        for region in regions_data:
            cursor.execute(
                'SELECT id, name FROM sub_regions WHERE region_id = %s ORDER BY name ASC', 
                (region['id'],)
            )
            sub_regions = cursor.fetchall()
            
            result.append({
                'id': region['id'],
                'name': region['name'],
                'subRegions': sub_regions
            })

        return jsonify({
            'success': True,
            'data': result
        })

    except Error as e:
        logger.error(f"Database error while fetching regions list: {e}")
        return jsonify({'success': False, 'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        logger.error(f"Unexpected error while fetching regions list: {e}")
        return jsonify({'success': False, 'error': f'Internal server error: {str(e)}'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close() 