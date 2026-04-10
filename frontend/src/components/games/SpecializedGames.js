import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Vibration } from 'react-native';
import { MindGames } from '../../utils/MindGames';

const { width } = Dimensions.get('window');

export function PatternMatch({ onComplete, onBack, theme, fontSize, speak }) {
  const [problem, setProblem] = useState(MindGames.generatePatternMatch());
  const [score, setScore] = useState(0);

  useEffect(() => {
    speak("Starting Pattern Match. Look at the symbol in the center and pick the matching one below.");
  }, []);

  const handlePress = (opt) => {
    if (opt === problem.target) {
      setScore(s => s + 25);
      Vibration.vibrate(50);
      speak("Match!");
      if (score >= 75) onComplete(100);
      else setProblem(MindGames.generatePatternMatch());
    } else {
      speak("Try again!");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={{ color: theme.secondary, fontSize }}>← Back</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.text, fontSize: fontSize + 20 }]}>Match the Symbol 🌈</Text>
      <View style={[styles.targetBox, { borderColor: theme.secondary, backgroundColor: theme.surface }]}>
        <Text style={{ fontSize: fontSize + 50 }}>{problem.target}</Text>
      </View>
      <View style={styles.options}>
        {problem.options.map((opt, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.option, { backgroundColor: theme.surface }]}
            onPress={() => handlePress(opt)}
          >
            <Text style={{ fontSize: fontSize + 30 }}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function AudioMemory({ onComplete, onBack, theme, fontSize, speak }) {
  const [sequence, setSequence] = useState(MindGames.getAudioSequence(3));
  const [playing, setPlaying] = useState(false);
  const [choices, setChoices] = useState([]);
  const [userInput, setUserInput] = useState([]);

  useEffect(() => {
    const allChoices = [...sequence, 'Orange', 'Pear', 'Monkey', 'Key'].sort(() => Math.random() - 0.5);
    setChoices(allChoices);
  }, []);

  const playSequence = async () => {
    setPlaying(true);
    for (const item of sequence) {
      speak(item);
      await new Promise(r => setTimeout(r, 1500));
    }
    setPlaying(false);
    speak("Now pick the items in order!");
  };

  const handleChoice = (item) => {
    const nextInput = [...userInput, item];
    setUserInput(nextInput);
    if (nextInput.length === sequence.length) {
      const correct = nextInput.every((val, i) => val === sequence[i]);
      if (correct) onComplete(100);
      else {
        alert("Incorrect sequence. Let's try again!");
        setUserInput([]);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={{ color: theme.secondary, fontSize }}>← Back</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.text, fontSize: fontSize + 20 }]}>Listen and Repeat 👁️</Text>
      <TouchableOpacity
        style={[styles.playButton, { backgroundColor: theme.secondary }]}
        onPress={playSequence}
        disabled={playing}
      >
        <Text style={{ fontSize: fontSize + 5, color: theme.background }}>{playing ? 'Listening...' : '▶ Play Audio'}</Text>
      </TouchableOpacity>
      <View style={styles.options}>
        {userInput.length < sequence.length && choices.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.wordButton, { backgroundColor: theme.surface }]}
            onPress={() => handleChoice(item)}
            disabled={playing}
          >
            <Text style={{ fontSize: fontSize + 5, color: theme.text }}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center' },
  backButton: { alignSelf: 'flex-start', marginBottom: 20 },
  title: { fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  targetBox: { padding: 30, borderRadius: 20, borderWidth: 3, marginBottom: 40 },
  options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  option: { width: 80, height: 80, margin: 10, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  playButton: { padding: 25, borderRadius: 20, width: '100%', alignItems: 'center', marginBottom: 30 },
  wordButton: { padding: 15, margin: 5, borderRadius: 10, minWidth: 100, alignItems: 'center' }
});
