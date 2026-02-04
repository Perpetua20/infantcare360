const db = require('../models/db');

/**
 * Get caregiver by ID
 * @param {number} caregiverId
 * @returns {Promise<object|null>}
 */
async function getCaregiverById(caregiverId) {
    const [rows] = await db.query('SELECT * FROM caregivers WHERE caregiver_id = ?', [caregiverId]);
    return rows[0] || null;
}

/**
 * Get doctor by ID
 * @param {number} doctorId
 * @returns {Promise<object|null>}
 */
async function getDoctorById(doctorId) {
    const [rows] = await db.query('SELECT * FROM doctors WHERE doctor_id = ?', [doctorId]);
    return rows[0] || null;
}

/**
 * Get admin by ID
 * @param {number} adminId
 * @returns {Promise<object|null>}
 */
async function getAdminById(adminId) {
    const [rows] = await db.query('SELECT * FROM admins WHERE admin_id = ?', [adminId]);
    return rows[0] || null;
}

module.exports = {
    getCaregiverById,
    getDoctorById,
    getAdminById
};
