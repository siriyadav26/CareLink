import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import { authAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const { theme, fontSize, titleSize, speak } = useAccessibility();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text, fontSize: titleSize + 8 }]}>
          CareLink AI
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary, fontSize }]}>
          Welcome back!
        </Text>

        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, fontSize }]}
          placeholder="Email"
          placeholderTextColor={theme.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          accessibilityLabel="Email input field"
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, fontSize }]}
          placeholder="Password"
          placeholderTextColor={theme.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          accessibilityLabel="Password input field"
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.secondary }]}
          onPress={handleLogin}
          disabled={loading}
          accessibilityLabel="Login button"
          onPressIn={() => speak('Login button')}
        >
          <Text style={[styles.buttonText, { fontSize: fontSize + 2, color: theme.background }]}>
            {loading ? 'Loading...' : 'Login'}
          </Text>
        </TouchableOpacity>

        {/* 
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('FaceLogin', { email });
          }}
          style={styles.linkButton}
          accessibilityLabel="Use face recognition login"
        >
          <Text style={[styles.linkText, { color: theme.secondary, fontSize }]}>
            Login with Face Recognition
          </Text>
        </TouchableOpacity>
        */}

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={styles.linkButton}
          accessibilityLabel="Create new account"
        >
          <Text style={[styles.linkText, { color: theme.secondary, fontSize }]}>
            Don't have an account? Register
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Alert.alert('Reset Password', 'Enter your email to reset password')}
          accessibilityLabel="Forgot password"
        >
          <Text style={[styles.forgotText, { color: theme.textSecondary, fontSize: fontSize - 2 }]}>
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  title: { textAlign: 'center', fontWeight: 'bold', marginBottom: 10 },
  subtitle: { textAlign: 'center', marginBottom: 40 },
  input: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { fontWeight: 'bold' },
  linkButton: { marginTop: 20, alignItems: 'center' },
  linkText: { textDecorationLine: 'underline' },
  forgotText: { marginTop: 20, textAlign: 'center' },
});