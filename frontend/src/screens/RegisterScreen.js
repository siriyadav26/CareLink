import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { useAccessibility, COLORS, neu } from '../context/AccessibilityContext';
import { authAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const InputField = ({ icon, label, fontSize, ...props }) => (
  <View style={regStyles.fieldWrap}>
    <Text style={[regStyles.fieldLabel, { fontSize: fontSize - 3 }]}>{label}</Text>
    <View style={regStyles.inputRow}>
      <Ionicons name={icon} size={17} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
      <TextInput
        style={[regStyles.input, { fontSize, color: COLORS.textPrimary, flex: 1 }]}
        placeholderTextColor={COLORS.textSecondary}
        {...props}
      />
    </View>
  </View>
);

export default function RegisterScreen({ navigation }) {
  const { fontSize, titleSize } = useAccessibility();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('elderly');
  const [caretakerPhone, setCaretakerPhone] = useState('');
  const [caretakerEmail, setCaretakerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) { Alert.alert('Missing fields', 'Please fill all required fields'); return; }
    if (password !== confirmPassword) { Alert.alert('Mismatch', 'Passwords do not match'); return; }
    setLoading(true);
    try {
      const response = await authAPI.register({ name, email, password, role, caretakerPhone, caretakerEmail });
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      // Redirect to Face Setup instead of Dashboard
      const user = response.data.user;
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      if (user.role === 'caretaker') {
        navigation.replace('CaretakerMain');
      } else {
        navigation.replace('Main');
      }
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={regStyles.container}>
      <ScrollView contentContainerStyle={regStyles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={regStyles.hero}>
          <View style={regStyles.logoOuter}>
            <View style={regStyles.logoInner}>
              <Ionicons name="person-add" size={32} color={COLORS.orchid} />
            </View>
          </View>
          <Text style={[regStyles.title, { fontSize: titleSize + 2 }]}>Create Account</Text>
          <Text style={regStyles.sub}>Join CareLink AI today</Text>
        </View>

        {/* Form card */}
        <View style={regStyles.card}>
          <InputField icon="person-outline" label="Full Name" fontSize={fontSize}
            placeholder="Your full name" value={name} onChangeText={setName} />
          <InputField icon="mail-outline" label="Email Address" fontSize={fontSize}
            placeholder="you@example.com" value={email} onChangeText={setEmail}
            autoCapitalize="none" keyboardType="email-address" />

          {/* Password with toggle */}
          <View style={regStyles.fieldWrap}>
            <Text style={[regStyles.fieldLabel, { fontSize: fontSize - 3 }]}>Password</Text>
            <View style={regStyles.inputRow}>
              <Ionicons name="lock-closed-outline" size={17} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
              <TextInput
                style={[regStyles.input, { fontSize, color: COLORS.textPrimary, flex: 1 }]}
                placeholder="Create a password"
                placeholderTextColor={COLORS.textSecondary}
                value={password} onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={17} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <InputField icon="shield-checkmark-outline" label="Confirm Password" fontSize={fontSize}
            placeholder="Repeat your password" value={confirmPassword} onChangeText={setConfirmPassword}
            secureTextEntry />

          {/* Role selector */}
          <View style={regStyles.fieldWrap}>
            <Text style={[regStyles.fieldLabel, { fontSize: fontSize - 3 }]}>I am a</Text>
            <View style={regStyles.roleRow}>
              {[
                { id: 'elderly', label: 'Elderly User', icon: '🧓' },
                { id: 'caretaker', label: 'Caretaker', icon: '🩺' },
              ].map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[regStyles.roleChip, role === r.id && regStyles.roleChipActive]}
                  onPress={() => setRole(r.id)}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 20, marginBottom: 6 }}>{r.icon}</Text>
                  <Text style={[regStyles.roleText, {
                    fontSize: fontSize - 2,
                    color: role === r.id ? COLORS.highlight : COLORS.textSecondary,
                    fontWeight: role === r.id ? '700' : '500',
                  }]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {role === 'elderly' && (
            <View style={regStyles.optionalBlock}>
              <View style={regStyles.optionalHeader}>
                <Ionicons name="people-outline" size={15} color={COLORS.orchid} />
                <Text style={[regStyles.optionalLabel, { fontSize: fontSize - 3 }]}>Caretaker Details (optional)</Text>
              </View>
              <InputField icon="call-outline" label="Phone" fontSize={fontSize}
                placeholder="+1 (555) 000-0000" value={caretakerPhone} onChangeText={setCaretakerPhone}
                keyboardType="phone-pad" />
              <InputField icon="mail-outline" label="Email" fontSize={fontSize}
                placeholder="caretaker@example.com" value={caretakerEmail} onChangeText={setCaretakerEmail}
                keyboardType="email-address" autoCapitalize="none" />
            </View>
          )}

          <TouchableOpacity
            style={[regStyles.primaryBtn, loading && { opacity: 0.7 }]}
            onPress={handleRegister} disabled={loading} activeOpacity={0.85}
          >
            <Text style={[regStyles.primaryBtnText, { fontSize: fontSize + 1 }]}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Text>
            {!loading && <Ionicons name="arrow-forward" size={18} color={COLORS.highlight} />}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={regStyles.footerRow}>
          <Text style={[regStyles.footerText, { fontSize: fontSize - 1 }]}>Already have an account? </Text>
          <Text style={[regStyles.footerLink, { fontSize: fontSize - 1 }]}>Sign in →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const regStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 52, paddingBottom: 40 },

  hero: { alignItems: 'center', marginBottom: 32 },
  logoOuter: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 14, ...neu(9),
  },
  logoInner: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: COLORS.lilac, justifyContent: 'center', alignItems: 'center',
  },
  title: { fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5, marginBottom: 6 },
  sub: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },

  card: { backgroundColor: COLORS.surface, borderRadius: 28, padding: 28, marginBottom: 24, ...neu(8) },

  fieldWrap: { marginBottom: 18 },
  fieldLabel: { color: COLORS.textSecondary, fontWeight: '600', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.raised, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4, ...neu(4),
  },
  input: { paddingVertical: 13, fontWeight: '500' },

  roleRow: { flexDirection: 'row', gap: 12 },
  roleChip: {
    flex: 1, paddingVertical: 18, borderRadius: 18,
    backgroundColor: COLORS.raised, alignItems: 'center', ...neu(4),
  },
  roleChipActive: { backgroundColor: COLORS.iris },
  roleText: { textAlign: 'center' },

  optionalBlock: {
    backgroundColor: COLORS.raised, borderRadius: 18, padding: 16, marginBottom: 18, ...neu(3),
  },
  optionalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  optionalLabel: { color: COLORS.orchid, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  primaryBtn: {
    flexDirection: 'row', backgroundColor: COLORS.iris, borderRadius: 18,
    paddingVertical: 17, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', gap: 10, ...neu(6),
  },
  primaryBtnText: { color: COLORS.highlight, fontWeight: '700', letterSpacing: 0.3 },

  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: COLORS.textSecondary, fontWeight: '500' },
  footerLink: { color: COLORS.orchid, fontWeight: '700' },
});