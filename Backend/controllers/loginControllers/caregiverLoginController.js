const { verifyPassword, generateToken } = require('../../services/authService');
const db = require("../../models/db");

exports.caregiverLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM caregivers WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }
    const caregiver = rows[0];
    const isMatch = await verifyPassword(password, caregiver.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }
    const token = generateToken({ caregiver_id: caregiver.caregiver_id, email: caregiver.email, role: "caregiver" }, '3h');
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      caregiver: {
        caregiver_id: caregiver.caregiver_id,
        full_name: caregiver.full_name,
        email: caregiver.email,
        relationship_to_infant: caregiver.relationship_to_infant,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
