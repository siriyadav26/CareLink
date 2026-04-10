import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAccessibility, COLORS, neu } from '../context/AccessibilityContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen({ navigation }) {
  const {
    soundEnabled, setSoundEnabled,
    largeText, setLargeText, bigCursor, setBigCursor,
    fontSize, headingSize, speak, registerElement,
  } = useAccessibility();

  const performSignOut = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
    speak('You have been signed out');
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to sign out?');
      if (confirmed) {
        performSignOut();
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: performSignOut },
      ]);
    }
  };

  const accessibilitySettings = [
    {
      id: 'sound', icon: 'volume-high-outline', iconBg: '#e8eaf6',
      label: 'Voice Feedback', desc: 'Read aloud when touching elements',
      value: soundEnabled, onToggle: setSoundEnabled,
    },
    {
      id: 'text', icon: 'text-outline', iconBg: '#f3e5f5',
      label: 'Large Text', desc: 'Increase font size for better readability',
      value: largeText, onToggle: setLargeText,
    },
    {
      id: 'cursor', icon: 'hand-left-outline', iconBg: '#e8f5e9',
      label: 'Big Cursor', desc: 'Show large cursor for easier tracking',
      value: bigCursor, onToggle: setBigCursor,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Page header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageEyebrow}>Preferences</Text>
        <Text style={[styles.pageTitle, { fontSize: headingSize + 4 }]}>Settings</Text>
      </View>

      {/* Accessibility section */}
      <View style={styles.sectionLabel}>
        <Ionicons name="accessibility-outline" size={15} color={COLORS.orchid} />
        <Text style={[styles.sectionText, { fontSize: fontSize - 2 }]}>Accessibility</Text>
      </View>

      <View style={styles.settingsCard}>
        {accessibilitySettings.map((item, index) => (
          <View 
            key={item.id}
            onLayout={(e) => {
              e.target.measureInWindow((x, y, width, height) => {
                if (width > 0) registerElement(`setting-${item.id}`, { x, y, width, height }, item.label);
              });
            }}
          >
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={18} color={COLORS.orchid} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { fontSize }]}>{item.label}</Text>
                <Text style={[styles.settingDesc, { fontSize: fontSize - 3 }]}>{item.desc}</Text>
              </View>
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{ false: COLORS.lilac, true: COLORS.orchid }}
                thumbColor={COLORS.highlight}
                ios_backgroundColor={COLORS.lilac}
              />
            </View>
            {index < accessibilitySettings.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>

      {/* Security section */}
      <View style={styles.sectionLabel}>
        <Ionicons name="shield-outline" size={15} color={COLORS.orchid} />
        <Text style={[styles.sectionText, { fontSize: fontSize - 2 }]}>Security</Text>
      </View>

      <View style={styles.settingsCard}>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => navigation.navigate('FaceLogin', { mode: 'enroll' })}
          activeOpacity={0.8}
        >
          <View style={[styles.settingIcon, { backgroundColor: '#e8eaf6' }]}>
            <Ionicons name="scan-outline" size={18} color={COLORS.iris} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { fontSize }]}>Face Recognition</Text>
            <Text style={[styles.settingDesc, { fontSize: fontSize - 3 }]}>Use your face to sign in securely</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* About section */}
      <View style={styles.sectionLabel}>
        <Ionicons name="information-circle-outline" size={15} color={COLORS.orchid} />
        <Text style={[styles.sectionText, { fontSize: fontSize - 2 }]}>About</Text>
      </View>

      <View style={styles.settingsCard}>
        {[
          { label: 'Version', value: '1.0.0', icon: 'code-slash-outline' },
          { label: 'Terms of Service', value: '', icon: 'document-text-outline', arrow: true },
          { label: 'Privacy Policy', value: '', icon: 'lock-closed-outline', arrow: true },
        ].map((item, i) => (
          <View key={item.label}>
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: '#f3e5f5' }]}>
                <Ionicons name={item.icon} size={17} color={COLORS.lavender} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { fontSize }]}>{item.label}</Text>
              </View>
              {item.value ? (
                <Text style={[{ fontSize: fontSize - 2, color: COLORS.textSecondary, fontWeight: '600' }]}>{item.value}</Text>
              ) : (
                <Ionicons name="chevron-forward" size={17} color={COLORS.textSecondary} />
              )}
            </View>
            {i < 2 && <View style={styles.divider} />}
          </View>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
        <Text style={[styles.logoutText, { fontSize: fontSize + 1 }]}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.footerNote}>CareLink AI · Made with 💜 for better care</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 24, paddingBottom: 56 },

  pageHeader: { marginBottom: 28, marginTop: 8 },
  pageEyebrow: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 },
  pageTitle: { fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },

  sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 8, paddingLeft: 4 },
  sectionText: { color: COLORS.orchid, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },

  settingsCard: { backgroundColor: COLORS.surface, borderRadius: 24, marginBottom: 20, overflow: 'hidden', ...neu(6) },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 18, gap: 14 },
  settingIcon: {
    width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', ...neu(3),
  },
  settingInfo: { flex: 1 },
  settingLabel: { fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
  settingDesc: { color: COLORS.textSecondary, fontWeight: '500', lineHeight: 18 },
  divider: { height: 1, backgroundColor: COLORS.lilac, marginLeft: 74 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: COLORS.surface, borderRadius: 20, paddingVertical: 18, marginTop: 8, marginBottom: 24,
    borderWidth: 1.5, borderColor: '#f8bbd0', ...neu(5),
  },
  logoutText: { color: COLORS.danger, fontWeight: '700' },

  footerNote: { textAlign: 'center', fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
});