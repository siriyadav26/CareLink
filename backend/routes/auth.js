const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

console.log("AUTH CONTROLLER:", authController); // keep for debug

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/login-email', authController.login); // Fallback alias
router.post('/face-login', authController.faceLogin);
router.post('/enroll-face', authenticate, authController.enrollFace);
router.post('/forgot-password', authController.forgotPassword);
router.post('/push-token', authenticate, authController.savePushToken);
router.put('/profile', authenticate, authController.updateProfile);

module.exports = router;