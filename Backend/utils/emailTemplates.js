const templates = {
    consultationRequest: ({ caregiverName, scheduledDate }) => ({
        subject: "New Telehealth Consultation Request",
        html: `<p>${caregiverName} has requested a telehealth consultation.</p>
               <p>Scheduled Date & Time: ${scheduledDate}</p>
               <p>Please review and approve in your dashboard.</p>`
    }),
    consultationApproved: ({ scheduledDate }) => ({
        subject: "Telehealth Consultation Approved",
        html: `<p>Your consultation has been <strong>approved</strong> by the doctor.</p>
               <p>Scheduled Date & Time: ${scheduledDate}</p>`
    }),
    consultationRescheduled: ({ newDate, isOverdue }) => ({
        subject: isOverdue ? "Overdue Telehealth Consultation Rescheduled" : "Telehealth Consultation Rescheduled",
        html: `<p>Your consultation has been <strong>rescheduled</strong> by the doctor.</p>
               <p>New Date & Time: ${newDate}</p>`
    }),
    consultationCanceled: ({ caregiverName, scheduledDate }) => ({
        subject: "Telehealth Consultation Canceled by Caregiver",
        html: `<p><strong>${caregiverName}</strong> has canceled the consultation.</p>
               <p>Scheduled Date & Time: ${scheduledDate}</p>`
    }),
    rescheduleRequest: ({ caregiverName, newDate }) => ({
        subject: "Reschedule Request from Caregiver",
        html: `<p><strong>${caregiverName}</strong> has requested to reschedule the consultation.</p>
               <p>Proposed New Date & Time: ${newDate}</p>
               <p>Please review and approve in your dashboard.</p>`
    }),
    doctorJoined: ({ caregiverName, emailMeetingUrl }) => ({
        subject: "Doctor Has Joined Your Consultation",
        html: `<p>Hi ${caregiverName},</p>
               <p>Your doctor has joined the consultation you scheduled.</p>
               <p>Please log in to your account to join the meeting:</p>
               <p><a href="${emailMeetingUrl}" target="_blank">Log in to Join Consultation</a></p>
               <br><p>Regards,<br>InfantCare360 Team</p>`
    }),
    doctorProposed: ({ newDate }) => ({
        subject: "Doctor Proposed a New Date",
        html: `<p>The doctor has proposed a new date for your consultation:</p>
               <p>New Date & Time: ${newDate}</p>
               <p>Please review and respond in your dashboard.</p>`
    }),
    reminder: ({ meetingUrl, type }) => ({
        subject: type === 'hour' ? "Consultation in 1 Hour" : "Consultation Tomorrow",
        html: `<p>Your consultation is ${type === 'hour' ? 'in 1 hour.' : 'scheduled for tomorrow.'}</p>
               <p>Join here: <a href="${meetingUrl}" target="_blank">Join Video Consultation</a></p>`
    }),
    vaccineReminder: ({ caregiverName, infantName, week, dueDate, vaccines, facility, facilityContact, status, overdueDays }) => {
        let subject;
        if (status === 'overdue') {
            subject = `Overdue Vaccine Reminder (${overdueDays} day${overdueDays > 1 ? 's' : ''} late)`;
        } else {
            subject = new Date(dueDate).toDateString() === new Date().toDateString() ? 'Vaccine Due Today!' : 'Upcoming Vaccine Reminder (2 days left)';
        }

        const vaccineList = vaccines.map((v, i) => `<li>${i + 1}. ${v}</li>`).join('');
        const html = `
            <p>Dear ${caregiverName},</p>
            <p>This is a reminder that <strong>${infantName}</strong>'s <strong>Week ${week}</strong> vaccines ${status === 'overdue' ? `were due on ${new Date(dueDate).toDateString()}` : `are scheduled for ${new Date(dueDate).toDateString()}`}.</p>
            <p>The following vaccines are ${status === 'overdue' ? 'still pending' : 'due'}:</p>
            <ul>${vaccineList}</ul>
            <p>Facility: ${facility || 'Your registered clinic'}<br>Contact: ${facilityContact || 'N/A'}</p>
            <p>Regards,<br/>InfantCare360 System</p>
        `;

        return { subject, html };
    },

    // ================= Invitation Templates =================
    invitationInitial: ({ caregiverName, registrationLink, inviteCode, expiryDate }) => ({
        subject: 'InfantCare360 | Caregiver Invitation',
        html: `
            <p>Hi <strong>${caregiverName}</strong>,</p>
            <p>You have been invited to join <b>InfantCare360</b> as a caregiver for your infant.</p>
            <p>Please click the link below to complete your registration:</p>
            <p><a href="${registrationLink}" target="_blank" style="color:#007bff;">Go to Registration Page</a></p>
            <p><b>Your Invitation Code:</b> ${inviteCode}</p>
            <p>This invitation will expire on <b>${expiryDate}</b>.</p>
            <br>
            <p>Warm regards,<br>InfantCare360 Team</p>
        `
    }),

    invitationResent: ({ caregiverName, registrationLink, newInviteCode, expiryDate }) => ({
        subject: 'InfantCare360 | Invitation Resent',
        html: `<p>Hi <strong>${caregiverName}</strong>,</p>
               <p>Your previous invitation has been resent. Please use the link below to complete your registration:</p>
               <p><a href="${registrationLink}" target="_blank" style="color:#007bff;">Go to Registration Page</a></p>
               <p><b>Your new Invitation Code:</b> ${newInviteCode}</p>
               <p>This invitation will expire on <b>${expiryDate}</b>.</p>`
    }),

    invitationCancelled: ({}) => ({
        subject: 'InfantCare360 | Invitation Cancelled',
        html: `<p>Hi,</p>
               <p>Your invitation to join <strong>InfantCare360</strong> has been <b>cancelled</b> by the administrator.</p>`
    })
};

module.exports = templates;
