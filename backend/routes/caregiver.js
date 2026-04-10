const express = require('express');
const router = express.Router();
const caregiverController = require('../controllers/caregiverController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes here require caretaker role
router.use(authenticate);
router.use(authorize('caretaker'));

router.get('/patients', caregiverController.getPatients);
router.get('/patients/:patientId/stats', caregiverController.getPatientStats);
router.post('/patients/send-note', caregiverController.sendPatientNote);

module.exports = router;
