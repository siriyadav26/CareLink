const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sosController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.post('/trigger', sosController.triggerSOS);

module.exports = router;