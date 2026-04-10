const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.post('/score', gameController.saveScore);
router.get('/stats', gameController.getStats);

module.exports = router;