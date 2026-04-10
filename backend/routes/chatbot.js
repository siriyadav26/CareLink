const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.post('/message', authenticate, chatbotController.sendMessage);
router.post('/voice-command', authenticate, chatbotController.handleVoiceCommand);

module.exports = router;