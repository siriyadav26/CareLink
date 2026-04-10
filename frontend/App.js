import React, { useEffect, useState } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AccessibilityProvider } from './src/context/AccessibilityContext';
import AppNavigator from './src/navigation/AppNavigator';
import { notificationService } from './src/services/notificationService';
import { fallDetectionService } from './src/services/fallDetectionService';

export const navigationRef = createNavigationContainerRef();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        console.log('App initialization started...');
        await notificationService.registerForPushNotifications();
        console.log('Push notifications registered.');
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setIsReady(true);
      }
    };
    init();

    // Global Fall Detection Subscription
    fallDetectionService.subscribe(() => {
      if (navigationRef.isReady()) {
        // Jump directly to SOS Screen across the entire app
        navigationRef.navigate('Main', { screen: 'SOS', params: { autoTriggerFall: true } });
      }
    });

    return () => {
      fallDetectionService.unsubscribe();
    };
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1929' }}>
        <ActivityIndicator size="large" color="#64B5F6" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AccessibilityProvider>
        <StatusBar style="light" />
        <NavigationContainer ref={navigationRef}>
          <AppNavigator />
        </NavigationContainer>
      </AccessibilityProvider>
    </SafeAreaProvider>
  );
}