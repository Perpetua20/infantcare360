const db = require("../../models/db");

// ================== GET VACCINATION SCHEDULE ==================
exports.getVaccinationSchedule = async (req, res) => {
  try {
    const caregiverId = req.user.caregiver_id;

    //  Get infant info
    const [infantRows] = await db.query(
      `SELECT infant_id, full_name, date_of_birth
       FROM infants
       WHERE caregiver_id = ?`,
      [caregiverId]
    );

    if (infantRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No infant found for this caregiver.",
      });
    }

    const infant = infantRows[0];
    const dob = new Date(infant.date_of_birth);
    const today = new Date();
    const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

    // Fetch all vaccines from schedule
const [scheduleRows] = await db.query(
  `SELECT 
     vs.schedule_id,
     vs.vaccine_name,
     vs.recommended_age_weeks,
     vs.description,
     av.date_administered,
     d.full_name AS doctor_name
   FROM vaccination_schedule vs
   LEFT JOIN administered_vaccines av
     ON av.schedule_id = vs.schedule_id
     AND av.infant_id = ?
   LEFT JOIN doctors d
     ON av.doctor_id = d.doctor_id
   ORDER BY vs.recommended_age_weeks ASC`,
  [infant.infant_id]
);

    if (!scheduleRows.length) {
      return res.json({
        success: true,
        infant: {
          infant_id: infant.infant_id,
          full_name: infant.full_name,
          date_of_birth: infant.date_of_birth,
        },
        vaccines: [],
        lastDose: [],
        overDue: []
      });
    }

    // Compute recommended dates and filter out past vaccines
    const scheduleWithDates = scheduleRows
      .map((row) => {
        let recommendedDate = new Date(dob);

        if (row.recommended_age_weeks < 39) {
          // Week-based schedule (<39 weeks)
          recommendedDate.setDate(recommendedDate.getDate() + row.recommended_age_weeks * 7);
        } else {
          // Month-based schedule (>=39 weeks) → automatically handles leap years
          const months = Math.round(row.recommended_age_weeks / 4.33);
          recommendedDate.setMonth(recommendedDate.getMonth() + months);
        }

        return {
          schedule_id: row.schedule_id,
          vaccine_name: row.vaccine_name,
          recommended_age_weeks: row.recommended_age_weeks,
          description: row.description,
          recommended_date: recommendedDate.toISOString().split("T")[0],
          recommendedUTC: Date.UTC(
            recommendedDate.getFullYear(),
            recommendedDate.getMonth(),
            recommendedDate.getDate()
          ),
           date_administered: row. date_administered || null, // <-- add this
           doctor_name: row.doctor_name || null, 
        };
      })
     
      .filter(vaccine => vaccine.recommendedUTC >= todayUTC)
      .map(({ recommendedUTC, ...v }) => v);

        // Compute the most recent administered vaccine
        const lastAdministered = scheduleRows
          .filter(row => row.date_administered) // only administered doses
          .map(row => ({
            vaccine_name: row.vaccine_name,
             recommended_age_weeks: row.recommended_age_weeks,
            date_administered: row.date_administered,
            doctor_name: row.doctor_name || null
          }))
          .sort((a, b) => new Date(b.date_administered) - new Date(a.date_administered));

      const lastDose = lastAdministered[0] || null; // pick the most recent one, or null if none

      // -------------------- COMPUTE OVERDUE VACCINES --------------------
const overdueMap = new Map();

scheduleRows.forEach(row => {
  const notAdministered = !row.date_administered || row.date_administered === "0000-00-00" || row.date_administered === null;

  if (notAdministered) {
    let recommendedDate = new Date(dob);
    if (row.recommended_age_weeks < 39) {
      recommendedDate.setDate(recommendedDate.getDate() + row.recommended_age_weeks * 7);
    } else {
      const months = Math.round(row.recommended_age_weeks / 4.33);
      recommendedDate.setMonth(recommendedDate.getMonth() + months);
    }

    const recommendedUTC = Date.UTC(recommendedDate.getFullYear(), recommendedDate.getMonth(), recommendedDate.getDate());

    if (recommendedUTC < todayUTC) {
      const weekKey = row.recommended_age_weeks;

      if (!overdueMap.has(weekKey)) {
        overdueMap.set(weekKey, {
          recommended_age_weeks: weekKey,
          recommended_date: recommendedDate.toISOString().split("T")[0],
          vaccines: [row.vaccine_name],
        });
      } else {
        overdueMap.get(weekKey).vaccines.push(row.vaccine_name);
      }
    }
  }
});

    const overDue = Array.from(overdueMap.values()).sort((a, b) => a.recommended_age_weeks - b.recommended_age_weeks);

    // Return structured JSON
    res.json({
      success: true,
      infant: {
        infant_id: infant.infant_id,
        full_name: infant.full_name,
        date_of_birth: infant.date_of_birth,
      },
      vaccines: scheduleWithDates,
      lastDose: lastDose,
      overDue
    });

  } catch (error) {
    console.error("❌ Error fetching vaccination schedule:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching vaccination schedule.",
    });
  }
};
