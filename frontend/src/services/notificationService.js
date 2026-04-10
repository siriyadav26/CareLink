import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export const notificationService = {
  registerForPushNotifications: async () => {
    if (!Device.isDevice) {
      console.log('Must use physical device for push notifications');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    await AsyncStorage.setItem('expoPushToken', token);

    // Send token to backend
    try {
      await api.post('/auth/push-token', { token });
    } catch (error) {
      console.log('Error saving push token:', error);
    }

    if (Platform.OS !== 'web') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  },

  scheduleMedicineReminder: async (id, title, body, time) => {
    const [hours, minutes] = time.split(':');
    const trigger = new Date();
    trigger.setHours(parseInt(hours), parseInt(minutes), 0);
    if (trigger < new Date()) {
      trigger.setDate(trigger.getDate() + 1);
    }
    await Notifications.scheduleNotificationAsync({
      identifier: `medicine-${id}`,
      content: { title, body, data: { medicineId: id } },
      trigger,
    });
  },

  cancelReminder: async (id) => {
    await Notifications.cancelScheduledNotificationAsync(`medicine-${id}`);
  },

  snoozeMedicineReminder: async (id, title, body) => {
    const trigger = new Date();
    trigger.setMinutes(trigger.getMinutes() + 10); // Snooze for 10 minutes
    await Notifications.scheduleNotificationAsync({
      identifier: `medicine-${id}-snooze`,
      content: { title: `Snoozed: ${title}`, body, data: { medicineId: id } },
      trigger,
    });
  },
};