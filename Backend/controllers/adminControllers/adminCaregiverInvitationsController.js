const db = require('../../models/db');
const crypto = require('crypto');
const sendEmail = require('../../utils/mailer');
require('dotenv').config();


function generateInviteCode() {
  return 'INV' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

// Emails are sent via centralized mailer utility and templates

// ---------------- FETCH ALL INVITATIONS ---------------- //
exports.getAllInvitations = async (req, res) => {
  try {
    let { page, search } = req.query;
    page = parseInt(page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    search = search ? `%${search}%` : '%';

    // Count total invitations
    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM caregiver_invitations ci
       LEFT JOIN caregivers c ON c.invite_id = ci.invite_id
       LEFT JOIN infants i ON i.caregiver_id = c.caregiver_id
       WHERE c.full_name LIKE ? OR c.email LIKE ?`,
      [search, search]
    );

    const totalInvitations = countRows[0].total;
    const totalPages = Math.ceil(totalInvitations / limit);

    // Fetch paginated invitations
    const [invitations] = await db.query(
      `SELECT ci.invite_id AS id,
              c.full_name AS caregiver_name,
              c.email AS caregiver_email,
              i.full_name AS infant_name,
              ci.invitation_code,
              ci.status,
              ci.expiry_date,
              ci.created_at AS date_sent
       FROM caregiver_invitations ci
       LEFT JOIN caregivers c ON c.invite_id = ci.invite_id
       LEFT JOIN infants i ON i.caregiver_id = c.caregiver_id
       WHERE c.full_name LIKE ? OR c.email LIKE ?
       ORDER BY ci.created_at DESC
       LIMIT ? OFFSET ?`,
      [search, search, limit, offset]
    );

    res.json({
      success: true,
      invitations,
      pagination: { currentPage: page, totalPages, totalInvitations },
    });
  } catch (error) {
   
    res.status(500).json({ success: false, message: 'Server error while fetching invitations.' });
  }
};

// ---------------- RESEND INVITATION ---------------- //
exports.resendInvitation = async (req, res) => {
  try {
    const { caregiver_email } = req.body;
    

    if (!caregiver_email) {
     
      return res.status(400).json({ success: false, message: 'Caregiver email is required.' });
    }

    const [existing] = await db.query('SELECT * FROM caregivers WHERE email = ?', [caregiver_email]);
    

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'No caregiver found with that email.' });
    }

    const caregiver = existing[0];

    const [inviteData] = await db.query('SELECT * FROM caregiver_invitations WHERE invite_id = ?', [caregiver.invite_id]);
   

    if (inviteData.length === 0) {
      return res.status(404).json({ success: false, message: 'No invitation record found for this caregiver.' });
    }

    const invite = inviteData[0];

    if ((invite.status || '').toLowerCase() === 'used') {
      
      return res.status(400).json({
        success: false,
        message: `Invitation has already been used by ${caregiver.full_name}. Cannot resend.`,
      });
    }

    const newInviteCode = generateInviteCode();
    const newExpiryDate = new Date();
    newExpiryDate.setDate(newExpiryDate.getDate() + 7);
    const updatedAt = new Date();


    await db.query(
      'UPDATE caregiver_invitations SET invitation_code = ?, status = ?, expiry_date = ?, updated_at = ? WHERE invite_id = ?',
      [newInviteCode, 'resent', newExpiryDate, updatedAt, invite.invite_id]
    );

    
    const registrationLink = `http://localhost:5000/CaregiverModule/caregiverRegister.html`;
    await sendEmail(caregiver_email, 'invitationResent', { caregiverName: caregiver.full_name, registrationLink, newInviteCode, expiryDate: newExpiryDate.toDateString() });
    

    res.json({
      success: true,
      message: `Invitation resent successfully to ${caregiver_email}`,
      newInviteCode,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while resending invitation.' });
  }
};

// ---------------- CANCEL INVITATION ---------------- //
exports.cancelInvitation = async (req, res) => {
  try {
    const { inviteId } = req.params;
    if (!inviteId) {
      return res.status(400).json({ success: false, message: 'Invitation ID is required.' });
    }

    // Fetch invitation record
    const [inviteRows] = await db.query('SELECT * FROM caregiver_invitations WHERE invite_id = ?', [inviteId]);
    if (inviteRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }

    const invite = inviteRows[0];

    // Prevent cancellation of used invitations
    if ((invite.status || '').toLowerCase() === 'used') {
      return res.status(400).json({
        success: false,
        message: 'This invitation has already been used and cannot be cancelled.'
      });
    }

    // Get caregiver email
    const [caregiverRows] = await db.query('SELECT email FROM caregivers WHERE invite_id = ?', [inviteId]);
    const caregiverEmail = caregiverRows.length > 0 ? caregiverRows[0].email : null;

    if (!caregiverEmail) {
      return res.status(400).json({ success: false, message: 'Caregiver email not found for this invitation.' });
    }

    // Proceed with cancellation
    const updatedAt = new Date();
    await db.query(
      "UPDATE caregiver_invitations SET status = 'cancelled', updated_at = ? WHERE invite_id = ?",
      [updatedAt, inviteId]
    );

    // Send notification email
    await sendEmail(caregiverEmail, 'invitationCancelled', {});
    res.json({
      success: true,
      message: 'Invitation cancelled successfully and email sent to caregiver.',
    });

  } catch (error) {
    console.error('❌ ERROR in cancelInvitation:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};
