import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  Vibration, Platform, TextInput, ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAccessibility } from '../context/AccessibilityContext';
import { sosAPI, authAPI } from '../services/api';
import { fallDetectionService } from '../services/fallDetectionService';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  bg: '#f0edf6', surface: '#ece8f3', raised: '#f7f4fc',
  orchid: '#9b72cf', lavender: '#b39ddb', iris: '#7c6bc4',
  lilac: '#d1c4e9', textPrimary: '#3d2c6e', textSecondary: '#8b7ab8',
  shadow: '#c8c0dc', highlight: '#ffffff',
  danger: '#e57373', dangerBg: '#ffebee', dangerBorder: '#ef9a9a',
};
const neu = (d = 6) => ({
  shadowColor: COLORS.shadow, shadowOffset: { width: d, height: d },
  shadowOpacity: 0.5, shadowRadius: d * 1.5, elevation: d,
});

export default function SOSScreen({ route, navigation }) {
  const { fontSize, titleSize, speak } = useAccessibility();
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
    return () => { if (sound) sound.unloadAsync(); };
  }, []);

  useEffect(() => {
    if (route.params?.autoTriggerFall) {
      triggerFallAlert();
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
    } catch { Alert.alert('Error', 'Failed to save emergency contacts'); }
  };

  const addEmail = () => {
    if (!newEmail || !newEmail.includes('@')) { Alert.alert('Invalid', 'Please enter a valid email address'); return; }
    if (emergencyEmails.includes(newEmail)) { Alert.alert('Duplicate', 'This email is already added'); return; }
    saveEmails([...emergencyEmails, newEmail]);
    setNewEmail('');
  };

  const removeEmail = (email) => saveEmails(emergencyEmails.filter(e => e !== email));

  const playAlarm = async () => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' }
      ).catch(() => ({ sound: null }));
      if (newSound) { setSound(newSound); await newSound.setIsLoopingAsync(true); await newSound.playAsync(); }
    } catch (e) { console.log('Alarm error:', e); }
  };

  const stopAlarm = () => {
    if (sound) { sound.stopAsync(); sound.unloadAsync(); setSound(null); }
  };

  const triggerFallAlert = () => {
    if (fallDetected) return;
    setFallDetected(true);
    Vibration.vibrate([0, 500, 200, 500], true);
    playAlarm();
    Speech.speak("Attention! A fall has been detected. Sending emergency alerts in 15 seconds. Press cancel if you are okay.", { rate: 0.9 });
    let time = 15;
    const id = setInterval(() => {
      time -= 1; setCountdown(time);
      if (time <= 0) { clearInterval(id); triggerSOS(); setFallDetected(false); }
    }, 1000);
    setTimerId(id);
  };

  const cancelFallAlert = () => {
    if (timerId) clearInterval(timerId);
    setFallDetected(false); setCountdown(15);
    stopAlarm(); Vibration.cancel(); Speech.stop();
    speak('Emergency alert canceled.');
  };

  const triggerSOS = async () => {
    setSending(true); Vibration.vibrate([500, 500, 500]); playAlarm(); setSosActive(true);
    let location = null;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getLastKnownPositionAsync({});
        if (loc) location = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      }
    } catch (e) { console.log('Location error:', e); }
    try {
      await sosAPI.trigger(location);
      speak('Emergency alert sent to caretakers');
    } catch {
      speak('Failed to send SOS'); stopAlarm(); setSosActive(false);
    } finally { setSending(false); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageEyebrow}>Emergency</Text>
        <Text style={[styles.pageTitle, { fontSize: titleSize + 2 }]}>SOS Alert</Text>
        <Text style={styles.pageSub}>Tap the button below to send an immediate alert to your caretakers</Text>
      </View>

      {/* SOS Button */}
      <View style={styles.sosBtnWrap}>
        {/* Ripple rings */}
        <View style={styles.ring3} />
        <View style={styles.ring2} />
        <View style={styles.ring1} />
        <TouchableOpacity
          style={styles.sosBtn}
          onPress={triggerSOS}
          activeOpacity={0.85}
          accessibilityLabel="Emergency SOS button"
        >
          <Ionicons name="alert-circle" size={52} color={COLORS.highlight} />
          <Text style={[styles.sosBtnText, { fontSize: fontSize + 14 }]}>SOS</Text>
          <Text style={[styles.sosBtnSub, { fontSize: fontSize - 4 }]}>Hold to alert</Text>
        </TouchableOpacity>
      </View>

      {/* Info chips */}
      <View style={styles.infoRow}>
        {[
          { icon: 'volume-high-outline', text: 'Alarm sounds' },
          { icon: 'mail-outline', text: 'Alerts sent' },
          { icon: 'location-outline', text: 'Location shared' },
        ].map((item) => (
          <View key={item.text} style={styles.infoChip}>
            <Ionicons name={item.icon} size={15} color={COLORS.orchid} />
            <Text style={[styles.infoChipText, { fontSize: fontSize - 4 }]}>{item.text}</Text>
          </View>
        ))}
      </View>

      {/* Emergency contacts */}
      <View style={styles.sectionLabel}>
        <Ionicons name="people-outline" size={15} color={COLORS.orchid} />
        <Text style={[styles.sectionText, { fontSize: fontSize - 2 }]}>Emergency Contacts</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.addRow}>
          <View style={styles.addInputWrap}>
            <Ionicons name="mail-outline" size={15} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.addInput, { fontSize: fontSize - 1, color: COLORS.textPrimary, flex: 1 }]}
              placeholder="email@example.com"
              placeholderTextColor={COLORS.textSecondary}
              value={newEmail}
              onChangeText={setNewEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={addEmail} activeOpacity={0.85}>
            <Ionicons name="add" size={20} color={COLORS.highlight} />
          </TouchableOpacity>
        </View>

        {emergencyEmails.length === 0 ? (
          <Text style={[styles.emptyContacts, { fontSize: fontSize - 2 }]}>No contacts added yet</Text>
        ) : (
          emergencyEmails.map((email, index) => (
            <View key={index} style={[styles.contactRow, index === emergencyEmails.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.contactAvatar}>
                <Ionicons name="person-outline" size={15} color={COLORS.orchid} />
              </View>
              <Text style={[styles.contactEmail, { fontSize: fontSize - 2, flex: 1 }]} numberOfLines={1}>{email}</Text>
              <TouchableOpacity onPress={() => removeEmail(email)} style={styles.removeBtn}>
                <Ionicons name="close" size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Simulate button */}
      <TouchableOpacity style={styles.simulateBtn} onPress={triggerFallAlert} activeOpacity={0.8}>
        <Ionicons name="body-outline" size={18} color={COLORS.orchid} />
        <Text style={[styles.simulateBtnText, { fontSize: fontSize - 1 }]}>Simulate Fall Detection</Text>
        <View style={styles.simulateBadge}><Text style={styles.simulateBadgeText}>TEST</Text></View>
      </TouchableOpacity>

      {/* Fall detection modal */}
      {fallDetected && (
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="warning" size={40} color={COLORS.danger} />
            </View>
            <Text style={[styles.modalTitle, { fontSize: titleSize, color: COLORS.textPrimary }]}>Fall Detected!</Text>
            <Text style={[styles.modalSub, { fontSize: fontSize - 1 }]}>
              Sending SOS in
            </Text>
            <View style={styles.countdownCircle}>
              <Text style={[styles.countdownText, { fontSize: titleSize + 12 }]}>{countdown}</Text>
              <Text style={[{ fontSize: fontSize - 3, color: COLORS.textSecondary, fontWeight: '600' }]}>seconds</Text>
            </View>
            <TouchableOpacity style={styles.cancelBtn} onPress={cancelFallAlert} activeOpacity={0.85}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.highlight} />
              <Text style={[styles.cancelBtnText, { fontSize }]}>I'm Okay — Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* SOS sent modal */}
      {sosActive && (
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={[styles.modalIconWrap, { backgroundColor: COLORS.dangerBg }]}>
              <Ionicons name="alert-circle" size={40} color={COLORS.danger} />
            </View>
            <Text style={[styles.modalTitle, { fontSize: titleSize, color: COLORS.textPrimary }]}>SOS Sent</Text>
            <Text style={[styles.modalSub, { fontSize: fontSize - 1, textAlign: 'center', marginBottom: 24 }]}>
              Emergency alerts have been sent to all your contacts. Are you okay?
            </Text>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: COLORS.iris }]}
              onPress={() => { stopAlarm(); Vibration.cancel(); setSosActive(false); }}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle" size={20} color={COLORS.highlight} />
              <Text style={[styles.cancelBtnText, { fontSize }]}>Yes, I'm OK — Stop Alarm</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 24, paddingBottom: 56, alignItems: 'center' },

  pageHeader: { alignItems: 'center', marginBottom: 36, marginTop: 8 },
  pageEyebrow: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
  pageTitle: { fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5, marginBottom: 10 },
  pageSub: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, fontWeight: '500', maxWidth: 280 },

  sosBtnWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 28, width: 240, height: 240 },
  ring3: { position: 'absolute', width: 230, height: 230, borderRadius: 115, backgroundColor: COLORS.dangerBg, opacity: 0.5 },
  ring2: { position: 'absolute', width: 196, height: 196, borderRadius: 98, backgroundColor: COLORS.dangerBorder, opacity: 0.3 },
  ring1: { position: 'absolute', width: 168, height: 168, borderRadius: 84, backgroundColor: COLORS.danger, opacity: 0.15 },
  sosBtn: {
    width: 148, height: 148, borderRadius: 74,
    backgroundColor: COLORS.danger, justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.danger, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 16,
  },
  sosBtnText: { color: COLORS.highlight, fontWeight: '900', letterSpacing: 2, marginTop: 2 },
  sosBtnSub: { color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginTop: 2 },

  infoRow: { flexDirection: 'row', gap: 10, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' },
  infoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, ...neu(3),
  },
  infoChipText: { color: COLORS.textSecondary, fontWeight: '600' },

  sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, alignSelf: 'flex-start', paddingLeft: 4 },
  sectionText: { color: COLORS.orchid, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },

  card: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 20, width: '100%', marginBottom: 16, ...neu(6) },

  addRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  addInputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.raised, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4, ...neu(3),
  },
  addInput: { paddingVertical: 11, fontWeight: '500' },
  addBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.iris, justifyContent: 'center', alignItems: 'center', ...neu(4),
  },

  emptyContacts: { color: COLORS.textSecondary, textAlign: 'center', paddingVertical: 8, fontWeight: '500' },
  contactRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.lilac,
  },
  contactAvatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: COLORS.lilac, justifyContent: 'center', alignItems: 'center',
  },
  contactEmail: { color: COLORS.textPrimary, fontWeight: '600' },
  removeBtn: { padding: 4 },

  simulateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 20,
    width: '100%', borderWidth: 1.5, borderColor: COLORS.lilac, borderStyle: 'dashed', ...neu(4),
  },
  simulateBtnText: { flex: 1, color: COLORS.orchid, fontWeight: '700' },
  simulateBadge: { backgroundColor: COLORS.lilac, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  simulateBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.orchid, letterSpacing: 0.5 },

  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(61,44,110,0.45)', justifyContent: 'center', alignItems: 'center' },
  modal: {
    backgroundColor: COLORS.bg, borderRadius: 32, padding: 32, width: '88%', alignItems: 'center',
    shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.2, shadowRadius: 32, elevation: 24,
  },
  modalIconWrap: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.dangerBg,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20, ...neu(6),
  },
  modalTitle: { fontWeight: '800', letterSpacing: -0.5, marginBottom: 8 },
  modalSub: { color: COLORS.textSecondary, fontWeight: '500', lineHeight: 20 },
  countdownCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.surface,
    justifyContent: 'center', alignItems: 'center', marginVertical: 24, ...neu(8),
  },
  countdownText: { fontWeight: '900', color: COLORS.danger, letterSpacing: -2 },
  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.iris, borderRadius: 18, paddingVertical: 15, paddingHorizontal: 24, width: '100%', justifyContent: 'center', ...neu(5),
  },
  cancelBtnText: { color: COLORS.highlight, fontWeight: '700' },
});