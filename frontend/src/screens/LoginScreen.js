import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import { authAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  bg: '#f0edf6', surface: '#ece8f3', raised: '#f7f4fc',
  orchid: '#9b72cf', lavender: '#b39ddb', iris: '#7c6bc4',
  lilac: '#d1c4e9', textPrimary: '#3d2c6e', textSecondary: '#8b7ab8',
  shadow: '#c8c0dc', highlight: '#ffffff',
};
const neu = (d = 6) => ({
  shadowColor: COLORS.shadow, shadowOffset: { width: d, height: d },
  shadowOpacity: 0.5, shadowRadius: d * 1.5, elevation: d,
});

export default function LoginScreen({ navigation }) {
  const { fontSize, titleSize, speak } = useAccessibility();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Missing fields', 'Please fill in all fields'); return; }
    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Logo blob */}
        <View style={styles.logoWrap}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Ionicons name="heart" size={36} color={COLORS.orchid} />
            </View>
          </View>
          <Text style={[styles.appName, { fontSize: titleSize + 6 }]}>CareLink AI</Text>
          <Text style={styles.tagline}>Your companion for better living</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { fontSize: titleSize - 2 }]}>Welcome back</Text>
          <Text style={styles.cardSub}>Sign in to continue</Text>

          {/* Email */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { fontSize: fontSize - 3 }]}>Email address</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { fontSize, color: COLORS.textPrimary }]}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                accessibilityLabel="Email input field"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { fontSize: fontSize - 3 }]}>Password</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { fontSize, color: COLORS.textPrimary, flex: 1 }]}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                accessibilityLabel="Password input field"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => Alert.alert('Reset Password', 'Enter your email to receive a reset link')}
            style={styles.forgotWrap}
          >
            <Text style={[styles.forgot, { fontSize: fontSize - 3 }]}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Primary CTA */}
          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
            accessibilityLabel="Login button"
            onPressIn={() => speak('Login button')}
          >
            <Text style={[styles.primaryBtnText, { fontSize: fontSize + 1 }]}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Text>
            {!loading && <Ionicons name="arrow-forward" size={18} color={COLORS.highlight} />}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Face recognition */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('FaceLogin', { email })}
            activeOpacity={0.8}
            accessibilityLabel="Use face recognition login"
          >
            <Ionicons name="scan-outline" size={20} color={COLORS.orchid} />
            <Text style={[styles.secondaryBtnText, { fontSize }]}>Sign in with Face ID</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.footerRow}>
          <Text style={[styles.footerText, { fontSize: fontSize - 1 }]}>Don't have an account? </Text>
          <Text style={[styles.footerLink, { fontSize: fontSize - 1 }]}>Create one →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 60, paddingBottom: 40 },

  logoWrap: { alignItems: 'center', marginBottom: 36 },
  logoOuter: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: COLORS.surface,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16, ...neu(10),
  },
  logoInner: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: COLORS.lilac,
    justifyContent: 'center', alignItems: 'center',
  },
  appName: { fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5, marginBottom: 6 },
  tagline: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 28,
    marginBottom: 24,
    ...neu(8),
  },
  cardTitle: { fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4, letterSpacing: -0.3 },
  cardSub: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 28, fontWeight: '500' },

  fieldWrap: { marginBottom: 18 },
  fieldLabel: { color: COLORS.textSecondary, fontWeight: '600', marginBottom: 8, letterSpacing: 0.3, textTransform: 'uppercase' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.raised,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    ...neu(4),
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontWeight: '500' },

  forgotWrap: { alignSelf: 'flex-end', marginTop: -6, marginBottom: 24 },
  forgot: { color: COLORS.orchid, fontWeight: '600' },

  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.iris,
    borderRadius: 18,
    paddingVertical: 17,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...neu(6),
  },
  primaryBtnDisabled: { backgroundColor: COLORS.lavender, opacity: 0.7 },
  primaryBtnText: { color: COLORS.highlight, fontWeight: '700', letterSpacing: 0.3 },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 22, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.lilac },
  dividerText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },

  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.raised,
    borderRadius: 18,
    paddingVertical: 15,
    borderWidth: 1.5,
    borderColor: COLORS.lilac,
    ...neu(4),
  },
  secondaryBtnText: { color: COLORS.orchid, fontWeight: '700' },

  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: COLORS.textSecondary, fontWeight: '500' },
  footerLink: { color: COLORS.orchid, fontWeight: '700' },
});