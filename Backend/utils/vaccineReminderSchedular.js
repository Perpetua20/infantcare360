const cron = require("node-cron");
const sendEmail = require("./mailer");
const db = require("../models/db");
require("dotenv").config();

// Emails are sent via centralized mailer utility and templates

// 2️⃣ Helper: calculate recommended date (DOB + weeks)
function calculateRecommendedDate(dob, weeks) {
  const dobDate = new Date(dob);
  const recommendedDate = new Date(dobDate);
  recommendedDate.setDate(recommendedDate.getDate() + weeks * 7);
  return recommendedDate;
}

// 3️⃣ Start scheduler
function startVaccineReminderScheduler() {
  // Runs every day at 8 AM (for testing use "* * * * *")
  cron.schedule("0 8 * * *", async () => {
    try {
      const [rows] = await db.query(`
        SELECT 
          v.schedule_id,
          v.vaccine_name,
          v.recommended_age_weeks,
          i.infant_id,
          i.full_name AS infant_name,
          i.date_of_birth,
          i.facility,
          i.facility_contact,
          c.email AS caregiver_email,
          c.full_name AS caregiver_name
        FROM vaccination_schedule v
        JOIN infants i ON 1=1
        JOIN caregivers c ON i.caregiver_id = c.caregiver_id
        LEFT JOIN administered_vaccines av 
          ON av.schedule_id = v.schedule_id 
          AND av.infant_id = i.infant_id
        WHERE av.schedule_id IS NULL
      `);

      const today = new Date();
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const grouped = {};
      for (const v of rows) {
        const dueDate = calculateRecommendedDate(v.date_of_birth, v.recommended_age_weeks);
        const dueMidnight = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        const diffDays = Math.ceil((dueMidnight - todayMidnight) / (1000 * 60 * 60 * 24));
        if (diffDays === 2 || diffDays === 0) {
          const key = `${v.infant_id}_${v.recommended_age_weeks}_upcoming`;
          if (!grouped[key]) {
            grouped[key] = {
              caregiver_name: v.caregiver_name,
              caregiver_email: v.caregiver_email,
              infant_name: v.infant_name,
              week: v.recommended_age_weeks,
              dueDate,
              facility: v.facility,
              facility_contact: v.facility_contact,
              vaccines: [],
              status: "upcoming",
            };
          }
          grouped[key].vaccines.push(v.vaccine_name);
        }
        if ([-1, -3, -7].includes(diffDays)) {
          const key = `${v.infant_id}_${v.recommended_age_weeks}_overdue_${Math.abs(diffDays)}`;
          if (!grouped[key]) {
            grouped[key] = {
              caregiver_name: v.caregiver_name,
              caregiver_email: v.caregiver_email,
              infant_name: v.infant_name,
              week: v.recommended_age_weeks,
              dueDate,
              facility: v.facility,
              facility_contact: v.facility_contact,
              vaccines: [],
              status: "overdue",
              overdueDays: Math.abs(diffDays),
            };
          }
          grouped[key].vaccines.push(v.vaccine_name);
        }
      }
      for (const key in grouped) {
        const data = grouped[key];
        const {
          caregiver_name,
          caregiver_email,
          infant_name,
          week,
          dueDate,
          vaccines,
          facility,
          facility_contact,
          status,
          overdueDays,
        } = data;

        // ✉️ Determine email subject & message
        let subject, message;

        if (status === "overdue") {
          subject = `Overdue Vaccine Reminder (${overdueDays} day${overdueDays > 1 ? "s" : ""} late)`;
          message = `
                Dear ${caregiver_name},

                This is a reminder that ${infant_name}'s **Week ${week}** vaccines were due on ${dueDate.toDateString()}.

                The following vaccines are still pending:
                ${vaccines.map((v, i) => `  ${i + 1}. ${v}`).join("\n")}

                📍 Facility: ${facility || "Your registered clinic"}
                📞 Contact: ${facility_contact || "N/A"}

                Please visit your healthcare provider as soon as possible to complete the vaccination.

                Regards,  
                💙 InfantCare360 System
          `;
        } else {
          subject =
            new Date(dueDate).toDateString() === today.toDateString()
              ? "Vaccine Due Today!"
              : "Upcoming Vaccine Reminder (2 days left)";

          message = `
                Dear ${caregiver_name},

                This is a reminder that ${infant_name}'s **Week ${week}** vaccines are scheduled for ${dueDate.toDateString()}.

                The following vaccines are due:
                ${vaccines.map((v, i) => `  ${i + 1}. ${v}`).join("\n")}

                📍 Facility: ${facility || "Your registered clinic"}
                📞 Contact: ${facility_contact || "N/A"}

                Please visit your healthcare provider to ensure timely vaccination.

                Warm regards,  
                💙 InfantCare360 System
                        `;
        }
        await sendEmail(caregiver_email, 'vaccineReminder', {
          caregiverName: caregiver_name,
          infantName: infant_name,
          week,
          dueDate,
          vaccines,
          facility,
          facilityContact: facility_contact,
          status,
          overdueDays,
        });

        console.log(
          `📧 Reminder sent to ${caregiver_name} (${caregiver_email}) for ${infant_name} — ${status.toUpperCase()}`
        );
      }
    } catch (error) {
      console.error("❌ Error in vaccine reminder scheduler:", error);
    }
  });
}

module.exports = startVaccineReminderScheduler;
