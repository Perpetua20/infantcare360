const express = require("express");
const router = express.Router();
const caregiverController = require("../controllers/caregiverControllers/caregiverRegistrationController");
const caregiverDashboard  = require("../controllers/caregiverControllers/caregiverDashboardController");
const { caregiverLogin } = require("../controllers/loginControllers/caregiverLoginController");
const vaccinationController = require("../controllers/caregiverControllers/caregiverVaccinationSchedule");
const vaccinationHistory = require("../controllers/caregiverControllers/vaccinationHistory")
const telehealthController = require('../controllers/caregiverControllers/caregiverTelehealthController');
const educationController = require("../controllers/caregiverControllers/education");

const verifyToken = require('../middleware/verifyToken');

// ======================== DASHBOARDS ROUTES ========================

// Register caregiver (used after invitation)
router.post("/register", caregiverController.registerCaregiver);

// Caregiver login
router.post("/login", caregiverLogin);

// Dashboard (protected)
router.get("/dashboard", verifyToken, caregiverDashboard.getCaregiverDashboard);

// Infant Profile (protected)
router.get("/infant-profile", verifyToken, caregiverDashboard.getInfantProfile);


// ======================== VACCINATION ROUTES ========================

// Get vaccination schedule (auto-generated based on infant DOB)
router.get("/vaccination/schedule", verifyToken, vaccinationController.getVaccinationSchedule);
router.get("/vaccination/history", verifyToken, vaccinationHistory.getVaccinationHistory);

// ======================== TELEHEALTH ROUTES ========================
router.post('/telehealth/book', telehealthController.bookConsultation);
router.get('/telehealth/upcoming', telehealthController.getUpcomingConsultations);
router.get('/telehealth/past', telehealthController.getPastConsultations);
router.get('/telehealth/cancelled', telehealthController.getCancelledConsultations);

// ======================== EDUCATION ROUTES ========================
router.get('/topics', educationController.getTopics);
router.get('/topics/:topicId/subtopics', educationController.getSubtopics);
router.get('/lesson/:subtopicId', educationController.getLesson);

module.exports = router;
