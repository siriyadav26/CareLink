import React, { useEffect, useState } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AccessibilityProvider } from './src/context/AccessibilityContext';
import AppNavigator from './src/navigation/AppNavigator';
import { notificationService } from './src/services/notificationService';
import { fallDetectionService } from './src/services/fallDetectionService';
import CustomCursor from './src/components/CustomCursor';

export const COLORS = {
  bg: '#f0edf6', surface: '#ece8f3', raised: '#f7f4fc',
  orchid: '#9b72cf', lavender: '#b39ddb', iris: '#7c6bc4',
  lilac: '#d1c4e9', textPrimary: '#3d2c6e', textSecondary: '#8b7ab8',
  shadow: '#c8c0dc', highlight: '#ffffff', danger: '#e57373', success: '#a8d8b9',
};

export const neu = (d = 6) => ({
  shadowColor: COLORS.shadow, shadowOffset: { width: d, height: d },
  shadowOpacity: 0.5, shadowRadius: d * 1.5, elevation: d,
});

export const navigationRef = createNavigationContainerRef();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Show banner always
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await Font.loadAsync({ ...Ionicons.font });
      } catch (e) {
        console.warn('Non-fatal: Font loading failed', e);
      } finally {
        setTimeout(() => setIsReady(true), 1000);
      }
    };
    init();

    fallDetectionService.subscribe(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('Main', { screen: 'SOS', params: { autoTriggerFall: true } });
      }
    });

    // 🎯 [V18] ALARM TRIGGER - Only navigate on user TAP (response), not on arrival
    // Navigating on 'received' caused alarm screen to open for every foreground notification
    const handleMedicationAlarm = (data) => {
      if (data?.type === 'medication_alarm' && data?.medicineId && data?.name && navigationRef.isReady()) {
        console.log(`🚀 [V18] USER TAPPED ALARM → Navigating for: ${data.name}`);
        navigationRef.navigate('MedicineAlarm', {
          medicineId: data.medicineId,
          name: data.name,
          dosage: data.dosage
        });
      }
    };

    // Only navigate when the user TAPS a notification (not when it arrives in foreground)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      handleMedicationAlarm(response.notification.request.content.data);
    });

    // When app is in foreground and a SCHEDULED medication alarm fires, navigate automatically
    const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data;
      // Only auto-navigate for real scheduled medication alarms (not instant confirmations)
      // Real alarms have a trigger (not trigger: null), identified by scheduledAt being set
      if (data?.type === 'medication_alarm' && data?.scheduledAt) {
        handleMedicationAlarm(data);
      }
    });

    return () => {
      fallDetectionService.unsubscribe();
      responseSubscription.remove();
      receivedSubscription.remove();
    };
  }, []);

  if (!isReady) {
    return (
      <View style={splashStyles.container}>
        <Ionicons name="medical-outline" size={60} color={COLORS.orchid} />
        <Text style={splashStyles.brandName}>CareLink AI</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AccessibilityProvider>
        <CustomCursor>
          <StatusBar style="dark" />
          <NavigationContainer ref={navigationRef}>
            <AppNavigator />
          </NavigationContainer>
        </CustomCursor>
      </AccessibilityProvider>
    </SafeAreaProvider>
  );
}

const splashStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
  brandName: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary, marginTop: 16 },
});