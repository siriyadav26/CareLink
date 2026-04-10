const cron = require('node-cron');
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const { sendPushNotification } = require('../utils/pushService');
const { sendSMS } = require('../utils/smsService');

async function checkMissedMedicines() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
  const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];

  const medicines = await Medicine.find({
    time: currentTime,
    days: currentDay,
    takenToday: false,
  }).populate('userId');

  for (const medicine of medicines) {
    // Safety check for populated user
    if (!medicine.userId) {
      console.warn(`⚠️ Skipping reminder for medicine ${medicine._id}: No user found.`);
      continue;
    }

    // Send reminder to elderly user
    await sendPushNotification(
      medicine.userId._id,
      'Medicine Reminder',
      `It's time to take ${medicine.name} (${medicine.dosage})`
    );

    // If medicine not taken within 30 minutes, alert caretaker
    setTimeout(async () => {
      const updatedMedicine = await Medicine.findById(medicine._id);
      if (!updatedMedicine.takenToday) {
        const user = await User.findById(medicine.userId._id);
        if (user && user.caretakerPhone) {
          await sendSMS(
            user.caretakerPhone,
            `ALERT: ${user.name} has not taken ${medicine.name} (${medicine.dosage}) at ${medicine.time}`
          );
        }
        await sendPushNotification(medicine.userId._id, 'Missed Medicine', `You missed ${medicine.name}. Please take it now.`);
      }
    }, 30 * 60 * 1000);
  }
}

exports.startMedicineReminderJob = () => {
  // Run every minute
  cron.schedule('* * * * *', () => {
    checkMissedMedicines().catch(console.error);
  });
  console.log('Medicine reminder job started');
};