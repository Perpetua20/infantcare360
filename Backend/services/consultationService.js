const db = require('../models/db');

/**
 * Update consultation fields by id
 * @param {number} id - Consultation ID
 * @param {object} fields - Key-value pairs to update
 * @returns {Promise}
 */
async function updateConsultation(id, fields) {
    if (!id || typeof fields !== 'object' || Object.keys(fields).length === 0) {
        throw new Error('Invalid arguments for updateConsultation');
    }
    const setClause = Object.keys(fields)
        .map(key => `${key} = ?`)
        .join(', ');
    const values = Object.values(fields);
    const sql = `UPDATE consultations SET ${setClause} WHERE id = ?`;
    await db.query(sql, [...values, id]);
}

module.exports = { updateConsultation };
