const db = require('../../models/db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config(); 

function generateInviteCode() {
  return 'INV' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

// Configure Nodemailer securely using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});

// ================== Invite Caregiver ==================
exports.inviteCaregiver = async (req, res) => {
  try {
    const {
      caregiver_full_name,
      email,
      phone,
      relationship_to_infant,
      infant_full_name,
      date_of_birth,
      gender,
      weight,
      facility,
      facility_contact,
      doctor_id
    } = req.body;

    if (
      !caregiver_full_name ||
      !email ||
      !phone ||
      !relationship_to_infant ||
      !infant_full_name ||
      !date_of_birth ||
      !gender ||
      !weight ||
      !facility ||
      !facility_contact ||
      !doctor_id 
    ) {
      return res
        .status(400)
        .json({ success: false, message: 'All caregiver, infant fields, and doctor assignment are required.' });
    }

    // Generate invitation code and expiry date
    const inviteCode = generateInviteCode();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    // Insert invitation
    const [inviteResult] = await db.query(
      'INSERT INTO caregiver_invitations (caregiver_email, invitation_code, status, expiry_date, created_at) VALUES (?, ?, ?, ?, NOW())',
      [email, inviteCode, 'sent', expiryDate]
    );
    const inviteId = inviteResult.insertId;

    // Insert caregiver
    const [caregiverResult] = await db.query(
      'INSERT INTO caregivers (full_name, email, relationship_to_infant, phone_number, status, invite_id, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [caregiver_full_name, email, relationship_to_infant, phone, 'Pending', inviteId]
    );
    const caregiverId = caregiverResult.insertId;

    // Insert infant with doctor assignment
    await db.query(
      'INSERT INTO infants (caregiver_id, full_name, date_of_birth, gender, weight, facility, facility_contact, doctor_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [caregiverId, infant_full_name, date_of_birth, gender, weight, facility, facility_contact, doctor_id]
    );

    // Registration link
    const registrationLink = `http://localhost:5000/CaregiverModule/caregiverRegister.html`;

    // Compose email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'InfantCare360 | Caregiver Invitation',
      html: `
        <p>Hi <strong>${caregiver_full_name}</strong>,</p>
        <p>You have been invited to join <b>InfantCare360</b> as a caregiver for your infant.</p>
        <p>Please click the link below to complete your registration:</p>
        <p><a href="${registrationLink}" target="_blank" style="color:#007bff;">Go to Registration Page</a></p>
        <p><b>Your Invitation Code:</b> ${inviteCode}</p>
        <p>This invitation will expire on <b>${expiryDate.toDateString()}</b>.</p>
        <br>
        <p>Warm regards,<br>InfantCare360 Team</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Invitation sent successfully and saved to database!',
      inviteCode,
      caregiverId,
      inviteId
    });

  } catch (error) {
    console.error('Error in inviteCaregiver:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'A caregiver with this email already exists. Please use a different email.'
      });
    }

    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

// ================== Get All Caregivers ==================
exports.getAllCaregivers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  const search = req.query.search ? `%${req.query.search}%` : '%%';

  try {
    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total
       FROM caregivers
       WHERE full_name LIKE ? OR email LIKE ?`,
      [search, search]
    );

    const totalCaregivers = countResult[0].total;
    const totalPages = Math.ceil(totalCaregivers / limit);

    const [results] = await db.query(
      `
      SELECT 
          c.caregiver_id,
          c.full_name,
          c.email,
          c.phone_number,
          GROUP_CONCAT(i.full_name SEPARATOR ', ') AS infants,
          c.relationship_to_infant,
          c.status
      FROM caregivers c
      LEFT JOIN infants i ON c.caregiver_id = i.caregiver_id
      WHERE c.full_name LIKE ? OR c.email LIKE ?
      GROUP BY c.caregiver_id
      ORDER BY c.full_name ASC
      LIMIT ? OFFSET ?
      `,
      [search, search, limit, offset]
    );

    res.status(200).json({
      success: true,
      caregivers: results,
      pagination: {
        currentPage: page,
        totalPages,
        totalCaregivers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('❌ Error fetching caregivers:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching caregivers.' });
  }
};

// ================== Get Caregiver By ID ==================
exports.getCaregiverById = async (req, res) => {
  const caregiverId = req.params.id;

  try {
    const [results] = await db.query(
      `SELECT 
        c.caregiver_id,
        c.full_name AS caregiver_name,
        c.email,
        c.phone_number,
        c.relationship_to_infant,
        c.status,
        i.infant_id,
        i.full_name AS infant_name,
        i.date_of_birth,
        i.gender,
        i.weight,
        i.facility,
        i.facility_contact,
        i.doctor_id  -- <-- NEW
      FROM caregivers c
      LEFT JOIN infants i ON c.caregiver_id = i.caregiver_id
      WHERE c.caregiver_id = ?`,
      [caregiverId]
    );

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Caregiver not found' });
    }

    const row = results[0];
    const caregiver = {
      id: row.caregiver_id,
      full_name: row.caregiver_name,
      email: row.email,
      phone_number: row.phone_number,
      relationship_to_infant: row.relationship_to_infant,
      status: row.status
    };

    const infant = {
      id: row.infant_id,
      full_name: row.infant_name,
      date_of_birth: row.date_of_birth,
      gender: row.gender,
      weight: row.weight,
      facility: row.facility,
      facility_contact: row.facility_contact,
      doctor_id: row.doctor_id // <-- NEW
    };

    res.status(200).json({ success: true, caregiver, infant });

  } catch (error) {
    console.error('❌ Error fetching caregiver:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ================== Update Caregiver & Infant ==================
exports.updateCaregiver = async (req, res) => {
  const caregiverId = req.params.id;
  const {
    caregiver_full_name,
    email,
    phone,
    relationship_to_infant,
    infant_full_name,
    date_of_birth,
    gender,
    weight,
    facility,
    facility_contact,
    doctor_id 
  } = req.body;

  if (!caregiver_full_name || !email || !phone || !relationship_to_infant ||
      !infant_full_name || !date_of_birth || !gender || !weight || !facility || !facility_contact || !doctor_id) {
    return res.status(400).json({ success: false, message: 'All caregiver, infant fields, and doctor assignment are required.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE caregivers
       SET full_name = ?, email = ?, phone_number = ?, relationship_to_infant = ?
       WHERE caregiver_id = ?`,
      [caregiver_full_name, email, phone, relationship_to_infant, caregiverId]
    );

    await connection.query(
      `UPDATE infants
       SET full_name = ?, date_of_birth = ?, gender = ?, weight = ?, facility = ?, facility_contact = ?, doctor_id = ?
       WHERE caregiver_id = ?`,
      [infant_full_name, date_of_birth, gender, weight, facility, facility_contact, doctor_id, caregiverId]
    );

    await connection.commit();
    connection.release();

    res.status(200).json({ success: true, message: 'Caregiver and infant updated successfully' });

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('❌ Error updating caregiver:', error);
    res.status(500).json({ success: false, message: 'Server error while updating caregiver' });
  }
};

// ================== Delete Caregiver & Infant ==================
exports.deleteCaregiver = async (req, res) => {
  const caregiverId = req.params.id;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      'DELETE FROM infants WHERE caregiver_id = ?',
      [caregiverId]
    );

    const [result] = await connection.query(
      'DELETE FROM caregivers WHERE caregiver_id = ?',
      [caregiverId]
    );

    await connection.commit();
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Caregiver not found.' });
    }

    res.status(200).json({ success: true, message: 'Caregiver deleted successfully.' });

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('❌ Error deleting caregiver:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting caregiver.' });
  }
};

// ================== Get All Doctors  ==================
exports.getAllDoctors = async (req, res) => {
  try {
    const [results] = await db.query(
      'SELECT doctor_id, full_name, email FROM doctors WHERE account_status = "Active" ORDER BY full_name ASC'
    );
    res.status(200).json({ success: true, doctors: results });
  } catch (error) {
    console.error('❌ Error fetching doctors:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching doctors.' });
  }
};
