const db = require('../../models/db');
const bcrypt = require('bcryptjs');

//  Add new doctor
exports.addDoctor = async (req, res) => {
  const { full_name, email, phone_number, license, password, account_status, consultation_fee } = req.body;


  if (!full_name || !email || !phone_number || !license || !password) {
    return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = 'doctor';
    // Insert doctor into database
    const query = `
      INSERT INTO doctors 
      (full_name, email, phone_number, license, password_hash, role, account_status, consultation_fee, date_added)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    await db.query(query, [
      full_name,
      email,
      phone_number,
      license,
      hashedPassword,
      role,
      account_status,
      consultation_fee || 0
    ]);

    
    return res.status(201).json({
      success: true,
      message: 'Doctor added successfully!'
    });

  } catch (error) {
    
    // Handle duplicate license/email errors
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'A doctor with this email or license already exists.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};
exports.getAllDoctors = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  const search = req.query.search ? `%${req.query.search}%` : '%%';

  try {
    // Count total doctors matching search
    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total 
       FROM doctors 
       WHERE full_name LIKE ? OR email LIKE ?`,
      [search, search]
    );

    const totalDoctors = countResult[0].total;
    const totalPages = Math.ceil(totalDoctors / limit);

    // Fetch doctors, oldest first
    const [results] = await db.query(
      `
      SELECT doctor_id, full_name, email, phone_number, license, consultation_fee, account_status, date_added
      FROM doctors
      WHERE full_name LIKE ? OR email LIKE ?
       ORDER BY date_added ASC, doctor_id ASC
      LIMIT ? OFFSET ?
      `,

          [search, search, limit, offset]
    );

    // Respond with data and pagination info
    res.status(200).json({
      success: true,
      doctors: results,
      pagination: {
        currentPage: page,
        totalPages,
        totalDoctors,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching doctors.' });
  }
};



// Get single doctor by ID
exports.getDoctorById = async (req, res) => {
  const doctorId = req.params.id;
  const connection = await db.getConnection();

  try {
    const [rows] = await connection.query('SELECT * FROM doctors WHERE doctor_id = ?', [doctorId]);
    connection.release();

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    res.json({ success: true, doctor: rows[0] });
  } catch (error) {
    connection.release();
    res.status(500).json({ success: false, message: 'Server error while fetching doctor.' });
  }
};

// Update doctor
exports.updateDoctor = async (req, res) => {
  const doctorId = req.params.id;
  const { full_name, email, phone_number, license, consultation_fee, account_status } = req.body;

  const connection = await db.getConnection();
  try {
    const [result] = await connection.query(
      'UPDATE doctors SET full_name = ?, email = ?, phone_number = ?, license = ?, consultation_fee = ?, account_status = ? WHERE doctor_id = ?',
      [full_name, email, phone_number, license, consultation_fee, account_status, doctorId]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    res.json({ success: true, message: 'Doctor updated successfully.' });
  } catch (error) {
    connection.release();
    res.status(500).json({ success: false, message: 'Server error while updating doctor.' });
  }
};

// Delete doctor
exports.deleteDoctor = async (req, res) => {
  const doctorId = req.params.id;
  const connection = await db.getConnection();

  try {
    const [result] = await connection.query('DELETE FROM doctors WHERE doctor_id = ?', [doctorId]);
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    res.json({ success: true, message: 'Doctor deleted successfully.' });
  } catch (error) {
    connection.release();
    res.status(500).json({ success: false, message: 'Server error while deleting doctor.' });
  }
};