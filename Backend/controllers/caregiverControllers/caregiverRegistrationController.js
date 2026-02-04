const bcrypt = require("bcryptjs");
const db = require("../../models/db");

// Register a caregiver using invite code
exports.registerCaregiver = async (req, res) => {
  try {
    const { fullName, email, inviteCode, password } = req.body;

    // 1️⃣ Check if all fields are provided
    if (!fullName || !email || !inviteCode || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // 2️⃣ Find invitation by code and email
    const [inviteRows] = await db.query(
      "SELECT * FROM caregiver_invitations WHERE invitation_code = ? AND caregiver_email = ?",
      [inviteCode, email]
    );

    if (inviteRows.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid invitation code or email" });
    }

    const invite = inviteRows[0];

    // 3️⃣ Check if invite expired, cancelled, or already used
    const now = new Date();
    const expiryDate = new Date(invite.expiry_date);
    if (invite.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "This invitation has been cancelled by the administrator."
      });
    }

    if (expiryDate < now) {
      return res.status(400).json({
        success: false,
        message: "Invitation code has expired."
      });
    }

    if (invite.status === "used") {
      return res.status(400).json({
        success: false,
        message: "This invitation has already been used."
      });
    }

    // 4️⃣ Find caregiver record
    const [caregiverRows] = await db.query(
      "SELECT * FROM caregivers WHERE email = ?",
      [email]
    );

    if (caregiverRows.length === 0) {
      return res.status(404).json({ success: false, message: "Caregiver record not found" });
    }

    // 5️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6️⃣ Only update the password and status (do NOT overwrite name or email)
    await db.query(
      "UPDATE caregivers SET password_hash = ?, status = 'Active' WHERE email = ?",
      [hashedPassword, email]
    );

    // 7️⃣ Mark the invite as used
    await db.query(
      "UPDATE caregiver_invitations SET status = 'used' WHERE invite_id = ?",
      [invite.invite_id]
    );

    res.json({
      success: true,
      message: "Registration successful. You can now log in.",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};
