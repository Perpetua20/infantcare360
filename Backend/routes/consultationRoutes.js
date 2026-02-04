// routes/consultationsRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const consultationsController = require('../controllers/consultations/consultationController');


router.post("/book", consultationsController.bookConsultation);

router.post("/doctor/manage/:id",verifyToken, consultationsController.doctorManageConsultation);

router.post("/caregiver/manage/:id",verifyToken, consultationsController.caregiverManageConsultation);

router.post("/reschedule/handle/:id",verifyToken, consultationsController.handleRescheduleRequest);

router.get("/caregiver/:id", consultationsController.getCaregiverConsultations);

router.get("/doctor/:id", consultationsController.getDoctorConsultations);

router.post("/join/:id", verifyToken, consultationsController.joinConsultation);

router.get("/doctors", consultationsController.getAllDoctors);

router.get("/infants/:caregiverId", consultationsController.getInfantsByCaregiver);

router.post("/:id/leave", verifyToken, consultationsController.leaveConsultation);

router.post('/:id/heartbeat', verifyToken, consultationsController.doctorHeartbeat);

module.exports = router;
 