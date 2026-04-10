import { Audio } from 'expo-av';
import axios from 'axios';
import { API_URL } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

let recording = null;

export const voiceCommandService = {
  startRecording: async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recording = newRecording;
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  },

  stopRecording: async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recording = null;
      return uri;
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  },

  processVoiceCommand: async (uri) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();
      formData.append('audio', {
        uri,
        type: 'audio/m4a',
        name: 'command.m4a',
      });

      const response = await axios.post(`${API_URL}/chatbot/voice-command`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      return response.data;
    } catch (err) {
      console.error('Failed to process voice command', err);
    }
  }
};
