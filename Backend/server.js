const express = require('express');
const cors = require('cors');
const path = require('path'); 
require('dotenv').config();
const startVaccineReminderScheduler = require("./utils/vaccineReminderSchedular");
const autoCompleteConsultations = require("./utils/autoCompleteConsultations");

startVaccineReminderScheduler();

const staffRoutes = require('./routes/staffRoutes');
const adminRoutes = require('./routes/adminRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const caregiverRoutes = require('./routes/caregiverRoutes');
const consultations = require('./routes/consultationRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../Frontend')));

app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/caregiver', caregiverRoutes);
app.use('/api/consultations', consultations);

app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/videos', express.static(path.join(__dirname, 'public/videos')));


app.get('/', (req, res) => {
  res.send('InfantCare360 Backend is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
});

autoCompleteConsultations();