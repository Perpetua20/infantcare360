function autoCompleteConsultations () {
const cron = require("node-cron");
const db = require("../models/db"); 

// Run every minute
cron.schedule("* * * * *", async () => {
  const now = new Date();
  
  console.log("🔥 CRON TICK: auto-complete function triggered!", now.toISOString());

  try {
    // Fetch consultations that are still active
    const [consultations] = await db.execute(`
      SELECT id, scheduled_date, status, doctor_joined, caregiver_joined, last_doctor_activity
      FROM consultations
      WHERE status IN ('approved', 'rescheduled','pending', 'pending_reschedule')
    `);
    for (const c of consultations) {
      const scheduledTime = new Date(c.scheduled_date);
      const diffMinutes = (now - scheduledTime) / 60000;
      const lastDoctorTime = c.last_doctor_activity ? new Date(c.last_doctor_activity) : null;

          // --- CASE 1: Doctor joined but left, grace time elapsed → Completed
          if (c.doctor_joined && lastDoctorTime) {
            const minutesSinceLastDoctorActivity = (now - lastDoctorTime) / 60000;

            if (minutesSinceLastDoctorActivity >= 2) { // only after 2 minutes
              await db.execute(`UPDATE consultations SET status='completed' WHERE id=?`, [c.id]);
              console.log(`✅ Consultation ${c.id} marked as COMPLETED (doctor left, grace period elapsed).`);
            } else {
              console.log(`⏳ Consultation ${c.id} still in grace period (${minutesSinceLastDoctorActivity.toFixed(1)} min)`);
            }
            continue;
          }

      // --- CASE 2: Doctor never joined and time passed → Overdue
      if (!c.doctor_joined && diffMinutes > 0) {
        await db.execute(`UPDATE consultations SET status='overdue' WHERE id=?`, [c.id]);
        console.log(`⚠️ Consultation ${c.id} marked as OVERDUE (doctor never joined).`);
        continue;
      }

      // --- CASE 3: Consultation upcoming or still active
      console.log(`⌛ Consultation ${c.id} still active or upcoming (diff=${diffMinutes.toFixed(2)} mins).`);
    }
  } catch (err) {
    console.error("❌ Error in auto-complete cron:", err);
  }
});
}

module.exports = autoCompleteConsultations;