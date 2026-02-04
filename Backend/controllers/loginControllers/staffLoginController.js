const { verifyPassword, generateToken } = require('../../services/authService');
const db = require('../../models/db');
require('dotenv').config();

const loginStaff = async (req, res) => {
  let { role, email, password } = req.body;

  if (!role || !['Administrator', 'Doctor'].includes(role)) {
    return res.status(400).json({ message: 'Please select a valid role' });
  }
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  email = email.trim().toLowerCase();

  const table = role === 'Administrator' ? 'admins' : 'doctors';
  const idField = role === 'Administrator' ? 'admin_id' : 'doctor_id';
  try {
    const [results] = await db.query(
      `SELECT * FROM ${table} WHERE LOWER(TRIM(email)) = ?`,
      [email]
    );
    if (results.length === 0) {
      return res.status(404).json({ message: `${role} not found` });
    }

    const user = results[0];
    const isMatch = await verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

        const token = generateToken({
            id: user[idField],
            email: user.email,
            role: user.role || role
        }, '1h');
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user[idField],
        full_name: user.full_name,
        email: user.email,
        role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { loginStaff };
