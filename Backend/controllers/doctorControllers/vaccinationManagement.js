const db = require('../../models/db');

// ====================== HELPERS ======================
function parseLocalDate(dateStr) {
  if (dateStr instanceof Date) {
   
    return new Date(dateStr.getFullYear(), dateStr.getMonth(), dateStr.getDate());
  }
  
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day); 
}

function addDaysLocal(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

// ====================== SEARCH INFANT ======================
exports.searchInfant = async (req, res) => {
  const { name, dob, caregiver } = req.query;
  const doctorId = req.user?.id;

  if (!name || !dob || !caregiver) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    //  Fetch infant
    const [infants] = await db.query(
      `SELECT i.infant_id, i.full_name, i.date_of_birth, c.full_name AS caregiver_name
       FROM infants i
       JOIN caregivers c ON i.caregiver_id = c.caregiver_id
       WHERE i.full_name = ? AND i.date_of_birth = ? AND c.full_name = ? AND i.doctor_id = ?`,
      [name, dob, caregiver, doctorId]
    );

    if (infants.length === 0) {
      return res.status(404).json({ message: "Infant not found or not assigned to you" });
    }

    const infant = infants[0];
    const dobDate = parseLocalDate(infant.date_of_birth);

    //  Fetch past vaccines
    const [pastVaccines] = await db.query(
      `SELECT av.schedule_id, vs.vaccine_name, vs.recommended_age_weeks, av.date_administered
       FROM administered_vaccines av
       JOIN vaccination_schedule vs ON av.schedule_id = vs.schedule_id
       WHERE av.infant_id = ?
       ORDER BY av.date_administered ASC`,
      [infant.infant_id]
    );

    const givenScheduleIds = pastVaccines.map(v => v.schedule_id);

    const groupedPast = pastVaccines.reduce((acc, v) => {
      let label;
      if (v.recommended_age_weeks === 0) label = "At Birth";
      else if (v.recommended_age_weeks === 39) label = "9 Months";
      else if (v.recommended_age_weeks === 52) label = "12 Months";
      else label = `${v.recommended_age_weeks} Weeks`;

      if (!acc[label]) acc[label] = [];
      acc[label].push({ name: v.vaccine_name, date: v.date_administered });
      return acc;
    }, {});

    //  Fetch all vaccine schedules
    const [allSchedules] = await db.query(
      `SELECT schedule_id, vaccine_name, recommended_age_weeks, description
       FROM vaccination_schedule
       ORDER BY recommended_age_weeks ASC`
    );

    //  Group schedules by age label
    const groupedByAge = allSchedules.reduce((acc, s) => {
      let label;
      if (s.recommended_age_weeks === 0) label = "At Birth";
      else if (s.recommended_age_weeks === 39) label = "9 Months";
      else if (s.recommended_age_weeks === 52) label = "12 Months";
      else label = `${s.recommended_age_weeks} Weeks`;

      if (!acc[label]) acc[label] = [];
      acc[label].push(s);
      return acc;
    }, {});

    //  Normalize today once
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    //  Determine next upcoming vaccine group
    let nextGroup = null;
    for (const ageLabel in groupedByAge) {
      const vaccines = groupedByAge[ageLabel];
      const weeks = vaccines[0].recommended_age_weeks;

      const dueDate = addDaysLocal(dobDate, weeks * 7);

      const allGiven = vaccines.every(v => givenScheduleIds.includes(v.schedule_id));
      if (!allGiven && dueDate >= today) {
        nextGroup = vaccines.map(v => ({
          schedule_id: v.schedule_id,
          vaccine_name: v.vaccine_name,
          recommended_age_weeks: v.recommended_age_weeks,
          description: v.description,
          due_date: addDaysLocal(dobDate, v.recommended_age_weeks * 7)
        }));
        break;
      }
    }

    //  Calculate overdue vaccines
    const overdueVaccines = {};
    for (const ageLabel in groupedByAge) {
      const vaccines = groupedByAge[ageLabel];
      const weeks = vaccines[0].recommended_age_weeks;

      const dueDate = addDaysLocal(dobDate, weeks * 7);

      const allGiven = vaccines.every(v => givenScheduleIds.includes(v.schedule_id));

      if (!allGiven && dueDate < today) {
        overdueVaccines[ageLabel] = vaccines.map(v => ({
          schedule_id: v.schedule_id,
          vaccine_name: v.vaccine_name,
          recommended_age_weeks: v.recommended_age_weeks,
          due_date: addDaysLocal(dobDate, v.recommended_age_weeks * 7)
        }));
      }
    }

    const needsOverduePrompt = Object.keys(overdueVaccines).length > 0;

    //  At-Birth prompt calculation
    const ageInDays = Math.floor((today - dobDate) / (1000 * 60 * 60 * 24));
    const hasAtBirthVaccines = pastVaccines.some(v => v.recommended_age_weeks === 0);
    const needsAtBirthPrompt = ageInDays <= 2 && !hasAtBirthVaccines;

    //  Response
    res.json({
      infant: {
        id: infant.infant_id,
        name: infant.full_name,
        dob: infant.date_of_birth,
        caregiver_name: infant.caregiver_name
      },
      pastVaccines: groupedPast,
      upcomingVaccines: nextGroup,
      overdueVaccines,
      allSchedules: groupedByAge,
      needsAtBirthPrompt,
      needsOverduePrompt
    });

  } catch (err) {
    console.error("🔥 Error in searchInfant:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== RECORD VACCINE ======================
exports.recordVaccine = async (req, res) => {
  const { infantId, scheduleId, dateAdministered, status } = req.body;
  const doctorId = req.user?.id;

  if (!infantId || !scheduleId || !dateAdministered) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Helper: parse yyyy-mm-dd from frontend
  function parseDateLocal(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  // Helper: add days in local time
  function addDaysLocal(date, days) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  }

  try {
    const [checkInfant] = await db.query(
      `SELECT infant_id, date_of_birth FROM infants WHERE infant_id = ? AND doctor_id = ?`,
      [infantId, doctorId]
    );

    if (checkInfant.length === 0) {
      return res.status(403).json({ message: "Infant not assigned to you." });
    }
    const infantDOB = new Date(checkInfant[0].date_of_birth);
    infantDOB.setHours(0, 0, 0, 0); // normalize to midnight local time

    const [schedule] = await db.query(
      `SELECT vaccine_name, recommended_age_weeks FROM vaccination_schedule WHERE schedule_id = ?`,
      [scheduleId]
    );

    if (schedule.length === 0) {
      return res.status(404).json({ message: "Vaccine schedule not found." });
    }

    const vaccine = schedule[0];
    let recommendedDate;
    if(vaccine.recommended_age_weeks >= 52){
        recommendedDate = addDaysLocal(infantDOB, (vaccine.recommended_age_weeks * 7 + 1));
    } else if(vaccine.recommended_age_weeks < 52){
        recommendedDate = addDaysLocal(infantDOB, (vaccine.recommended_age_weeks * 7));
    }
    const administeredDate = parseDateLocal(dateAdministered);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (administeredDate > today) {
      return res.status(400).json({ message: "You cannot record a future date." });
    }

    if (administeredDate < recommendedDate && today < recommendedDate) {
      return res.status(400).json({
        message: `This vaccine’s recommended date (${recommendedDate.toLocaleDateString()}) has not yet reached.`,
        single: true
      });
    }

    // Check if record already exists
    const [existing] = await db.query(
      `SELECT id FROM administered_vaccines WHERE infant_id = ? AND schedule_id = ?`,
      [infantId, scheduleId]
    );

    if (existing.length > 0) {
      return res.status(200).json({ message: "Vaccine already recorded. No duplicates created." });
    }

    // Insert
    await db.query(
      `INSERT INTO administered_vaccines 
        (infant_id, doctor_id, schedule_id, date_administered, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [infantId, doctorId, scheduleId, dateAdministered, status || 'completed']
    );

    res.json({ message: "Vaccine recorded successfully." });

  } catch (err) {
    console.error("🔥 Error in recordVaccine:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== GET AT-BIRTH VACCINES ======================
exports.getAtBirthVaccines = async (req, res) => {
  try {
    const [vaccines] = await db.query(`
      SELECT schedule_id, vaccine_name, recommended_age_weeks 
      FROM vaccination_schedule 
      WHERE recommended_age_weeks = 0
    `);
    res.json(vaccines);
  } catch (err) {
    console.error("🔥 Error fetching At-Birth vaccines:", err);
    res.status(500).json({ message: "Server error" });
  }
};
