import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, 
  Vibration, Animated, Dimensions
} from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { medicineAPI } from '../services/api';
import { notificationService } from '../services/notificationService';
import { useAccessibility } from '../context/AccessibilityContext';

const { width } = Dimensions.get('window');

const COLORS = {
  bg: '#f0edf6',
  surface: '#ece8f3',
  orchid: '#9b72cf',
  iris: '#7c6bc4',
  textPrimary: '#3d2c6e',
  textSecondary: '#8b7ab8',
  highlight: '#ffffff',
  danger: '#ff8a80',
};

export default function MedicineAlarmScreen({ route, navigation }) {
  const { medicineId, name, dosage } = route.params || {};
  const displayDosage = dosage || "Standard Dosage";
  const { fontSize, titleSize } = useAccessibility();
  
  const [sound, setSound] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isComponentMounted = useRef(true);

  useEffect(() => {
    isComponentMounted.current = true;
    startAlarm();
    startPulse();

    return () => {
      isComponentMounted.current = false;
      stopAlarm();
    };
  }, []);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  };

  const startAlarm = async () => {
    // 1. Play health chime in a loop
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/1070/1070-preview.mp3' },
        { shouldPlay: true, isLooping: true, volume: 1.0 }
      );
      setSound(newSound);
    } catch (e) {
      console.log('Audio error:', e);
    }

    // 2. Start PERSISTENT repeating voice alert
    const speakInterval = setInterval(() => {
      if (!isComponentMounted.current) {
        clearInterval(speakInterval);
        return;
      }
      Speech.speak("It's time to take your medicine.", {
        rate: 0.9,
        pitch: 1.0,
      });
    }, 4000); // Repeat every 4 seconds for urgency

    // Initial speak
    Speech.speak("It's time to take your medicine.", { rate: 0.9 });

    // 3. Persistent Vibration
    Vibration.vibrate([1000, 500, 1000, 500], true);
  };

  const stopAlarm = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    Speech.stop();
    Vibration.cancel();
  };

  const handleTaken = async () => {
    try {
      if (medicineId) await medicineAPI.markTaken(medicineId);
      await stopAlarm();
      navigation.goBack();
    } catch (error) {
      await stopAlarm();
      navigation.goBack();
    }
  };

  const handleSnooze = async () => {
    try {
      if (medicineId) await notificationService.snoozeMedicineReminder(medicineId, name, dosage);
    } catch (e) {}
    await stopAlarm();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]} />
      
      <View style={styles.content}>
        <Ionicons name="notifications" size={80} color={COLORS.orchid} style={styles.mainIcon} />

        <Text style={[styles.title, { fontSize: titleSize + 10 }]}>ALARM: {name}</Text>
        <Text style={[styles.medInfo, { fontSize: fontSize + 4 }]}>{dosage}</Text>
        
        <Text style={[styles.instruction, { fontSize: fontSize + 2 }]}>
          It's time to take your medicine!
        </Text>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.dismissBtn} onPress={handleTaken}>
            <Ionicons name="checkmark-circle" size={32} color="white" />
            <Text style={styles.btnLabel}>I've Taken It</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.snoozeBtn} onPress={handleSnooze}>
            <Ionicons name="alarm-outline" size={32} color={COLORS.textPrimary} />
            <Text style={styles.snoozeLabel}>Snooze (5m)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  pulseCircle: {
    position: 'absolute', width: width * 1.2, height: width * 1.2, borderRadius: width * 0.6,
    backgroundColor: COLORS.orchid, opacity: 0.3,
  },
  content: { padding: 20, alignItems: 'center', width: '100%', zIndex: 10 },
  mainIcon: { marginBottom: 20 },
  title: { fontWeight: '900', color: 'white', textAlign: 'center', marginBottom: 10 },
  medInfo: { fontWeight: '700', color: COLORS.orchid, marginBottom: 30 },
  instruction: { color: COLORS.highlight, textAlign: 'center', marginBottom: 50, fontWeight: '600' },
  btnRow: { width: '100%', gap: 20 },
  dismissBtn: {
    backgroundColor: COLORS.iris, paddingVertical: 25, borderRadius: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 15, elevation: 5,
  },
  btnLabel: { color: 'white', fontSize: 22, fontWeight: '800' },
  snoozeBtn: {
    backgroundColor: COLORS.surface, paddingVertical: 20, borderRadius: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  snoozeLabel: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' },
});
