import mysql.connector
import bcrypt
import json

# Database connection configuration
db_config = {
    'host': 'localhost',
    'user': 'root',  # Replace with your MySQL username
    'password': 'pmroot',  # Replace with your MySQL password
    'database': 'asadel_db'
}

def hash_password(password):
    # Convert password to bytes and hash it
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def insert_user(username, email, password, role, date_of_birth, country, access_type,profile_image_url):
    try:
        # Create database connection
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Hash the password
        hashed_password = hash_password(password)

        # Prepare the SQL query
        query = """
        INSERT INTO users (username, email, password, role, date_of_birth, country, access_type,profile_image_url)
        VALUES (%s, %s, %s, %s, %s, %s, %s,%s)
        """

        # Convert access_type list to JSON string
        access_type_json = json.dumps(access_type)

        # Values to insert
        values = (username, email, hashed_password, role, date_of_birth, country, access_type_json,profile_image_url)

        # Execute the query
        cursor.execute(query, values)
        conn.commit()

        print(f"Successfully inserted user: {username}")
        return True

    except mysql.connector.Error as err:
        print(f"Error inserting user: {err}")
        return False

    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

def main():
    # Example users to insert
    users = [
        {
            'username': 'Naman Jindal',
            'email': 'naman@iiitd.com',
            'password': 'Naman@123',
            'role': 'Admin',
            'date_of_birth': '2000-01-01',
            'country': 'India',
            'access_type': ['Dashboard','Camera Management','Area Management','User Management','Reports and Analytics'],
            'profile_image_url': None
        },
        
        {
            'username': 'Neil',
            'email': 'neil@iiitd.com',
            'password': 'Neil@123',
            'role': 'Admin',
            'date_of_birth': '1995-01-01',
            'country': 'India',
            'access_type': ['Dashboard','Camera Management','Area Management','User Management'],
            'profile_image_url': None
        },
        {
            'username': 'Saksham',
            'email': 'saksham@iiitd.com',
            'password': 'Saksham@123',
            'role': 'Admin',
            'date_of_birth': '2000-01-01',
            'country': 'India',
            'access_type': ['Dashboard','Camera Management','Area Management'],
            'profile_image_url': None
        },
        {
            'username': 'Pratham Mittal',
            'email': 'pratham@iiitd.com',
            'password': 'Pratham@123',
            'role': 'Admin',
            'date_of_birth': '2000-01-01',
            'country': 'India',
            'access_type': ['Dashboard','Camera Management','Area Management'],
            'profile_image_url': None
        }
       
    ]

    # Insert each user
    for user in users:
        insert_user(
            user['username'],
            user['email'],
            user['password'],
            user['role'],
            user['date_of_birth'],
            user['country'],
            user['access_type'],
            user['profile_image_url']
        )

if __name__ == "__main__":
    main() 