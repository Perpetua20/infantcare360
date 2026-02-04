const bcrypt = require('bcryptjs');
const mysql = require('mysql2');

// Connect to your MySQL database
const db = mysql.createConnection({
  host: '127.0.0.1',       
  port: 3307,              
  user: 'root',
  password: '',            
  database: 'infantcare360' 
});

// Connect and confirm
db.connect(err => {
  if (err) throw err;
});

// Admin details
const fullName = 'System Admin';
const email = 'admin@infantcare360.com';
const plainPassword = 'Admin123'; 

// Hash the password and insert the admin
const createAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const query = `
      INSERT INTO admins (full_name, email, password_hash)
      VALUES (?, ?, ?)
    `;

    db.query(query, [fullName, email, hashedPassword], (err, result) => {
      if (err) throw err;
      process.exit();
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();