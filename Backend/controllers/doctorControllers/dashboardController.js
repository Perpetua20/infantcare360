const pool = require('../../models/db'); 

// -------------------- DOCTOR DASHBOARD STATS --------------------
exports.getDashboardStats = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const [totalInfantsRows] = await pool.query(
      'SELECT COUNT(*) AS count FROM infants WHERE doctor_id = ?',
      [doctorId]
    );
    const [upcomingVaccinationsRows] = await pool.query(
      `SELECT COUNT(*) AS count FROM administered_vaccines
       WHERE doctor_id = ?
       AND due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)`,
      [doctorId]
    );

    const [completedVaccinationsRows] = await pool.query(
      `SELECT COUNT(*) AS count FROM administered_vaccines
       WHERE doctor_id = ? AND status = 'Completed'`,
      [doctorId]
    );

    const [pendingConsultationsRows] = await pool.query(
      `SELECT COUNT(*) AS count FROM consultations
       WHERE doctor_id = ? AND status = 'Pending'`,
      [doctorId]
    );

    const [overdueVaccinationsRows] = await pool.query(
      `SELECT COUNT(*) AS count FROM administered_vaccines
       WHERE doctor_id = ? AND due_date < CURDATE()
       AND status != 'Completed'`,
      [doctorId]
    );

    const [newInfantsAssignedRows] = await pool.query(
      `SELECT COUNT(*) AS count FROM infants
       WHERE doctor_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
      [doctorId]
    );
    const totalInfants = totalInfantsRows[0]?.count || 0;
    const upcomingVaccinations = upcomingVaccinationsRows[0]?.count || 0;
    const completedVaccinations = completedVaccinationsRows[0]?.count || 0;
    const pendingConsultations = pendingConsultationsRows[0]?.count || 0;
    const overdueVaccinations = overdueVaccinationsRows[0]?.count || 0;
    const newInfantsAssigned = newInfantsAssignedRows[0]?.count || 0;
    res.json({
      success: true,
      data: {
        totalInfants,
        upcomingVaccinations,
        completedVaccinations,
        pendingConsultations,
        overdueVaccinations,
        newInfantsAssigned
      }
    });

  } catch (error) {
    console.error('❌ Error fetching doctor dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
