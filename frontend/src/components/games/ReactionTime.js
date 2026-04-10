import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Vibration } from 'react-native';
import { MindGames } from '../../utils/MindGames';

const { width, height } = Dimensions.get('window');

export default function ReactionTime({ onComplete, onBack, theme, fontSize, speak }) {
  const [status, setStatus] = useState('waiting'); // waiting, ready, clicked
  const [startTime, setStartTime] = useState(0);
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    speak("Starting Reaction Time. Wait for the screen to turn green and tap it as fast as you can.");
    startRound();
    return () => clearTimeout(timeoutId);
  }, []);

  const startRound = () => {
    setStatus('waiting');
    const delay = MindGames.getRandomDelay(2000, 5000);
    const id = setTimeout(() => {
      setStatus('ready');
      setStartTime(Date.now());
      Vibration.vibrate(100);
      speak("GO!");
    }, delay);
    setTimeoutId(id);
  };

  const handlePress = () => {
    if (status === 'waiting') {
      clearTimeout(timeoutId);
      speak("Too early! Wait for the visual signal.");
      startRound();
    } else if (status === 'ready') {
      const reactionTime = Date.now() - startTime;
      setStatus('clicked');
      onComplete(Math.max(10, 1000 - reactionTime));
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={{ color: theme.secondary, fontSize }}>← Back</Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePress}
        style={[styles.target, { backgroundColor: status === 'ready' ? theme.success || '#4CAF50' : theme.surface }]}
      >
        <Text style={[styles.text, { color: theme.text, fontSize: fontSize + 20 }]}>
          {status === 'waiting' ? 'Wait for Green...' : status === 'ready' ? 'TAP NOW!' : 'Great!'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  backButton: { marginBottom: 40 },
  target: { flex: 1, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  text: { fontWeight: 'bold', textAlign: 'center' },
});
