const db = require ("../../models/db");

// Helper to calculate age in months or weeks
function getInfantAge(dob) {
  const birthDate = new Date(dob);
  const now = new Date();
  const diffInMs = now - birthDate;
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  if (diffInDays < 273) {
    const weeks = Math.floor(diffInDays / 7);
    return { value: weeks, unit: "week" };
  } else {
    let months = (now.getFullYear() - birthDate.getFullYear()) * 12;
    months -= birthDate.getMonth();
    months += now.getMonth();
    months = months >= 0 ? months : 0;
    return { value: months, unit: "month" };
  }
}

// Helper to calculate upcoming vaccine date
function calculateNextVaccineDate(dob, weeks) {
  const birthDate = new Date(dob);
  const nextDate = new Date(birthDate);
  nextDate.setDate(birthDate.getDate() + weeks * 7);
  return nextDate.toISOString().split("T")[0]; 
}


exports.getCaregiverDashboard = async (req, res) => {
  try {
    const caregiverId = req.user.caregiver_id;

    //  Caregiver info
    const [caregiverRows] = await db.query(
      "SELECT full_name FROM caregivers WHERE caregiver_id = ?", 
      [caregiverId]
    );
    if (!caregiverRows.length)
      return res.status(404).json({ success: false, message: "Caregiver not found" });
    const caregiver = caregiverRows[0];

    //  Infant info
    const [infantRows] = await db.query(
      "SELECT infant_id, full_name, date_of_birth FROM infants WHERE caregiver_id = ?", 
      [caregiverId]
    );
    const infant = infantRows.length ? infantRows[0] : null;
    const infantId = infant ? infant.infant_id : null;
    const infantAge = infant ? getInfantAge(infant.date_of_birth) : null;

    //  Vaccination progress
    const [[{ totalDoses }]] = await db.query(
      "SELECT COUNT(*) AS totalDoses FROM vaccination_schedule"
    );
    
    const [[{ completedDoses }]] = await db.query(
      "SELECT COUNT(*) AS completedDoses FROM administered_vaccines WHERE infant_id = ? AND status='Completed'", 
      [infantId]
    );
    const vaccinationProgress = totalDoses ? Math.round((completedDoses / totalDoses) * 100) : 0;

    //  Next upcoming vaccines
    const [[nextAgeRow]] = await db.query(
      `SELECT MIN(vs.recommended_age_weeks) AS nextAge
       FROM vaccination_schedule vs
       LEFT JOIN administered_vaccines av
         ON vs.schedule_id = av.schedule_id AND av.infant_id = ?
       WHERE av.schedule_id IS NULL
         AND vs.recommended_age_weeks >= ?`,
      [
        infantId,
        infantAge ? (infantAge.unit === "month" ? infantAge.value * 4.345 : infantAge.value) : 0
      ]
    );

    const nextAge = nextAgeRow ? nextAgeRow.nextAge : null;
    const nextVaccineDate = (infant && nextAge !== null)
      ? calculateNextVaccineDate(infant.date_of_birth, nextAge)
      : null;

    // Response
    res.json({
      success: true,
      caregiverName: caregiver.full_name,
      infantName: infant ? infant.full_name : "No infant linked",
      infantAge,
      vaccinationProgress,
      nextVaccineWeek: nextAge !== null ? nextAge : null,
      nextVaccineDate: nextVaccineDate
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


//==================== GET INFANT PROFILE ====================
exports.getInfantProfile = async (req, res) => {
  try {
    const caregiverId = req.user.caregiver_id;

    // Fetch infant details linked to the caregiver
    const [rows] = await db.query(
      `SELECT full_name, date_of_birth, gender, weight, facility, facility_contact 
       FROM infants WHERE caregiver_id = ?`,
      [caregiverId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "No infant found for this caregiver." });
    }

    const infant = rows[0];

    res.json({
      success: true,
      infant,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while fetching infant details." });
  }
};