import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export const notificationService = {
  // 🎯 [V17.1] IMMORTAL ALARM ENGINE
  
  registerForPushNotifications: async () => {
    if (!Device.isDevice) return;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    try {
      const tokenResponse = await Notifications.getExpoPushTokenAsync();
      const token = tokenResponse.data;
      await AsyncStorage.setItem('expoPushToken', token);
      await api.post('/auth/push-token', { token }).catch(() => {});
    } catch (error) {}

    if (Platform.OS !== 'web') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  },

  scheduleMedicineReminder: async (id, name, dosage, time) => {
    // 🎯 [V17.1] HARDENED CALENDAR TRIGGER
    try {
      await Notifications.cancelScheduledNotificationAsync(`medicine-${id}`).catch(() => {});

      if (!time || !time.includes(':')) {
        console.error(`❌ [V17.1] Invalid time format for ${name}: ${time}`);
        return;
      }

      const [hours, minutes] = time.split(':');
      const h = parseInt(hours);
      const m = parseInt(minutes);

      if (isNaN(h) || isNaN(m)) {
        console.error(`❌ [V17.1] Time parsing failed for ${name}: ${time}`);
        return;
      }

      console.log(`🎯 [V17.1] OS CALENDAR SYNC: ${name} at ${h}:${m}`);

      await Notifications.setNotificationCategoryAsync('medication', [
        { identifier: 'taken', buttonTitle: 'I\'ve Taken It', options: { isDestructive: false } },
        { identifier: 'snooze', buttonTitle: 'Snooze (5m)', options: { isDestructive: false } },
      ]);

      await Notifications.scheduleNotificationAsync({
        identifier: `medicine-${id}`,
        content: {
          title: 'MEDICATION ALARM',
          body: `It's time to take your medicine: ${name}`,
          data: { 
            type: 'medication_alarm', 
            medicineId: id, 
            name, 
            dosage,
            scheduledAt: Date.now() 
          },
          categoryIdentifier: 'medication',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          hour: h,
          minute: m,
          repeats: true, 
          channelId: 'default',
        },
      });
    } catch (e) {
      console.error('❌ [V17.1] Scheduling error:', e.message);
      throw e;
    }
  },

  snoozeMedicineReminder: async (id, name, dosage) => {
    console.log(`⏰ [V17.1] Snoozing ${name} for 5 minutes (Local Precision)`);
    await Notifications.scheduleNotificationAsync({
      identifier: `medicine-${id}-snooze`,
      content: {
        title: '⏰ SNOOZED ALARM',
        body: `Snoozed: Time to take your ${name}`,
        data: { 
          type: 'medication_alarm', 
          medicineId: id, 
          name, 
          dosage,
          scheduledAt: Date.now() 
        },
        categoryIdentifier: 'medication',
        sound: true,
      },
      trigger: {
        seconds: 300, 
        repeats: false,
        channelId: 'default',
      },
    });
  },

  wipeAllLocalAlarms: async () => {
    console.log('🧹 [V17.1] GLOBAL ALARM RESET: Wiping phone OS notification memory...');
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  cancelReminder: async (id) => {
    await Notifications.cancelScheduledNotificationAsync(`medicine-${id}`).catch(() => {});
    await Notifications.cancelScheduledNotificationAsync(`medicine-${id}-snooze`).catch(() => {});
  },

  notifyAdded: async (name) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Medicine Added',
        body: `${name} has been scheduled.`,
        sound: true,
        data: { type: 'medicine_confirmation' }, // NOT a medication_alarm type
      },
      trigger: null,
    });
  },

  notifyCustom: async (title, body) => {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true, data: { type: 'general_notification' } },
      trigger: null,
    });
  },
};