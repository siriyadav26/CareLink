const express = require('express');
const router = express.Router();
const moodController = require('../controllers/moodController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.post('/', moodController.createMood);
router.get('/', moodController.getMoods);

module.exports = router;