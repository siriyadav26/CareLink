const User = require('../models/User');
const { sendSMS, makeVoiceCall } = require('../utils/smsService');
const { sendPushNotification } = require('../utils/pushService');
const { sendEmail } = require('../utils/emailService');

exports.triggerSOS = async (req, res) => {
  try {
    const { location } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const locationText = location ? ` Location: ${location.lat}, ${location.lng}` : ' Location not available';
    const alertMessage = `EMERGENCY SOS from ${user.name}. Please check on them immediately.${locationText}`;
    
    // Send SOS email to all emergency contacts
    if (user.emergencyEmails && user.emergencyEmails.length > 0) {
      const emailPromises = user.emergencyEmails.map(async (email) => {
        try {
          await sendEmail(email, `🆘 SOS ALERT: ${user.name}`, alertMessage);
          
          // If caretaker has an app account, send push notification
          const caretakerUser = await User.findOne({ email, role: 'caretaker' });
          if (caretakerUser) {
            await sendPushNotification(caretakerUser._id, 'SOS Alert', alertMessage);
          }
        } catch (err) {
          console.error(`Failed to send SOS to ${email}:`, err);
        }
      });
      
      await Promise.all(emailPromises);
    }
    
    res.json({ message: 'SOS alert sent successfully' });
  } catch (error) {
    console.error('SOS error:', error);
    res.status(500).json({ message: error.message });
  }
};