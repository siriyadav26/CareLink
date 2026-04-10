import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Vibration } from 'react-native';
import { MindGames } from '../../utils/MindGames';

const { width, height } = Dimensions.get('window');

export function LargeIconTap({ onComplete, onBack, theme, fontSize }) {
  const [targetPos, setTargetPos] = useState({ x: 50, y: 150 });
  const [score, setScore] = useState(0);

  useEffect(() => {
    speak("Starting Large Icon Tap. Tap the target as it moves across the screen.");
  }, []);
  
  const moveTarget = () => {
    setScore(s => s + 20);
    if (score >= 80) onComplete(100);
    else {
      setTargetPos({
        x: Math.random() * (width - 150),
        y: Math.random() * (height - 300) + 100
      });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={{ color: theme.secondary, fontSize }}>← Back</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.largeTarget, { left: targetPos.x, top: targetPos.y, backgroundColor: theme.secondary }]}
        onPress={moveTarget}
      >
        <Text style={{ fontSize: fontSize + 40 }}>🎯</Text>
      </TouchableOpacity>
      <Text style={[styles.scoreText, { color: theme.textSecondary, fontSize }]}>Score: {score}/100</Text>
    </View>
  );
}

export function VisualRhythm({ onComplete, onBack, theme, fontSize }) {
  const scrollAnim = React.useRef(new Animated.Value(0)).current;
  const [score, setScore] = useState(0);

  useEffect(() => {
    speak("Starting Visual Rhythm. Tap the button when the icon passes the line.");
    setTimeout(() => speak("Ready? 3... 2... 1... Go!"), 2000);
    startAnimation();
  }, []);

  const startAnimation = () => {
    scrollAnim.setValue(0);
    Animated.timing(scrollAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true
    }).start(() => startAnimation());
  };

  const handleTap = () => {
    // Basic rhythm check: if the value is between 0.8 and 0.9 (near the target line)
    const val = scrollAnim.__getValue();
    if (val > 0.75 && val < 0.95) {
      setScore(s => s + 20);
      Vibration.vibrate(50);
      speak("Perfect!");
      if (score >= 80) onComplete(100);
    } else {
      speak("Missed. Try again!");
    }
  };

  const translateY = scrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height - 250]
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={{ color: theme.secondary, fontSize }}>← Back</Text>
      </TouchableOpacity>
      <View style={[styles.rhythmLine, { borderColor: theme.secondary }]} />
      <Animated.View style={[styles.rhythmCircle, { transform: [{ translateY }], backgroundColor: theme.surface }]}>
        <Text style={{ fontSize: fontSize + 30 }}>🥁</Text>
      </Animated.View>
      <TouchableOpacity onPress={handleTap} style={[styles.tapArea, { backgroundColor: theme.surface }]}>
        <Text style={{ color: theme.text, fontSize: fontSize + 20, fontWeight: 'bold' }}>TAP RHYTHM!</Text>
      </TouchableOpacity>
    </View>
  );
}

export function SingleTapChoice({ onComplete, onBack, theme, fontSize }) {
  const [question, setQuestion] = useState(MindGames.generateYesNoQuestion());
  const [score, setScore] = useState(0);

  const handleChoice = (ans) => {
    if (ans === question.a) {
      setScore(s => s + 25);
      if (score >= 75) onComplete(100);
      else setQuestion(MindGames.generateYesNoQuestion());
    } else {
      alert("Try again!");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={{ color: theme.secondary, fontSize }}>← Back</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.text, fontSize: fontSize + 20 }]}>{question.q}</Text>
      <View style={styles.options}>
        <TouchableOpacity style={[styles.choiceBtn, { backgroundColor: theme.success || '#4CAF50' }]} onPress={() => handleChoice(true)}>
          <Text style={{ fontSize: fontSize + 20, color: '#fff' }}>YES</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.choiceBtn, { backgroundColor: theme.danger || '#FF5252' }]} onPress={() => handleChoice(false)}>
          <Text style={{ fontSize: fontSize + 20, color: '#fff' }}>NO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  backButton: { alignSelf: 'flex-start', marginBottom: 20 },
  title: { fontWeight: 'bold', marginBottom: 50, textAlign: 'center' },
  largeTarget: { position: 'absolute', width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', elevation: 10 },
  scoreText: { position: 'absolute', bottom: 30, width: '100%', textAlign: 'center' },
  rhythmLine: { position: 'absolute', top: height - 250, width: width, borderTopWidth: 5, zIndex: 1 },
  rhythmCircle: { position: 'absolute', left: width / 2 - 40, width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  tapArea: { position: 'absolute', bottom: 50, width: width - 40, left: 20, padding: 30, borderRadius: 20, alignItems: 'center' },
  options: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 50 },
  choiceBtn: { width: '40%', padding: 40, borderRadius: 20, alignItems: 'center' }
});
