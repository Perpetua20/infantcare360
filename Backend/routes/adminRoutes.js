const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const adminCaregiverController = require('../controllers/adminControllers/adminCaregiverController');
const doctorController = require('../controllers/adminControllers/adminDoctorController');
const invitationsController = require('../controllers/adminControllers/adminCaregiverInvitationsController');
const dashboard = require('../controllers/adminControllers/dashboardController');

router.get('/dashboard', verifyToken, dashboard.getAdminDashboard);

router.post('/add', doctorController.addDoctor);
router.get('/all', doctorController.getAllDoctors);
router.get('/caregivers', adminCaregiverController.getAllCaregivers);
router.get('/caregiver/:id', adminCaregiverController.getCaregiverById);
router.put('/caregiver/:id', adminCaregiverController.updateCaregiver);
router.delete('/caregiver/:id', verifyToken, adminCaregiverController.deleteCaregiver);
router.get('/doctor/:id', doctorController.getDoctorById);
router.put('/doctor/:id', doctorController.updateDoctor);
router.delete('/doctor/:id', doctorController.deleteDoctor);

router.get('/dashboard', verifyToken, (req, res) => {
  res.json({
    message: `Welcome ${req.user.role}, ${req.user.email}`,
    user: req.user
  });
});
router.post('/invite-caregiver', adminCaregiverController.inviteCaregiver);

// ----- New Invitation Routes ----- //

// Fetch all caregiver invitations (with optional pagination and search)
router.get('/caregiver-invitations', verifyToken, invitationsController.getAllInvitations);

// Resend caregiver invitation
router.post('/caregiver-invite/resend', verifyToken, invitationsController.resendInvitation);

// Cancel caregiver invitation
router.put('/caregiver-invite/cancel/:inviteId', verifyToken, invitationsController.cancelInvitation);

router.get('/doctors', adminCaregiverController.getAllDoctors);

module.exports = router;
