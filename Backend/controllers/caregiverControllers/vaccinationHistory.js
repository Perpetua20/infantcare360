const db = require("../../models/db");

exports.getVaccinationHistory = async (req, res) => {
  try {
    const caregiverId = req.user.caregiver_id;

    //  Get infant info
    const [infantRows] = await db.query(
      `SELECT infant_id, full_name, date_of_birth
       FROM infants
       WHERE caregiver_id = ?`,
      [caregiverId]
    );

    if (!infantRows.length) {
      return res.status(404).json({ success: false, message: "No infant found for this caregiver." });
    }

    const infant = infantRows[0];

    //  Fetch administered vaccines
    const [adminRows] = await db.query(
      `SELECT vs.vaccine_name, vs.recommended_age_weeks, av.date_administered, d.full_name AS doctor_name
       FROM vaccination_schedule vs
       INNER JOIN administered_vaccines av
         ON av.schedule_id = vs.schedule_id
         AND av.infant_id = ?
       LEFT JOIN doctors d
         ON av.doctor_id = d.doctor_id
       ORDER BY av.date_administered ASC`,
      [infant.infant_id]
    );

    //  Group vaccines by schedule week
    const groupedVaccines = {};
    adminRows.forEach(row => {
      const week = row.recommended_age_weeks;
      if (!groupedVaccines[week]) {
        groupedVaccines[week] = {
          recommended_age_weeks: week,
          vaccines: [],
          date_administered: row.date_administered,
          doctor_name: row.doctor_name || null
        };
      }
      groupedVaccines[week].vaccines.push(row.vaccine_name);
    });

    const administeredHistory = Object.keys(groupedVaccines)
      .sort((a, b) => a - b)
      .map(key => groupedVaccines[key]);

    //  Compute last dose (most recent administered)
    let lastDose = null;
    if (adminRows.length > 0) {
      const latest = [...adminRows].sort(
        (a, b) => new Date(b.date_administered) - new Date(a.date_administered)
      )[0];
      lastDose = {
        schedule: `Week ${latest.recommended_age_weeks} vaccines`,
        date_administered: latest.date_administered,
        doctor_name: latest.doctor_name || null
      };
    }

    //  Compute progress %
    const [totalVaccinesRows] = await db.query(`SELECT COUNT(*) AS total FROM vaccination_schedule`);
    const totalVaccines = totalVaccinesRows[0].total;
    const progressPercent = totalVaccines
      ? Math.round((adminRows.length / totalVaccines) * 100)
      : 0;

    //  Compute next dose (first unadministered AND still upcoming)
    const [unadministeredRows] = await db.query(
      `SELECT vs.recommended_age_weeks
       FROM vaccination_schedule vs
       LEFT JOIN administered_vaccines av
         ON av.schedule_id = vs.schedule_id
         AND av.infant_id = ?
       WHERE av.id IS NULL
       ORDER BY vs.recommended_age_weeks ASC`,
      [infant.infant_id]
    );

    let nextDose = null;

    if (unadministeredRows.length) {
      const dob = new Date(infant.date_of_birth);
      const today = new Date();
      const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      for (const dose of unadministeredRows) {
        const scheduledDate = new Date(dob);
        scheduledDate.setDate(dob.getDate() + dose.recommended_age_weeks * 7);

        const scheduledMid = new Date(
          scheduledDate.getFullYear(),
          scheduledDate.getMonth(),
          scheduledDate.getDate()
        );

        // Only consider doses that are today or in the future
        if (scheduledMid >= todayMid) {
          const diffDays = Math.ceil((scheduledMid - todayMid) / (1000 * 60 * 60 * 24));
          nextDose = {
            recommended_age_weeks: dose.recommended_age_weeks,
            recommended_date: scheduledDate.toISOString().split("T")[0],
            due_in_days: diffDays
          };
          break;
        }
      }
    }
    if (!nextDose) {
      nextDose = null;
    }

    //  Send JSON
    res.json({
      success: true,
      infant,
      lastDose,
      progressPercent,
      nextDose,
      administeredHistory
    });

  } catch (error) {
    console.error("❌ Error fetching vaccination history:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching vaccination history."
    });
  }
};
