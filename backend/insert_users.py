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
            'password': 'naman@123',
            'role': 'Admin',
            'date_of_birth': '2000-01-01',
            'country': 'India',
            'access_type': ['All'],
            'profile_image_url': "Asadel-Technologies/backend/uploads/profile_images/Naman_Lord.png"
        },
        
        {
            'username': 'Neil',
            'email': 'neil@iiitd.com',
            'password': 'neil@25',
            'role': 'Admin',
            'date_of_birth': '1995-01-01',
            'country': 'India',
            'access_type': ['All'],
            'profile_image_url': None
        },
        {
            'username': 'Saksham',
            'email': 'saksham@iiitd.com',
            'password': 'saksham@25',
            'role': 'Admin',
            'date_of_birth': '2000-01-01',
            'country': 'India',
            'access_type': ['All'],
            'profile_image_url': None
        },
        {
            'username': 'Pratham Mittal',
            'email': 'pratham@iiitd.com',
            'password': 'pm123',
            'role': 'Admin',
            'date_of_birth': '2000-01-01',
            'country': 'India',
            'access_type': ['All'],
            'profile_image_url': None
        },
        {'username': 'Alice Johnson', 'email': 'alice@example.com', 'password': 'alice@123', 'role': 'User', 'date_of_birth': '1998-05-12', 'country': 'USA', 'access_type': ['Dashboard','Camera Management'],'profile_image_url': None},
        {'username': 'Bob Williams', 'email': 'bob@example.com', 'password': 'bob@456', 'role': 'User', 'date_of_birth': '1992-07-19', 'country': 'UK', 'access_type': ['Reports and Analysis'],'profile_image_url': None},
        {'username': 'Charlie Brown', 'email': 'charlie@example.com', 'password': 'charlie@789', 'role': 'Admin', 'date_of_birth': '1990-11-23', 'country': 'Canada', 'access_type': ['All'],'profile_image_url': None},
        {'username': 'David Lee', 'email': 'david@example.com', 'password': 'david@pass', 'role': 'User', 'date_of_birth': '1995-03-14', 'country': 'Australia', 'access_type': ['Dashboard', 'Reports and Analysis'],'profile_image_url': None},
        {'username': 'Eva Green', 'email': 'eva@example.com', 'password': 'eva@pass', 'role': 'User', 'date_of_birth': '1987-09-30', 'country': 'Germany', 'access_type': ['Reports and Analysis'],'profile_image_url': None},
        {'username': 'Frank Martin', 'email': 'frank@example.com', 'password': 'frank@pass', 'role': 'User', 'date_of_birth': '1993-06-22', 'country': 'France', 'access_type': ['Dashboard'],'profile_image_url': None},
        {'username': 'Grace Hopper', 'email': 'grace@example.com', 'password': 'grace@pass', 'role': 'Admin', 'date_of_birth': '1985-04-10', 'country': 'USA', 'access_type': ['All'],'profile_image_url': None},
        {'username': 'Henry Ford', 'email': 'henry@example.com', 'password': 'henry@pass', 'role': 'User', 'date_of_birth': '1997-02-18', 'country': 'India', 'access_type': ['Dashboard', 'Reports and Analysis'],'profile_image_url': None},
        {'username': 'Isabella Clark', 'email': 'isabella@example.com', 'password': 'isabella@pass', 'role': 'User', 'date_of_birth': '1994-08-15', 'country': 'Spain', 'access_type': ['Reports and Analysis'],'profile_image_url': None},
        {'username': 'Jack Wilson', 'email': 'jack@example.com', 'password': 'jack@pass', 'role': 'Admin', 'date_of_birth': '1983-12-25', 'country': 'Italy', 'access_type': ['All'],'profile_image_url': None},
        {'username': 'Kelly Adams', 'email': 'kelly@example.com', 'password': 'kelly@pass', 'role': 'User', 'date_of_birth': '1999-10-05', 'country': 'Brazil', 'access_type': ['Dashboard'],'profile_image_url': None},
        {'username': 'Leo Messi', 'email': 'leo@example.com', 'password': 'leo@pass', 'role': 'User', 'date_of_birth': '1991-06-24', 'country': 'Argentina', 'access_type': ['Reports and Analysis'],'profile_image_url': None},
        {'username': 'Mia Taylor', 'email': 'mia@example.com', 'password': 'mia@pass', 'role': 'User', 'date_of_birth': '2001-01-09', 'country': 'Canada', 'access_type': ['Dashboard', 'Reports and Analysis'],'profile_image_url': None},
        {'username': 'Nathan Drake', 'email': 'nathan@example.com', 'password': 'nathan@pass', 'role': 'Admin', 'date_of_birth': '1989-07-07', 'country': 'UK', 'access_type': ['All'],'profile_image_url': None},
        {'username': 'Olivia White', 'email': 'olivia@example.com', 'password': 'olivia@pass', 'role': 'User', 'date_of_birth': '1996-09-21', 'country': 'Mexico', 'access_type': ['Dashboard','Area Management'],'profile_image_url': None},
        {'username': 'Peter Parker', 'email': 'peter@example.com', 'password': 'peter@pass', 'role': 'User', 'date_of_birth': '1993-05-04', 'country': 'USA', 'access_type': ['Reports and Analysis'],'profile_image_url': None},
        {'username': 'Quincy Jones', 'email': 'quincy@example.com', 'password': 'quincy@pass', 'role': 'Admin', 'date_of_birth': '1982-11-11', 'country': 'Germany', 'access_type': ['All'],'profile_image_url': None},
        {'username': 'Rachel Green', 'email': 'rachel@example.com', 'password': 'rachel@pass', 'role': 'User', 'date_of_birth': '2000-03-29', 'country': 'France', 'access_type': ['Dashboard','User Management'],'profile_image_url': None},
        {'username': 'Steve Rogers', 'email': 'steve@example.com', 'password': 'steve@pass', 'role': 'User', 'date_of_birth': '1990-12-17', 'country': 'USA', 'access_type': ['Reports and Analysis'],'profile_image_url': None}
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