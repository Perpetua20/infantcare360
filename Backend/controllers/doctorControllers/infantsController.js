const db = require('../../models/db');

// GET /infants - only infants assigned to the logged-in doctor
async function getInfants(req, res) {
  const doctorId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  const search = req.query.search || "";

  try {
    // Count total infants for this doctor matching search
    const [countResult] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM infants i
       JOIN caregivers c ON i.caregiver_id = c.caregiver_id
       WHERE i.doctor_id = ? AND (i.full_name LIKE ? OR c.full_name LIKE ?)`,
      [doctorId, `%${search}%`, `%${search}%`]
    );

    const totalRows = countResult[0].total;
    const totalPages = Math.ceil(totalRows / limit);

    // Fetch infant data for this doctor
    const [infants] = await db.execute(
      `SELECT i.infant_id AS id, i.full_name AS name, i.date_of_birth AS dob, i.gender,
              c.full_name AS caregiverName
       FROM infants i
       JOIN caregivers c ON i.caregiver_id = c.caregiver_id
       WHERE i.doctor_id = ? AND (i.full_name LIKE ? OR c.full_name LIKE ?)
       ORDER BY i.infant_id ASC
       LIMIT ? OFFSET ?`,
      [doctorId, `%${search}%`, `%${search}%`, limit, offset]
    );

    res.json({ currentPage: page, totalPages, infants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { getInfants};
