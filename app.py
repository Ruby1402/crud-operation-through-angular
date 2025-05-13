from flask import Flask, request, jsonify
# Flask: a python framework used to build web applications
# request: lets you access data sent in an HTTP request (eg. from a from or a JSON body)
# jsonify: converts python dictionaries/lists into JSON, which is the format used for sending data over API's 
from flask_cors import CORS
# CORS: (Cross-Origin Resource Sharing) This allows the server to handle requests from other domains 
# (eg. frontend on localhost:3001 talking to backend on localhost:3000 )
import pymysql
from pymysql.cursors import DictCursor
# pymysql: a library used to connect to and interact with a mysql database.
# DictCursor: Makes sure the results from the database are returned as dictionaries instead of tuples.
# this is useful because dictionaries have named keys.

# Create a Flask application
app = Flask(__name__) # this creates the flask application instance
# Enable CORS for all routes
CORS(app) # enables CORS on all routes so they can be accessed from other origins (like frontend apps)

# Database connection configuration
#  This dictionary contains the information needed to connect to your MySQL database.
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'studentdb',
    'cursorclass': DictCursor  # This returns results as dictionaries instead of tuples
}

# Function to create a database connection
def get_db_connection():
    try:
        connection = pymysql.connect(**DB_CONFIG)
        print("Connected to MySQL database.")
        return connection
    except pymysql.MySQLError as e:
        print(f"Database connection failed: {e}")
        return None
    # thisfunction creates a connection to the database using the settings from DB_CONFIG
    # if the connection fails, it catches the error and prints it.

# Route to get all entries
@app.route('/entries', methods=['GET'])
def get_entries():
    # this route listens for GET requests to /entries. Used to retrieve all entries.
    connection = get_db_connection()
    if connection is None:
        return jsonify({"message": "Database connection error"}), 500
    # connect to the database and handle failure
    
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT * FROM entries')
            entries = cursor.fetchall()
        connection.close()
        return jsonify(entries)
    # executes SQL to get all rows from the entries table.
    # fetchall() returns the result as a list of dictionaries.
    # result is returned as a JSON response. 
    
    except pymysql.MySQLError as e:
        connection.close()
        print(f"Select error: {e}")
        return jsonify({"message": "DB error", "error": str(e)}), 500
    # Handles any errors that occur during the query.

# Route to add a new entry
@app.route('/entries', methods=['POST'])
def add_entry():
    # Handles a POST requests to /entries for adding a new entry.
    connection = get_db_connection()
    if connection is None:
        return jsonify({"message": "Database connection error"}), 500
     # Handles any errors that occur during the query.
    
    try:
        data = request.json
        srno = data.get('srno')
        name = data.get('name')
        branch = data.get('branch')
        rollno = data.get('rollno')
        # Gets the data from the request body (expects JSON format)
        
        with connection.cursor() as cursor:
            query = 'INSERT INTO entries (srno, name, branch, rollno) VALUES (%s, %s, %s, %s)'
            cursor.execute(query, (srno, name, branch, rollno))
        # Prepares and executes an INSERT SQL query using the provided data

        connection.commit()
        connection.close()
        return jsonify({"message": "Entry added successfully"}), 200
    # Saves the change to the database and returns a success message with status 201 (Created).
    
    except pymysql.MySQLError as e:
        connection.close()
        print(f"Insert error: {e}")
        return jsonify({"message": "DB error", "error": str(e)}), 500
     # Handles any errors that occur during the query.

# Route to update an entry
@app.route('/entries/<int:srno>', methods=['PUT'])
def update_entry(srno):
    # Handles PUT requests to update an entry with a specific srno.

    connection = get_db_connection()
    if connection is None:
        return jsonify({"message": "Database connection error"}), 500
     # Handles any errors that occur during the query.
    
    try:
        data = request.json
        name = data.get('name')
        branch = data.get('branch')
        rollno = data.get('rollno')
        # Reads the updated fields from the request body
        
        with connection.cursor() as cursor:
            query = 'UPDATE entries SET name = %s, branch = %s, rollno = %s WHERE srno = %s'
            cursor.execute(query, (name, branch, rollno, srno))
            affected_rows = cursor.rowcount
            # Executes the sql update command. rowcount tells how many rows were modified. 
        
        connection.commit() # save the changes 
        connection.close() # close the editing field. 
        
        if affected_rows == 0:
            return jsonify({"message": "No entry found to update"}), 404
         # if no row was updated (maybe because srno didn't exist), return 404
        return jsonify({"message": "Entry updated successfully"})
             # if updated provide the following message.
    
    except pymysql.MySQLError as e:
        connection.close()
        print(f"Update error: {e}")
        return jsonify({"message": "DB error", "error": str(e)}), 500
         # Handles any errors that occur during the query.
    

# Route to delete an entry
@app.route('/entries/<int:srno>', methods=['DELETE'])
def delete_entry(srno):
    # handles delete requests for a specific entry by its srno.
    connection = get_db_connection()
    if connection is None:
        return jsonify({"message": "Database connection error"}), 500
         # Handles any errors that occur during the query.
    
    try:
        with connection.cursor() as cursor:
            query = 'DELETE FROM entries WHERE srno = %s'
            cursor.execute(query, (srno,))
        # Executes SQL to delete the entry with the given srno.

        connection.commit() # save the changes 
        connection.close() # close the database connection
        return jsonify({"message": "Entry deleted successfully"})
    #  return the message once done to confirm the successful process.
    
    except pymysql.MySQLError as e:
        connection.close()
        print(f"Delete error: {e}")
        return jsonify({"message": "DB error", "error": str(e)}), 500
         # Handles any errors that occur during the query.


# Run the application
if __name__ == '__main__': # runs the flask app, ensures this code only runs if teh script is executed directly.
    try:
        app.run(debug=True, port=3000)
        # runs the flask server on port 3000
    except OSError as e:
        print(f"Could not start server on port 3000: {e}")
        print("Trying alternative port 8080...")
        # if port 3000 is unavailable, tries port 8080, and if that fails, 5000 then 8888
        try:
            app.run(debug=True, port=8080)
        except OSError:
            print("Port 8080 also failed. Trying port 5000...")
            try:
                app.run(debug=True, port=5000)
            except OSError:
                print("Port 5000 also failed. Using a high port number...")
                app.run(debug=True, port=8888)
                # this fallback mechanism ensures the app still runs even if the preffered port is taken. 

                # extra info 
                # 404 means not found 
                # 500 means internal server error
                # 200 means request successfull. 
