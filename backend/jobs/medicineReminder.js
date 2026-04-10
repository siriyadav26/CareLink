const cron = require('node-cron');
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const { sendPushNotification } = require('../utils/pushService');
const { sendEmail } = require('../utils/emailService');

async function checkMedicines() {
  try {
    const now = new Date();
    const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
    const currentH = now.getHours().toString().padStart(2, '0');
    const currentM = now.getMinutes().toString().padStart(2, '0');
    const currTimeStr = `${currentH}:${currentM}`;

    // 🎯 [V17] LOCAL TRUTH MODE: Alarms are now scheduled on the Phone.
    // The backend ONLY handles caretaker alerts for missed doses.
    
    // 1. Send Caretaker Alerts for Missed Doses (30 minutes late)
    const thirtyAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const lateTime = `${thirtyAgo.getHours().toString().padStart(2, '0')}:${thirtyAgo.getMinutes().toString().padStart(2, '0')}`;

    const missed = await Medicine.find({
      time: lateTime,
      days: currentDay,
      takenToday: false
    }).populate('userId');

    for (const med of missed) {
      if (med?.userId && med.userId.emergencyEmails?.length > 0) {
        console.log(`⚠️ Missed Dose: Alerting caregivers for ${med.name}`);
        const emailHtml = `<div><h2>⚠️ CareLink Alert: Missed Medicine</h2><p>${med.userId.name} missed their scheduled dose of ${med.name}.</p></div>`;
        for (const email of med.userId.emergencyEmails) {
          if (email) await sendEmail(email, `URGENT: Medication missed`, emailHtml).catch(() => {});
        }
      }
    }

    if (currTimeStr === '00:00') {
      await Medicine.updateMany({}, { takenToday: false, alertSentForToday: false });
    }

  } catch (err) {
    console.error('❌ [V17] CRON ERROR:', err);
  }
}

exports.startMedicineReminderJob = () => {
  cron.schedule('* * * * *', () => {
    checkMedicines().catch(e => console.error('❌ [V17] Execution Error:', e));
  });
  console.log('✅ [V17] Real Alarm Job Started (Caretaker Mode)');
};