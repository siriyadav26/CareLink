import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAccessibility } from '../context/AccessibilityContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

export default function SettingsScreen({ navigation }) {
  const {
    soundEnabled,
    setSoundEnabled,
    highContrast,
    setHighContrast,
    largeText,
    setLargeText,
    bigCursor,
    setBigCursor,
    theme,
    fontSize,
    headingSize,
    speak,
  } = useAccessibility();


  useEffect(() => {
    // Empty effect since loadUser was removed
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    navigation.replace('Login');
    speak('You have been logged out');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.sectionTitle, { color: theme.text, fontSize: headingSize }]}>
        Accessibility Settings
      </Text>

      <View style={[styles.settingItem, { backgroundColor: theme.surface }]}>
        <View>
          <Text style={[styles.settingLabel, { color: theme.text, fontSize }]}>Sound Button</Text>
          <Text style={[styles.settingDesc, { color: theme.textSecondary, fontSize: fontSize - 2 }]}>
            Read aloud when touching elements
          </Text>
        </View>
        <Switch value={soundEnabled} onValueChange={setSoundEnabled} trackColor={{ false: '#767577', true: theme.secondary }} />
      </View>

      <View style={[styles.settingItem, { backgroundColor: theme.surface }]}>
        <View>
          <Text style={[styles.settingLabel, { color: theme.text, fontSize }]}>High Contrast Mode</Text>
          <Text style={[styles.settingDesc, { color: theme.textSecondary, fontSize: fontSize - 2 }]}>
            Dark blue and white theme for better visibility
          </Text>
        </View>
        <Switch value={highContrast} onValueChange={setHighContrast} />
      </View>

      <View style={[styles.settingItem, { backgroundColor: theme.surface }]}>
        <View>
          <Text style={[styles.settingLabel, { color: theme.text, fontSize }]}>Large Text</Text>
          <Text style={[styles.settingDesc, { color: theme.textSecondary, fontSize: fontSize - 2 }]}>
            Increase font size for better readability
          </Text>
        </View>
        <Switch value={largeText} onValueChange={setLargeText} />
      </View>

      <View style={[styles.settingItem, { backgroundColor: theme.surface }]}>
        <View>
          <Text style={[styles.settingLabel, { color: theme.text, fontSize }]}>Big Cursor (Web)</Text>
          <Text style={[styles.settingDesc, { color: theme.textSecondary, fontSize: fontSize - 2 }]}>
            Show large cursor for easier tracking
          </Text>
        </View>
        <Switch value={bigCursor} onValueChange={setBigCursor} />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text, fontSize: headingSize, marginTop: 20 }]}>
        Security
      </Text>

      <TouchableOpacity 
        style={[styles.settingItem, { backgroundColor: theme.surface }]}
        onPress={() => navigation.navigate('FaceLogin', { mode: 'enroll' })}
      >
        <View>
          <Text style={[styles.settingLabel, { color: theme.text, fontSize }]}>Enroll Face Recognition</Text>
          <Text style={[styles.settingDesc, { color: theme.textSecondary, fontSize: fontSize - 2 }]}>
            Use your face to log in securely
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
      </TouchableOpacity>


      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.accent }]} onPress={handleLogout}>
        <Text style={[styles.logoutText, { color: '#FFFFFF', fontSize: fontSize + 2 }]}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 20 },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingLabel: { fontWeight: '600', marginBottom: 4 },
  settingDesc: { marginTop: 2 },
  card: { padding: 16, borderRadius: 12, marginBottom: 12 },
  inputLabel: { fontWeight: 'bold', marginBottom: 5 },
  input: { borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#ddd' },
  saveButton: { marginTop: 15, padding: 12, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { fontWeight: 'bold' },
  logoutButton: { marginTop: 30, padding: 15, borderRadius: 12, alignItems: 'center' },
  logoutText: { fontWeight: 'bold' },
});