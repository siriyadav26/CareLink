import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from 'react-native';
import { MindGames } from '../../utils/MindGames';

export function SimpleMath({ onComplete, onBack, theme, fontSize, speak }) {
  const [problem, setProblem] = useState(MindGames.generateMathProblem('easy'));
  const [score, setScore] = useState(0);

  React.useEffect(() => {
    speak("Starting Simple Math. Solve the arithmetic problems to improve your memory.");
  }, []);

  const handleAnswer = (ans) => {
    if (ans === problem.answer) {
      setScore(s => s + 20);
      setProblem(MindGames.generateMathProblem('medium'));
      if (score >= 100) onComplete(score + 20);
    } else {
      alert('Try again!');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={{ color: theme.secondary, fontSize }}>← Back</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.text, fontSize: fontSize + 20 }]}>{problem.question}</Text>
      <View style={styles.options}>
        {problem.options.map((opt, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.option, { backgroundColor: theme.surface }]}
            onPress={() => handleAnswer(opt)}
          >
            <Text style={{ fontSize: fontSize + 15, color: theme.text }}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function AttentionFocus({ onComplete, onBack, theme, fontSize, speak }) {
  const [problem, setProblem] = useState(MindGames.generateFocusProblem());
  const [score, setScore] = useState(0);

  React.useEffect(() => {
    speak("Starting Attention Focus. Find the symbol that is different from the others.");
  }, []);

  const handlePress = (index) => {
    if (index === problem.oddIndex) {
      setScore(s => s + 25);
      if (score >= 75) {
        onComplete(100);
      } else {
        setProblem(MindGames.generateFocusProblem());
      }
    } else {
      alert('Find the odd symbol!');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={{ color: theme.secondary, fontSize }}>← Back</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.text, fontSize: fontSize + 20 }]}>Find the Odd Symbol 🎯</Text>
      <View style={styles.grid}>
        {problem.items.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.gridItem, { backgroundColor: theme.surface }]}
            onPress={() => handlePress(i)}
          >
            <Text style={{ fontSize: fontSize + 25 }}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function EmotionSelect({ onComplete, onBack, theme, fontSize, speak }) {
  useEffect(() => {
    speak("Starting Emotion Select. Tap the emoji that best describes how you feel.");
  }, []);
  const emotions = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😐', label: 'Neutral' },
    { emoji: '😔', label: 'Sad' },
    { emoji: '😴', label: 'Tired' },
    { emoji: '💪', label: 'Strong' },
    { emoji: '😰', label: 'Anxious' }
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={{ color: theme.secondary, fontSize }}>← Back</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.text, fontSize: fontSize + 20 }]}>How are you feeling? 😊</Text>
      <View style={styles.options}>
        {emotions.map((em, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.emotionCard, { backgroundColor: theme.surface }]}
            onPress={() => onComplete(100)}
          >
            <Text style={{ fontSize: fontSize + 30 }}>{em.emoji}</Text>
            <Text style={{ fontSize, color: theme.textSecondary }}>{em.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function BreathingRelax({ onComplete, onBack, theme, fontSize, speak }) {
  const [phase, setPhase] = useState('Inhale');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    speak("Starting Breathing Relaxation. Follow the circle and breathe deeply.");
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          const nextPhase = phase === 'Inhale' ? 'Exhale' : 'Inhale';
          setPhase(nextPhase);
          Vibration.vibrate(50);
          speak(nextPhase);
          return 0;
        }
        return p + 1; // Slower for relaxation
      });
    }, 50);
    return () => clearInterval(timer);
  }, [phase]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={{ color: theme.secondary, fontSize }}>← Back</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.text, fontSize: fontSize + 25 }]}>{phase} 🌊</Text>
      <View style={[styles.circle, { width: 150 + progress, height: 150 + progress, borderRadius: (150 + progress) / 2, backgroundColor: theme.secondary + '20' }]}>
        <View style={[styles.circleInner, { width: 80 + progress / 2, height: 80 + progress / 2, borderRadius: (80 + progress / 2) / 2, backgroundColor: theme.secondary }]} />
      </View>
      <TouchableOpacity onPress={() => onComplete(100)} style={[styles.doneButton, { backgroundColor: theme.surface }]}>
        <Text style={{ color: theme.text, fontSize }}>I feel relaxed</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center' },
  backButton: { alignSelf: 'flex-start', marginBottom: 20 },
  title: { fontWeight: 'bold', marginBottom: 40, textAlign: 'center' },
  options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  option: { width: '40%', padding: 20, margin: 10, borderRadius: 15, alignItems: 'center', elevation: 3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 300, justifyContent: 'center' },
  gridItem: { width: 80, height: 80, margin: 5, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  emotionCard: { width: '40%', padding: 20, margin: 10, borderRadius: 20, alignItems: 'center' },
  circle: { justifyContent: 'center', alignItems: 'center', marginVertical: 50 },
  circleInner: { elevation: 5 },
  doneButton: { marginTop: 50, padding: 20, borderRadius: 30, width: '100%', alignItems: 'center' }
});

// Since I'm creating multiple components in one file for efficiency in this turn,
// I'll export them individually.
