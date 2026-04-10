const { Expo } = require('expo-server-sdk');
const User = require('../models/User');

let expo = new Expo();

exports.sendPushNotification = async (userId, title, body, data = {}) => {
  const user = await User.findById(userId);
  if (!user || !user.expoPushToken) return;

  if (!Expo.isExpoPushToken(user.expoPushToken)) {
    console.error(`Invalid push token for user ${userId}`);
    return;
  }

  const messages = [{
    to: user.expoPushToken,
    sound: 'default',
    title,
    body,
    data,
  }];

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.error('Push notification error:', error);
    }
  }
};