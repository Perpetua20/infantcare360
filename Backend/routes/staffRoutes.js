const express = require('express');
const router = express.Router();
const { loginStaff } = require('../controllers/loginControllers/staffLoginController');

router.post('/login', loginStaff);

module.exports = router;