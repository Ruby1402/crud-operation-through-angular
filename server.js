//node.js backend server code using express and mysql for handling CRUD operations on student entries 

//imports the express module to create a web server
const express = require('express');
//imports the mysql2 library to connect and interact with a MySQL database.
const mysql = require('mysql2');
//imports the cors middleware to allow cross-origin reqests (necessary when the frontend is hosted on a different port or domain)
const cors = require('cors');

//creates an instance of an Express Application
const app = express();
//enables CORS for all routes, allowing your Angular frontend to communicate with this backend.
app.use(cors());
//allows the app to parse incoming JSON requests (body of POST/PUT)
app.use(express.json());

//creates a connection to the MYSQL database using the given credentials and DB name (studentdb).
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'studentdb'
});

//Connects to the MySQL server and logs a success or failure message 
db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL database.');
});

// Define a GET route at /entries
app.get('/entries', (req, res) => {
  //Runs a SQL query to select all rows from the entries table 
  db.query('SELECT * FROM entries', (err, results) => {
    
    //if there's an error, it logs it and sends a 500(server error) response.
    if (err) {
      console.error('Select error:', err);
      return res.status(500).json({ message: 'DB error', error: err });
    }
    //if successful, sends back the fetched rows as JSON
    res.json(results);
  });
});

// Add new entry
app.post('/entries', (req, res) => {
  const { srno, name, branch, rollno } = req.body;
//Defines a POST route to add a new entry.
//Destructures the student data from the request body

  const query = 'INSERT INTO entries (srno, name, branch, rollno) VALUES (?, ?, ?, ?)';
//Prepares a parameterized SQL query to insert the new entry.

  db.query(query, [srno, name, branch, rollno], (err, results) => {
    //executes the query with provided values to prevent SQL injection

    //if successful, sends a 201 status (created) response
    if (err) {
      console.error('Insert error:', err);
      return res.status(500).json({ message: 'DB error', error: err });
    }
    res.status(201).json({ message: 'Entry added successfully' });
  });
});

// Update entry
//Defines a PUT route to update an entry by srno (passed in the URL)
//Extracts and parses the serial number, and the updated data 
app.put('/entries/:srno', (req, res) => {
  const srno = parseInt(req.params.srno, 10);
  const { name, branch, rollno } = req.body;

  //sql query to update an entry based on the serial number. 
  const query = 'UPDATE entries SET name = ?, branch = ?, rollno = ? WHERE srno = ?';

  //Executes the query with updated values. 
  db.query(query, [name, branch, rollno, srno], (err, results) => {

    //if no rows were affected, that means no entry was found with that srno. 
    //otherwise sends success response
    if (err) {
      console.error('Update error:', err);
      return res.status(500).json({ message: 'DB error', error: err });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'No entry found to update' });
    }
    res.send('Entry updated successfully');
  });
});

// Delete entry. Defines a DELETE route to remove an entry by its srno.
app.delete('/entries/:srno', (req, res) => {
  const srno = parseInt(req.params.srno, 10);
  const query = 'DELETE FROM entries WHERE srno = ?';

  //executes the delete query and sends appropriate response. 
  db.query(query, [srno], (err, results) => {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ message: 'DB error', error: err });
    }
    res.send('Entry deleted successfully');
  });
});

//Starts the express server on port 3000 and logs a confirmation message. 
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

//this Node.js + express server handles 
// Get all Entries
// Post new entries
// PUT update existing entry
// DELETE an entry by ID