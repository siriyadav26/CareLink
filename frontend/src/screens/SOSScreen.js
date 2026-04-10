import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Vibration,
  Platform,
  TextInput,
  ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAccessibility } from '../context/AccessibilityContext';
import { sosAPI, authAPI } from '../services/api';
import { fallDetectionService } from '../services/fallDetectionService';
import { Ionicons } from '@expo/vector-icons';

export default function SOSScreen({ route, navigation }) {
  const { theme, fontSize, titleSize, speak } = useAccessibility();
  const [sending, setSending] = useState(false);
  const [sound, setSound] = useState(null);
  const [fallDetected, setFallDetected] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [timerId, setTimerId] = useState(null);
  const [emergencyEmails, setEmergencyEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    loadEmails();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (route.params?.autoTriggerFall) {
      console.log('Global Fall Detected - Auto Triggering Alert');
      triggerFallAlert();
      // Clear the param so it doesn't repeatedly trigger on screen focus
      navigation.setParams({ autoTriggerFall: false });
    }
  }, [route.params?.autoTriggerFall]);

  const loadEmails = async () => {
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      setEmergencyEmails(user.emergencyEmails || []);
    }
  };

  const saveEmails = async (emails) => {
    try {
      const response = await authAPI.updateProfile({ emergencyEmails: emails });
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      setEmergencyEmails(emails);
    } catch (error) {
      Alert.alert('Error', 'Failed to save emergency contacts');
    }
  };

  const addEmail = () => {
    if (!newEmail || !newEmail.includes('@')) {
      Alert.alert('Invalid', 'Please enter a valid email address');
      return;
    }
    if (emergencyEmails.includes(newEmail)) {
      Alert.alert('Duplicate', 'This email is already added');
      return;
    }
    const updated = [...emergencyEmails, newEmail];
    saveEmails(updated);
    setNewEmail('');
  };

  const removeEmail = (email) => {
    const updated = emergencyEmails.filter(e => e !== email);
    saveEmails(updated);
  };

  const playAlarm = async () => {
    try {
      // Use a public alarm URL to avoid local file requirement errors during hackathon
      const ALARM_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: ALARM_URL }
      ).catch(err => {
        console.warn('Alarm sound failed to load. Continuing without audio.');
        return { sound: null };
      });

      if (newSound) {
        setSound(newSound);
        await newSound.setIsLoopingAsync(true);
        await newSound.playAsync();
      }
    } catch (error) {
      console.log('Error playing alarm:', error);
    }
  };

  const triggerFallAlert = () => {
    if (fallDetected) return;
    setFallDetected(true);
    Vibration.vibrate([0, 500, 200, 500], true);
    playAlarm();
    Speech.speak("Attention! A fall has been detected. Sending emergency alerts in 15 seconds. Press cancel if you are okay.", {
      rate: 0.9,
      pitch: 1.0,
    });
    
    let time = 15;
    const id = setInterval(() => {
      time -= 1;
      setCountdown(time);
      if (time <= 0) {
        clearInterval(id);
        triggerSOS();
        setFallDetected(false);
      }
    }, 1000);
    setTimerId(id);
  };

  const cancelFallAlert = () => {
    if (timerId) clearInterval(timerId);
    setFallDetected(false);
    setCountdown(15);
    stopAlarm();
    Vibration.cancel();
    Speech.stop();
    speak("Emergency alert canceled.");
  };

  const stopAlarm = () => {
    if (sound) {
      sound.stopAsync();
      sound.unloadAsync();
      setSound(null);
    }
  };

  const triggerSOS = async () => {
    setSending(true);
    Vibration.vibrate([500, 500, 500]);
    playAlarm();
    setSosActive(true);

    let location = null;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        // Use getLastKnownPosition to prevent strict GPS lockup from blocking the email in buildings
        const loc = await Location.getLastKnownPositionAsync({});
        if (loc) {
          location = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        }
      }
    } catch (error) {
      console.log('Location error:', error);
    }

    try {
      await sosAPI.trigger(location);
      speak('Emergency alert sent to caretakers');
    } catch (error) {
      console.log('SOS Error', error);
      speak('Failed to send SOS');
      stopAlarm();
      setSosActive(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.background }} 
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.title, { color: theme.text, fontSize: titleSize }]}>
        Emergency SOS
      </Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary, fontSize }]}>
        Press and hold the button below to send an emergency alert to your caretakers
      </Text>

      <TouchableOpacity
        style={[styles.sosButton, { backgroundColor: theme.accent }]}
        onPress={() => {
          console.log('🆘 SOS Button Pressed');
          triggerSOS();
        }}
        activeOpacity={0.8}
        accessibilityLabel="Emergency SOS button"
      >
        <Ionicons name="alert-circle" size={80} color="#FFFFFF" />
        <Text style={[styles.sosText, { fontSize: fontSize + 10 }]}>SOS</Text>
      </TouchableOpacity>

      <Text style={[styles.info, { color: theme.textSecondary, fontSize: fontSize - 2 }]}>
        • Alarm will sound immediately{"\n"}
        • Email & App alerts sent to contacts{"\n"}
        • Your location will be shared (if enabled)
      </Text>

      <Text style={[styles.sectionTitle, { color: theme.text, fontSize: fontSize }]}>Emergency Contacts</Text>
      
      <View style={styles.addContactContainer}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, fontSize: fontSize - 2 }]}
          placeholder="email@example.com"
          placeholderTextColor={theme.textSecondary}
          value={newEmail}
          onChangeText={setNewEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.secondary }]} onPress={addEmail}>
          <Text style={[styles.addButtonText, { color: theme.background }]}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.emailList}>
        {emergencyEmails.map((email, index) => (
          <View key={index} style={[styles.contactInfo, { backgroundColor: theme.surface }]}>
            <Ionicons name="mail" size={20} color={theme.textSecondary} />
            <Text style={[styles.contactText, { color: theme.text, fontSize: fontSize - 2, flex: 1 }]}>
              {email}
            </Text>
            <TouchableOpacity onPress={() => removeEmail(email)}>
              <Ionicons name="close-circle" size={24} color={theme.accent} />
            </TouchableOpacity>
          </View>
        ))}
        {emergencyEmails.length === 0 && (
          <Text style={{color: theme.textSecondary, textAlign: 'center', marginTop: 10}}>No emergency contacts added yet.</Text>
        )}
      </ScrollView>

      {/* Secret Hackathon Demo Button to trigger Fall Detection on Web */}
      <TouchableOpacity 
        style={[styles.simulateButton, { backgroundColor: theme.background, borderColor: theme.accent }]}
        onPress={() => triggerFallAlert()}
      >
        <Ionicons name="body-outline" size={20} color={theme.accent} style={{marginRight: 8}} />
        <Text style={{ color: theme.accent, fontSize: fontSize, fontWeight: 'bold' }}>
          Simulate Fall (Test)
        </Text>
      </TouchableOpacity>

      {fallDetected && (
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: theme.surface }]}>
            <Ionicons name="warning" size={60} color={theme.accent} />
            <Text style={[styles.modalTitle, { color: theme.text, fontSize: titleSize }]}>
              Fall Detected!
            </Text>
            <Text style={[styles.modalText, { color: theme.text, fontSize: fontSize + 10 }]}>
              SOS in {countdown}s
            </Text>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: theme.secondary }]}
              onPress={cancelFallAlert}
            >
              <Text style={[styles.cancelText, { color: theme.background, fontSize }]}>
                I'm Okay (Cancel)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {sosActive && (
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: theme.surface }]}>
            <Ionicons name="alert-circle" size={60} color={theme.accent} />
            <Text style={[styles.modalTitle, { color: theme.text, fontSize: titleSize, textAlign: 'center' }]}>
              SOS Sent
            </Text>
            <Text style={[styles.modalText, { color: theme.text, fontSize: fontSize, textAlign: 'center', marginBottom: 30 }]}>
              Emergency alerts have been sent to your contacts. Are you OK?
            </Text>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: theme.secondary }]}
              onPress={() => {
                stopAlarm();
                Vibration.cancel();
                setSosActive(false);
              }}
            >
              <Text style={[styles.cancelText, { color: theme.background, fontSize }]}>
                Yes, I'm OK (Stop Alarm)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitle: { textAlign: 'center', marginBottom: 40 },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 5px rgba(0,0,0,0.3)',
      },
    }),
  },
  sosText: { color: '#FFFFFF', fontWeight: 'bold', marginTop: 10 },
  info: { textAlign: 'center', marginTop: 20 },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 10,
    borderRadius: 10,
  },
  contactText: { marginLeft: 8, fontWeight: '500' },
  setupButton: {
    marginTop: 10,
    padding: 10,
  },
  setupText: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
    alignSelf: 'stretch',
    textAlign: 'left'
  },
  addContactContainer: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
  },
  addButton: {
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  addButtonText: {
    fontWeight: 'bold',
  },
  emailList: {
    alignSelf: 'stretch',
    maxHeight: 150,
  },
  simulateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignSelf: 'stretch'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '85%',
  },
  modalTitle: { fontWeight: 'bold', marginTop: 15, marginBottom: 10 },
  modalText: { fontWeight: 'bold', marginBottom: 30 },
  cancelButton: { paddingHorizontal: 30, paddingVertical: 15, borderRadius: 12 },
  cancelText: { fontWeight: 'bold' },
});