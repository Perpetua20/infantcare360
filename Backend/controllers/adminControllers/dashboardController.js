const db = require('../../models/db');

async function getAdminDashboard(req, res) {
  try {
    // Total Doctors (only role='Doctor' and account_status='Active')
    const [[{ totalDoctors }]] = await db.execute(
      `SELECT COUNT(*) AS totalDoctors 
       FROM doctors 
       WHERE role='Doctor'`
    );

    //  Total Caregivers
    const [[{ totalCaregivers }]] = await db.execute(
      `SELECT COUNT(*) AS totalCaregivers 
       FROM caregivers`
    );

     // Total Infants
     const [[{ totalInfants }]] = await db.execute(
              `SELECT COUNT(*) AS totalInfants 
               FROM infants`
    );

    //  Pending Telehealth Consultations
    const [[{ pendingConsultations }]] = await db.execute(
      `SELECT COUNT(*) AS pendingConsultations 
       FROM consultations 
       WHERE status='pending'`
    );

    // New Registrations (caregivers + infants created in last 7 days)
    const [[{ newRegistrations }]] = await db.execute(
      `SELECT 
          (SELECT COUNT(*) FROM caregivers WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY))
        AS newRegistrations`
    );

    // Completed Vaccinations (last 7 days)
    const [[{ completedVaccinations }]] = await db.execute(
      `SELECT COUNT(*) AS completedVaccinations 
       FROM administered_vaccines 
       WHERE status='Completed' 
         AND date_administered >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`
    );

    // Return JSON response
    res.json({
      totalDoctors,
      totalCaregivers,
      totalInfants,
      pendingConsultations,
      newRegistrations,
      completedVaccinations
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
}

module.exports = { getAdminDashboard };
