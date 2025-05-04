import mysql.connector
import os
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

# Database configuration from environment variables
db_config = {
    'host': os.getenv('MYSQL_HOST'),
    'user': os.getenv('MYSQL_USER'),
    'password': os.getenv('MYSQL_PASSWORD'),
    'database': os.getenv('MYSQL_DATABASE')
}

def clear_detections_table():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Delete all rows and reset auto-increment
        cursor.execute("DELETE FROM detections")
        cursor.execute("ALTER TABLE detections AUTO_INCREMENT = 1")

        conn.commit()
        print("All data erased from 'detections' table and ID reset to 1.")

    except mysql.connector.Error as err:
        print(f"Error: {err}")

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == '__main__':
    clear_detections_table()
