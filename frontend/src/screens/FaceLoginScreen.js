import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAccessibility } from '../context/AccessibilityContext';
import { authAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function FaceLoginScreen({ route, navigation }) {
  const { theme, fontSize, titleSize, speak } = useAccessibility();
  const { mode } = route.params || {};
  
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [capturedUri, setCapturedUri] = useState(null);
  const [email] = useState(route.params?.email || '');
  const [isAutoScanning, setIsAutoScanning] = useState(false);
  const [samplesCount, setSamplesCount] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Align your face to begin');
  const cameraRef = useRef(null);
  const TOTAL_SAMPLES = 5;

  useEffect(() => {
    (async () => {
      // Request Camera
      if (!permission || !permission.granted) {
          await requestPermission();
      }
      
      const msg = mode === 'enroll' 
        ? 'Enrollment mode. Please look into the frame.' 
        : 'Face Scan active. Align your face.';
      speak(msg);
      setStatusMessage(msg);

      // Auto-Scan Timer for Login
      if (mode !== 'enroll') {
          setTimeout(() => {
              if (cameraRef.current && !loading && !capturedUri && failedAttempts < 3) {
                  setIsAutoScanning(true);
                  takePicture();
              }
          }, 2000);
      }
    })();
  }, [permission, failedAttempts]);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setLoading(true);
        setStatusMessage(mode === 'enroll' ? `Capturing sample ${samplesCount + 1}...` : 'Scanning Face...');
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.4,
          base64: true,
        });
        
        setCapturedUri(photo.uri);
        await processFace(photo.base64);
      } catch (err) {
        setLoading(false);
        setIsAutoScanning(false);
        console.error('Capture Error:', err);
        Alert.alert('Camera Error', 'Failed to capture photo. Please try manually.');
      }
    }
  };

  const processFace = async (base64) => {
    try {
      if (mode === 'enroll') {
        setStatusMessage('Saving Face Data...');
        await authAPI.enrollFace({ image: base64 });
        
        const nextCount = samplesCount + 1;
        setSamplesCount(nextCount);
        
        if (nextCount < TOTAL_SAMPLES) {
            speak(`Sample ${nextCount} captured. Please shift your head slightly.`);
            setCapturedUri(null);
            setLoading(false);
            // Auto take next after 1s
            setTimeout(() => takePicture(), 1500);
        } else {
            speak('Face enrollment complete!');
            Alert.alert('Success', 'Enrollment complete. You can now login using your face.', [
                { text: 'Finish', onPress: () => navigation.replace('Main') }
            ]);
        }
      } else {
        setStatusMessage('Recognizing...');
        const response = await authAPI.faceLogin({ image: base64 });
        
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        speak(`Welcome back, ${response.data.user.name}`);
        navigation.replace('Main');
      }
    } catch (error) {
      console.log('Face Error:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Face not recognized';
      
      if (mode !== 'enroll') {
          const newFailed = failedAttempts + 1;
          setFailedAttempts(newFailed);
          setStatusMessage(`Match Failed (${newFailed}/3)`);
          speak('Face not recognized. Please try again.');
          
          if (newFailed >= 3) {
              speak('Three failed attempts. You can now login with your email.');
          } else {
              setCapturedUri(null);
              setIsAutoScanning(false);
          }
      } else {
          Alert.alert('Enrollment Error', errorMsg);
          setCapturedUri(null);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!permission) return <View style={styles.center}><ActivityIndicator size="large" color={theme.secondary} /></View>;
  if (!permission.granted) return (
      <View style={styles.center}>
          <Text style={{color: theme.text, marginBottom: 20}}>Camera access is required for Face Login</Text>
          <TouchableOpacity onPress={requestPermission} style={[styles.captureButton, {backgroundColor: theme.secondary}]}>
              <Text style={{color: theme.background}}>Grant Permission</Text>
          </TouchableOpacity>
      </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text, fontSize: titleSize }]}>
          {mode === 'enroll' ? 'Enroll Face' : 'Secure Face Scan'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.cameraWrapper}>
        {capturedUri ? (
            <View style={styles.previewContainer}>
                <Image source={{ uri: capturedUri }} style={styles.preview} />
                <View style={styles.scanningOverlay}>
                    <ActivityIndicator size="large" color={theme.secondary} />
                    <Text style={[styles.scanningText, { color: theme.secondary }]}>Verifying Identity...</Text>
                </View>
            </View>
        ) : (
            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="front"
            />
        )}
        
        {!capturedUri && (
            <View style={styles.guideWrapper}>
                <View style={[
                    styles.faceGuide, 
                    { borderColor: isAutoScanning ? '#4CAF50' : theme.secondary }
                ]} />
                <Text style={[styles.guideText, { color: '#FFF' }]}>
                    {isAutoScanning ? 'Scanning...' : 'Align face in circle'}
                </Text>
            </View>
        )}
      </View>

      <View style={styles.footer}>
        {statusMessage && (
            <Text style={[styles.statusText, { color: theme.textSecondary }]}>
                {statusMessage}
            </Text>
        )}

        {failedAttempts >= 3 && mode !== 'enroll' && (
            <View style={{ width: '100%', alignItems: 'center' }}>
                <TouchableOpacity 
                    style={[styles.fallbackButton, { backgroundColor: theme.primary }]}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Ionicons name="mail" size={24} color="#FFF" style={{ marginRight: 10 }} />
                    <Text style={styles.fallbackText}>Login with Email</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => navigation.navigate('Register')}
                    style={styles.registerLink}
                >
                    <Text style={{ color: theme.secondary, fontSize: 16 }}>New user? Register here</Text>
                </TouchableOpacity>
            </View>
        )}

        {!capturedUri && failedAttempts < 3 && (
             <TouchableOpacity
             style={[
                 styles.captureButton, 
                 { backgroundColor: isAutoScanning ? '#4CAF50' : theme.secondary, marginTop: 10 }
             ]}
             onPress={takePicture}
             disabled={loading}
           >
                {loading ? <ActivityIndicator color={theme.background} /> : <Ionicons name="camera" size={32} color={theme.background} />}
           </TouchableOpacity>
        )}

        {mode === 'enroll' && !capturedUri && (
             <TouchableOpacity
             style={styles.skipButton}
             onPress={() => navigation.replace('Main')}
             disabled={loading}
           >
                <Text style={[styles.skipText, { color: theme.textSecondary }]}>Setup Later</Text>
           </TouchableOpacity>
        )}
        
        {isAutoScanning && !capturedUri && <Text style={{ color: '#4CAF50', marginTop: 15, fontWeight: 'bold' }}>⚡ Auto-Scanning Active</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: { fontWeight: 'bold' },
  cameraWrapper: {
    flex: 1,
    marginHorizontal: 30,
    borderRadius: 30,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  camera: { flex: 1 },
  previewContainer: { flex: 1 },
  preview: { flex: 1, opacity: 0.7 },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanningText: { marginTop: 15, fontWeight: 'bold', fontSize: 18 },
  guideWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    width: 260,
    height: 320,
    borderWidth: 4,
    borderRadius: 130,
    borderStyle: 'dashed',
  },
  guideText: {
    marginTop: 20,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  footer: {
    padding: 30,
    alignItems: 'center',
  },
  emailInput: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  fallbackButton: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  fallbackText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  registerLink: {
    padding: 10,
    marginTop: 5,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  skipButton: {
    marginTop: 20,
    padding: 10,
  },
  skipText: {
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
});