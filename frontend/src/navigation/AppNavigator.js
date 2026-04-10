import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAccessibility } from '../context/AccessibilityContext';
import DashboardScreen from '../screens/DashboardScreen';
import MedicineScreen from '../screens/MedicineScreen';
import GamesScreen from '../screens/GamesScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import SOSScreen from '../screens/SOSScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FaceLoginScreen from '../screens/FaceLoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => {
  const { theme, fontSize } = useAccessibility();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'home';
          else if (route.name === 'Medicine') iconName = 'medkit';
          else if (route.name === 'Games') iconName = 'game-controller';
          else if (route.name === 'Chatbot') iconName = 'chatbubbles';
          else if (route.name === 'SOS') iconName = 'alert-circle';
          else if (route.name === 'Settings') iconName = 'settings';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.secondary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.surface, height: 70, paddingBottom: 10 },
        tabBarLabelStyle: { fontSize: fontSize - 2 },
        headerStyle: { backgroundColor: theme.background, elevation: 0, shadowOpacity: 0 },
        headerTitleStyle: { color: theme.text, fontSize: fontSize + 4, fontWeight: 'bold' },
        headerTintColor: theme.text,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Medicine" component={MedicineScreen} />
      <Tab.Screen name="Games" component={GamesScreen} />
      <Tab.Screen name="Chatbot" component={ChatbotScreen} />
      <Tab.Screen name="SOS" component={SOSScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { theme } = useAccessibility();

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.log('Error checking token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.secondary} />
      </View>
    );
  }

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={isLoggedIn ? "Main" : "FaceLogin"}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="FaceLogin" component={FaceLoginScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
}