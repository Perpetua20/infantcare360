const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const infantsController = require('../controllers/doctorControllers/infantsController');
const docInfantsController = require('../controllers/doctorControllers/dashboardController');
const vaccineController = require('../controllers/doctorControllers/vaccinationManagement');
router.get('/verify', verifyToken, (req, res) => {
  if (req.user.role.toLowerCase() !== 'doctor') {
    return res.status(403).json({ message: 'Access denied. Doctor role required.' });
  }
  res.json({ message: 'Token valid', user: req.user });
});
router.get('/dashboard/:doctorId', verifyToken, docInfantsController.getDashboardStats);
router.get('/dashboard', verifyToken, (req, res) => {
  if (req.user.role.toLowerCase() !== 'doctor') {
    return res.status(403).json({ message: 'Access denied. Doctor role required.' });
  }
  res.json({ message: `Welcome Doctor, ${req.user.email}`, user: req.user });
});
router.get('/infants', verifyToken, infantsController.getInfants);
router.get('/searchInfant', verifyToken, vaccineController.searchInfant);
router.post('/recordVaccine', verifyToken, vaccineController.recordVaccine);
router.get('/getAtBirthVaccines', verifyToken ,vaccineController.getAtBirthVaccines);

// (Optional) Add error handler
router.use((err, req, res, next) => {
  console.error('🔥 Router error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = router;
