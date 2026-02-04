const { getCaregiverById, getDoctorById } = require('../../services/userService');
const { updateConsultation } = require('../../services/consultationService');
const cron = require("node-cron");
const db = require("../../models/db");
const sendEmail = require("../../utils/mailer");

exports.bookConsultation = async (req, res) => {
    const { caregiver_id, doctor_id, scheduled_date, rebookingId, reason } = req.body;

    if (!caregiver_id || !doctor_id || !scheduled_date) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const [result] = await db.execute(
            `INSERT INTO consultations (caregiver_id, doctor_id, scheduled_date,reason) VALUES (?, ?, ?,?)`,
            [caregiver_id, doctor_id, scheduled_date,reason]
        );
        const consultationId = result.insertId;

        if (rebookingId) {
          await updateConsultation(rebookingId, { rebooked: true });
        }


        const caregiver = await getCaregiverById(caregiver_id);
        const doctor = await getDoctorById(doctor_id);
        const caregiverName = caregiver.full_name;
        const doctorName = doctor.full_name;
        const doctorEmail = doctor.email;

        await sendEmail(doctorEmail, "consultationRequest", {
          caregiverName,
          scheduledDate: scheduled_date
        });

        res.status(201).json({
            success: true,
            message: "Consultation booked successfully. Waiting for doctor approval.",
            consultationId
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Database error" });
    }
};

exports.doctorManageConsultation = async (req, res) => {
    const consultationId = req.params.id;
  const doctorId = req.user.id;
  const { action, new_date } = req.body;

    try {
        const [rows] = await db.execute(
            `SELECT * FROM consultations WHERE id=?`,
            [consultationId]
        );
        const consultation = rows[0];
        if (!consultation) return res.status(404).json({ message: "Consultation not found" });
        if (consultation.doctor_id !== doctorId) return res.status(403).json({ message: "Not authorized" });


        const caregiver = await getCaregiverById(consultation.caregiver_id);
        const caregiverEmail = caregiver.email;
        const caregiverName = caregiver.full_name;

        let subject, message, meetingUrl, templateName, templateData;
        let isOverdue = false;

        if (action === 'approve') {
            meetingUrl = `https://meet.jit.si/InfantCare360_${consultationId}`;

            await updateConsultation(consultationId, { status: 'approved', meeting_url: meetingUrl });

            subject = "Telehealth Consultation Approved";
            message = `
              <p>Your consultation has been <strong>approved</strong> by the doctor.</p>
              <p>Scheduled Date & Time: ${consultation.scheduled_date}</p>
            `;
            templateName = 'consultationApproved';
            templateData = { scheduledDate: consultation.scheduled_date };

        } else if (action === 'reschedule') {
                if (!new_date) return res.status(400).json({ message: "New date required for reschedule" });

                const now = new Date();
                const oldScheduled = new Date(consultation.scheduled_date);

                isOverdue = oldScheduled < now && ['approved','rescheduled','pending_reschedule','pending'].includes(consultation.status);

                meetingUrl = `https://meet.jit.si/InfantCare360_${consultationId}`;

                await updateConsultation(consultationId, { scheduled_date: new_date, status: 'rescheduled', meeting_url: meetingUrl });

                subject = isOverdue ? 
                  "Overdue Telehealth Consultation Rescheduled" : 
                  "Telehealth Consultation Rescheduled";

                message = `
                  <p>Your consultation has been <strong>rescheduled</strong> by the doctor.</p>
                  <p>New Date & Time: ${new_date}</p>
                `;
                templateName = 'consultationRescheduled';
                templateData = { newDate: new_date, isOverdue };
            }
                else {
                  return res.status(400).json({ message: "Invalid action" });
        }

            if (templateName) {
              await sendEmail(caregiverEmail, templateName, templateData);
            } else {
              await sendEmail(caregiverEmail, 'consultationRequest', { caregiverName: caregiverName, scheduledDate: consultation.scheduled_date });
            }

       res.json({ success: true, message: `Consultation ${action} successfully`, meetingUrl });


    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Database error" });
    }
};

exports.doctorHeartbeat = async (req, res) => {
  const consultationId = req.params.id;
  const doctorId = req.user.id;

  try {
    const now = new Date();
    await updateConsultation(consultationId, { last_doctor_activity: now });
    res.json({ success: true });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update heartbeat" });
  }
};


exports.caregiverManageConsultation = async (req, res) => {
  const consultationId = req.params.id;
  const caregiverId = req.user.caregiver_id || req.user.id;
  const { full_name, action, new_date } = req.body;
  const caregiverName = full_name || req.user.full_name || "Caregiver";
  try {
    const [rows] = await db.execute(`SELECT * FROM consultations WHERE id=?`, [consultationId]);
    const consultation = rows[0];
    if (!consultation) return res.status(404).json({ message: "Consultation not found" });
    if (consultation.caregiver_id !== caregiverId)
      return res.status(403).json({ message: "Not authorized" });


    const doctor = await getDoctorById(consultation.doctor_id);
    const doctorName = doctor.full_name;
    const doctorEmail = doctor.email;

    let subject, message;

    if (action === 'cancel') {
        await updateConsultation(consultationId, { status: 'canceled', canceled_at: new Date() });

      await sendEmail(doctorEmail, 'consultationCanceled', { caregiverName, scheduledDate: consultation.scheduled_date });
      res.json({ success: true, message: "Consultation canceled successfully" });

    } else if (action === 'reschedule') {
      if (!new_date) return res.status(400).json({ message: "New date required for reschedule" });

      await updateConsultation(consultationId, { scheduled_date: new_date, status: 'pending_reschedule' });

      await sendEmail(doctorEmail, 'rescheduleRequest', { caregiverName, newDate: new_date });
      res.json({ success: true, message: "Reschedule request sent to doctor" });
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

exports.handleRescheduleRequest = async (req, res) => {
    const consultationId = req.params.id;
  const doctorId = req.user.id;
  const { action, new_date } = req.body;

    try {
        const [rows] = await db.execute(
            `SELECT * FROM consultations WHERE id=?`,
            [consultationId]
        );
        const consultation = rows[0];
        if (!consultation) return res.status(404).json({ message: "Consultation not found" });
        if (consultation.doctor_id !== doctorId) return res.status(403).json({ message: "Not authorized" });
        if (consultation.status !== 'pending_reschedule') return res.status(400).json({ message: "No pending reschedule request" });


        const caregiver = await getCaregiverById(consultation.caregiver_id);
        const caregiverEmail = caregiver.email;
        const caregiverName = caregiver.full_name;

      let subject, message, meetingUrl, templateName, templateData;

        if (action === 'approve') {
            meetingUrl = `https://meet.jit.si/InfantCare360_${consultationId}`;

            await updateConsultation(consultationId, { status: 'rescheduled', scheduled_date: consultation.scheduled_date, meeting_url: meetingUrl });

        subject = "Rescheduled Consultation Approved";
        message = `
          <p>Your reschedule request has been <strong>approved</strong> by the doctor.</p>
          <p>New Date & Time: ${consultation.scheduled_date}</p>
        `;
        templateName = 'consultationApproved';
        templateData = { scheduledDate: consultation.scheduled_date };

        } else if (action === 'propose') {
            if (!new_date) return res.status(400).json({ message: "New date required for propose action" });

            await updateConsultation(consultationId, { scheduled_date: new_date, status: 'rescheduled' });

        subject = "Doctor Proposed a New Date";
        message = `
          <p>The doctor has proposed a new date for your consultation:</p>
          <p>New Date & Time: ${new_date}</p>
          <p>Please review and respond in your dashboard.</p>
        `;
        templateName = 'doctorProposed';
        templateData = { newDate: new_date };
        } else {
            return res.status(400).json({ message: "Invalid action" });
        }

      if (templateName) {
        await sendEmail(caregiverEmail, templateName, templateData);
      } else {
        await sendEmail(caregiverEmail, 'consultationRequest', { caregiverName: caregiverName, scheduledDate: consultation.scheduled_date });
      }

        res.json({ success: true, message: `Reschedule ${action} action processed` });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Database error" });
    }
};

exports.getCaregiverConsultations = async (req, res) => {
    const caregiverId = req.params.id;

    try {
        const [consultations] = await db.execute(
            `SELECT c.id, c.scheduled_date, c.canceled_at, c.reason, c.status,c.rebooked,c.meeting_url,
                    d.full_name AS doctor_name
             FROM consultations c
             JOIN doctors d ON c.doctor_id = d.doctor_id
             WHERE c.caregiver_id = ?
             ORDER BY c.scheduled_date ASC`,
            [caregiverId]
        );

        const now = new Date();

        const upcoming = [];
        const past = [];
        const overdue = [];
        const canceled = [];
        const pending = [];

        consultations.forEach(c => {
            const scheduled = new Date(c.scheduled_date);
            const diffMinutes = Math.round((scheduled - now) / 60000);
            c.diffMinutes = diffMinutes;

                if (c.status === 'canceled') {
                    canceled.push({
                        ...c,
                        display_date: c.canceled_at || c.scheduled_date,
                        reason: c.reason,
                        rebooked: c.rebooked ? true : false
                    });
                }

            else if (
                (diffMinutes >= 0 || c.caregiver_joined) &&
                ['approved','rescheduled'].includes(c.status)
            ) {
                    upcoming.push(c);
             }  

            else if (diffMinutes >= 0 &&
                       ['pending','pending_reschedule'].includes(c.status)) {
                pending.push(c);
             }

            else if (diffMinutes < 0 &&
                       ['overdue'].includes(c.status)) {
                overdue.push(c);
            }
             else if (c.status === 'completed') {
                past.push(c);
            }
        });

        res.json({ upcoming,pending, past, overdue, canceled });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
};

exports.getDoctorConsultations = async (req, res) => {
    const doctorId = req.params.id;

    try {
        const [consultations] = await db.execute(
            `SELECT c.id, c.scheduled_date, c.canceled_at, c.reason, c.status,c.rebooked, c.meeting_url,
                    c.doctor_joined, c.caregiver_joined,
                    cg.full_name AS caregiver_name
             FROM consultations c
             JOIN caregivers cg ON c.caregiver_id = cg.caregiver_id
             WHERE c.doctor_id = ?
             ORDER BY c.scheduled_date ASC`,
            [doctorId]
        );

        const now = new Date();
        const upcoming = [];
        const past = [];
        const overdue = [];
        const canceled = [];

        consultations.forEach(c => {
            const scheduled = new Date(c.scheduled_date);
            const diffMinutes = Math.round((scheduled - now) / 60000);
            c.diffMinutes = diffMinutes;

            if (c.status === 'canceled' && c.rebooked === 0) {
                canceled.push({
                    ...c,
                    display_date: c.canceled_at || c.scheduled_date
                });
            } 
            // Upcoming: scheduled in the future or doctor still in meeting
            else if (
                (diffMinutes >= 0 || c.doctor_joined) &&
                ['approved','rescheduled','pending_reschedule','pending'].includes(c.status)
            ) {
                upcoming.push(c);
            } 
            // Overdue: scheduled in past AND doctor has not joined (inactive)
            else if (
                diffMinutes < 0 &&
                ['overdue','approved','rescheduled'].includes(c.status) &&
                !c.doctor_joined
            ) {
                overdue.push(c);
            } 
            else if (c.status === 'completed') {
                past.push(c);
            }
        });

        res.json({ upcoming, past, overdue, canceled });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
};

exports.joinConsultation = async (req, res) => {
  const consultationId = req.params.id;
  const userId = req.user.id || req.user.doctor_id || req.user.caregiver_id;
  const role = (req.user.role || (req.user.doctor_id ? 'doctor' : 'caregiver')).toLowerCase();

  const emailMeetingUrl = `${process.env.FRONTEND_BASE_URL}/Frontend/LoginPages/caregiverLogin.html?consultation=${consultationId}`;
  try {
    const [rows] = await db.execute(`SELECT * FROM consultations WHERE id=?`, [consultationId]);
    const consultation = rows[0];
    if (!consultation)
      return res.status(404).json({ message: "Consultation not found" });

    const meetingUrl = consultation.meeting_url;
    if (!meetingUrl)
      return res.status(400).json({ message: "Meeting URL not generated yet" });

    if (role === 'doctor') {
      const now = new Date();
      await updateConsultation(consultationId, { doctor_joined: true, last_doctor_activity: now });


      const caregiver = await getCaregiverById(consultation.caregiver_id);
      const caregiverEmail = caregiver.email;
      const caregiverName = caregiver.full_name;

      try {
        await sendEmail(caregiverEmail, 'doctorJoined', { caregiverName, emailMeetingUrl });
      } catch (emailErr) {
      }

      const [updated] = await db.execute(`SELECT * FROM consultations WHERE id=?`, [consultationId]);

      return res.json({
        success: true,
        message: "Doctor joined successfully. Caregiver notified.",
        meetingUrl,
        consultation: updated[0],
      });
    }


    if (role === 'caregiver') {
      const [updatedRows] = await db.execute(
        `SELECT * FROM consultations WHERE id=?`,
        [consultationId]
      );
      const updated = updatedRows[0];

      if (!updated.doctor_joined) {
        return res.status(403).json({
          success: false,
          message: "You can only join once the doctor has joined.",
          doctor_joined: updated.doctor_joined,
        });
      }

      const now = new Date();
      await updateConsultation(consultationId, { caregiver_joined: true, last_caregiver_activity: now });

      const [finalRows] = await db.execute(
        `SELECT * FROM consultations WHERE id=?`,
        [consultationId]
      );

      return res.json({
        success: true,
        message: "Caregiver joined consultation successfully.",
        meetingUrl,
        consultation: finalRows[0],
      });
    }

    res.status(400).json({ message: "Invalid role type" });

  } catch (err) {
    console.error("joinConsultation error:", err);
    res.status(500).json({ message: "Database error" });
  }
};


exports.leaveConsultation = async (req, res) => {
  const consultationId = req.params.id;

  if (!req.user) {
    console.error("❌ leaveConsultation: req.user is undefined");
    return res.status(401).json({ message: "Unauthorized: user data missing" });
  }

  const role = (
    req.user.role ||
    (req.user.doctor_id ? 'doctor' : req.user.caregiver_id ? 'caregiver' : null)
  )?.toLowerCase();

  if (!role) {
    return res.status(400).json({ message: "Invalid user role" });
  }

  try {
    if (role === 'doctor') {
      await updateConsultation(consultationId, { last_doctor_activity: new Date() });
    } else if (role === 'caregiver') {
      await updateConsultation(consultationId, { last_caregiver_activity: new Date() });
    } else {
      return res.status(400).json({ message: "Invalid role type" });
    }

    res.json({ success: true, message: `${role} left consultation` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error recording leave event" });
  }
};


exports.getAllDoctors = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT doctor_id, full_name FROM doctors WHERE account_status='active'`
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error while fetching doctors" });
  }
};

exports.getInfantsByCaregiver = async (req, res) => {
  const { caregiverId } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT infant_id, full_name, date_of_birth FROM infants WHERE caregiver_id = ?`,
      [caregiverId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "No infants found for this caregiver" });
    }

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error while fetching infants" });
  }
};


cron.schedule("*/10 * * * *", async () => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60*60*1000);
    const oneDayLater = new Date(now.getTime() + 24*60*60*1000);

    try {
        const [consultations] = await db.execute(
            `SELECT c.id, c.scheduled_date, c.meeting_url,
                    cg.full_name AS caregiver_name, cg.email AS caregiver_email,
                    d.full_name AS doctor_name, d.email AS doctor_email
             FROM consultations c
             JOIN caregivers cg ON c.caregiver_id = cg.caregiver_id
             JOIN doctors d ON c.doctor_id = d.doctor_id
             WHERE c.status IN ('approved', 'rescheduled')`
        );

        consultations.forEach(async c => {
            const scheduled = new Date(c.scheduled_date);
            const diffMinutes = (scheduled - now)/60000;

            if (diffMinutes <= 60 && diffMinutes > 50) {
              await sendEmail(c.caregiver_email, 'reminder', { meetingUrl: c.meeting_url, type: 'hour' });
              await sendEmail(c.doctor_email, 'reminder', { meetingUrl: c.meeting_url, type: 'hour' });
            } else if (diffMinutes <= 1440 && diffMinutes > 1430) {
              await sendEmail(c.caregiver_email, 'reminder', { meetingUrl: c.meeting_url, type: 'day' });
              await sendEmail(c.doctor_email, 'reminder', { meetingUrl: c.meeting_url, type: 'day' });
            }
        });

    } catch(err) {
        console.error(err);
    }
});

