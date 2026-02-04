const nodemailer = require("nodemailer");
require("dotenv").config();
const templates = require("./emailTemplates");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Send an email using a named template and data
 * @param {string} to - Recipient email
 * @param {string} templateName - Name of the template in emailTemplates.js
 * @param {object} data - Data for the template
 */
const sendEmail = async (to, templateName, data) => {
    try {
        if (!templates[templateName]) throw new Error(`Email template '${templateName}' not found.`);
        const { subject, html } = templates[templateName](data);
        await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
    } catch (err) {
        console.error("Error sending email:", err);
    }
};

module.exports = sendEmail;
