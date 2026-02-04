const { pool } = require('../../models/db');

// Book consultation
exports.bookConsultation = (req, res) => {
  const { caregiver_name, infant_name, email, doctor, datetime, reason } = req.body;

  if (!caregiver_name || !infant_name || !email || !doctor || !datetime || !reason) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const sql = `INSERT INTO telehealth_consultations 
               (caregiver_name, infant_name, email, doctor, datetime, reason) 
               VALUES (?, ?, ?, ?, ?, ?)`;

  pool.query(sql, [caregiver_name, infant_name, email, doctor, datetime, reason], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(201).json({ message: 'Consultation booked successfully', id: result.insertId });
  });
};

// Get upcoming consultations
exports.getUpcomingConsultations = (req, res) => {
  const sql = `SELECT * FROM telehealth_consultations WHERE datetime >= NOW() AND status='Approved' ORDER BY datetime ASC`;
  pool.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
};

// Get past consultations
exports.getPastConsultations = (req, res) => {
  const sql = `SELECT * FROM telehealth_consultations WHERE datetime < NOW() AND status='Approved' ORDER BY datetime DESC`;
  pool.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
};

// Get cancelled consultations
exports.getCancelledConsultations = (req, res) => {
  const sql = `SELECT * FROM telehealth_consultations WHERE status='Cancelled' ORDER BY datetime DESC`;
  pool.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
};
