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
  ScrollView,
} from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import { authAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen({ navigation }) {
  const { theme, fontSize, titleSize, speak } = useAccessibility();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('elderly');
  const [caretakerPhone, setCaretakerPhone] = useState('');
  const [caretakerEmail, setCaretakerEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.register({
        name,
        email,
        password,
        role,
        caretakerPhone,
        caretakerEmail,
      });
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      // Redirect to Face Setup instead of Dashboard
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text, fontSize: titleSize + 4 }]}>
          CareLink AI Registration
        </Text>

        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, fontSize }]}
          placeholder="Full Name"
          placeholderTextColor={theme.textSecondary}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, fontSize }]}
          placeholder="Email"
          placeholderTextColor={theme.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, fontSize }]}
          placeholder="Password"
          placeholderTextColor={theme.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, fontSize }]}
          placeholder="Confirm Password"
          placeholderTextColor={theme.textSecondary}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <View style={styles.roleContainer}>
          <Text style={[styles.roleLabel, { color: theme.text, fontSize }]}>I am a:</Text>
          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'elderly' && { backgroundColor: theme.secondary }]}
              onPress={() => setRole('elderly')}
            >
              <Text style={[styles.roleText, { color: role === 'elderly' ? theme.background : theme.text }]}>
                Elderly User
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'caretaker' && { backgroundColor: theme.secondary }]}
              onPress={() => setRole('caretaker')}
            >
              <Text style={[styles.roleText, { color: role === 'caretaker' ? theme.background : theme.text }]}>
                Caretaker
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {role === 'elderly' && (
          <>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, fontSize }]}
              placeholder="Caretaker Phone (optional)"
              placeholderTextColor={theme.textSecondary}
              value={caretakerPhone}
              onChangeText={setCaretakerPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, fontSize }]}
              placeholder="Caretaker Email (optional)"
              placeholderTextColor={theme.textSecondary}
              value={caretakerEmail}
              onChangeText={setCaretakerEmail}
              keyboardType="email-address"
            />
          </>
        )}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.secondary }]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { fontSize: fontSize + 2, color: theme.background }]}>
            {loading ? 'Registering...' : 'Register'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkButton}>
          <Text style={[styles.linkText, { color: theme.secondary, fontSize }]}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { textAlign: 'center', fontWeight: 'bold', marginBottom: 20 },
  input: { borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  roleContainer: { marginBottom: 15 },
  roleLabel: { marginBottom: 10 },
  roleButtons: { flexDirection: 'row', justifyContent: 'space-around' },
  roleButton: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', flex: 0.45, alignItems: 'center' },
  roleText: { fontWeight: '500' },
  button: { borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 10 },
  buttonText: { fontWeight: 'bold' },
  linkButton: { marginTop: 20, alignItems: 'center' },
  linkText: { textDecorationLine: 'underline' },
});