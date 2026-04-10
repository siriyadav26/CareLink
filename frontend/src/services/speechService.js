import * as Speech from 'expo-speech';

export const speechService = {
  speak: (text, options = {}) => {
    Speech.speak(text, {
      pitch: 1.2,
      rate: 0.9,
      language: 'en-US',
      ...options,
    });
  },

  stop: () => {
    Speech.stop();
  },
};