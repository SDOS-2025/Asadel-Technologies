import os
import sys
import mysql.connector
import logging
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Database configuration
db_config = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', 'naman'),
    'database': os.getenv('MYSQL_DATABASE', 'asadel_db')
}

def get_connection():
    """Get a database connection with the configuration from .env"""
    try:
        connection = mysql.connector.connect(**db_config)
        if connection.is_connected():
            logger.info('Successfully connected to the database')
            return connection
    except mysql.connector.Error as e:
        logger.error(f"Error connecting to MySQL: {e}")
        raise

def init_database():
    """Initialize the database by creating tables and inserting data."""
    try:
        # Connect to the database
        conn = get_connection()
        cursor = conn.cursor()
        logger.info(f"Connected to database: {conn.database}")

        # Create tables
        logger.info("Creating tables...")
        # Execute the SQL from schema.sql
        with open('schema.sql', 'r') as f:
            sql_schema = f.read()
        for result in cursor.execute(sql_schema, multi=True):
            pass
        conn.commit()
        logger.info("Tables created successfully.")
        
        # Initialize regions and sub-regions
        init_areas(conn)
        
        # Initialize cameras
        init_cameras(conn)
        
        logger.info("Database initialization completed successfully.")
        
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        import traceback
        logger.error(traceback.format_exc())
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn and conn.is_connected():
            conn.close()
            logger.info("Database connection closed.")

def init_areas(conn):
    """Initialize regions and sub-regions if they don't exist."""
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Check if regions already exist
        cursor.execute("SELECT COUNT(*) as count FROM regions")
        region_count = cursor.fetchone()['count']
        
        if region_count > 0:
            logger.info(f"Found {region_count} existing regions. Skipping region initialization.")
            return
        
        logger.info("Initializing regions and sub-regions...")
        
        # Sample regions and sub-regions
        regions = [
            {"name": "Building A", "sub_regions": ["Floor 1", "Floor 2", "Floor 3"]},
            {"name": "Building B", "sub_regions": ["Reception", "Office Area", "Conference Room"]},
            {"name": "Parking Area", "sub_regions": ["Section A", "Section B", "VIP Parking"]}
        ]
        
        for region in regions:
            # Insert region
            cursor.execute("INSERT INTO regions (name) VALUES (%s)", (region["name"],))
            region_id = cursor.lastrowid
            logger.info(f"Added region: {region['name']} (ID: {region_id})")
            
            # Insert sub-regions
            for sub_region in region["sub_regions"]:
                cursor.execute(
                    "INSERT INTO sub_regions (name, region_id) VALUES (%s, %s)",
                    (sub_region, region_id)
                )
                sub_region_id = cursor.lastrowid
                logger.info(f"  - Added sub-region: {sub_region} (ID: {sub_region_id})")
        
        conn.commit()
        logger.info("Regions and sub-regions initialized successfully.")
        
    except Exception as e:
        conn.rollback()
        logger.error(f"Error initializing regions: {e}")
        raise

def init_cameras(conn):
    """Initialize sample cameras if none exist."""
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Check if cameras already exist
        cursor.execute("SELECT COUNT(*) as count FROM cameras")
        camera_count = cursor.fetchone()['count']
        
        if camera_count > 0:
            logger.info(f"Found {camera_count} existing cameras. Skipping camera initialization.")
            return
        
        logger.info("Initializing sample cameras...")
        
        # Get region and sub-region IDs
        cursor.execute("SELECT id, name FROM regions")
        regions = {region['name']: region['id'] for region in cursor.fetchall()}
        
        cursor.execute("SELECT id, name, region_id FROM sub_regions")
        sub_regions = {}
        for sub_region in cursor.fetchall():
            region_id = sub_region['region_id']
            if region_id not in sub_regions:
                sub_regions[region_id] = {}
            sub_regions[region_id][sub_region['name']] = sub_region['id']
        
        # Sample cameras
        cameras = [
            {
                "name": "Entry 1",
                "rtsp_url": "rtsp://admin:admin123@192.168.1.101:554/cam/realmonitor?channel=1&subtype=0",
                "region": "Building A",
                "sub_region": "Floor 1",
                "description": "Main entry camera",
                "access_level": 1,
                "status": "active"
            },
            {
                "name": "Parking 1",
                "rtsp_url": "rtsp://admin:admin123@192.168.1.102:554/cam/realmonitor?channel=1&subtype=0",
                "region": "Parking Area",
                "sub_region": "Section A",
                "description": "Parking lot overview",
                "access_level": 2,
                "status": "active"
            },
            {
                "name": "Lobby 1",
                "rtsp_url": "rtsp://admin:admin123@192.168.1.103:554/cam/realmonitor?channel=1&subtype=0",
                "region": "Building B",
                "sub_region": "Reception",
                "description": "Lobby surveillance",
                "access_level": 1,
                "status": "active"
            },
            {
                "name": "Back Entry",
                "rtsp_url": "rtsp://admin:admin123@192.168.1.104:554/cam/realmonitor?channel=1&subtype=0",
                "region": "Building A",
                "sub_region": "Floor 2",
                "description": "Back door surveillance",
                "access_level": 3,
                "status": "inactive"
            }
        ]
        
        for camera in cameras:
            region_id = regions.get(camera['region'])
            sub_region_id = sub_regions.get(region_id, {}).get(camera['sub_region'])
            
            if not region_id or not sub_region_id:
                logger.warning(f"Could not find region/sub-region for camera {camera['name']}")
                continue
            
            cursor.execute(
                """
                INSERT INTO cameras 
                (name, rtsp_url, region, sub_region, description, access_level, status) 
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    camera['name'],
                    camera['rtsp_url'],
                    region_id,
                    sub_region_id,
                    camera['description'],
                    camera['access_level'],
                    camera['status']
                )
            )
            camera_id = cursor.lastrowid
            logger.info(f"Added camera: {camera['name']} (ID: {camera_id})")
        
        conn.commit()
        logger.info("Sample cameras initialized successfully.")
        
    except Exception as e:
        conn.rollback()
        logger.error(f"Error initializing cameras: {e}")
        raise

if __name__ == "__main__":
    init_database() 