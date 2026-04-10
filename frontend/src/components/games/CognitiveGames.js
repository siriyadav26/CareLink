import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Vibration } from 'react-native';
import { MindGames } from '../../utils/MindGames';

const { width } = Dimensions.get('window');

export function VisualReaction({ onComplete, onBack, theme, fontSize }) {
  const [active, setActive] = useState(false);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    speak("Starting Visual Reaction. Wait for the green flash and then tap the screen immediately.");
    const delay = Math.random() * 3000 + 2000;
    const timer = setTimeout(() => {
      setActive(true);
      setStartTime(Date.now());
      Vibration.vibrate(100);
      speak("NOW!");
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const handlePress = () => {
    if (active) {
      onComplete(Math.max(10, 1000 - (Date.now() - startTime)));
    } else {
      speak("Too early! Wait for the flash.");
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
        style={[styles.fullTarget, { backgroundColor: active ? theme.success || '#4CAF50' : theme.surface }]}
      >
        <Text style={{ fontSize: fontSize + 25, color: '#fff', fontWeight: 'bold' }}>
          {active ? 'TAP NOW!' : 'Wait for Flash...'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export function SlowInteraction({ onComplete, onBack, theme, fontSize }) {
  const [taps, setTaps] = useState(0);

  const handleTap = () => {
    setTaps(t => {
      if (t >= 5) onComplete(100);
      return t + 1;
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={{ color: theme.secondary, fontSize }}>← Back</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.text, fontSize: fontSize + 15 }]}>Take your time. Tap the icons slowly. 🖐️</Text>
      <View style={styles.centerArea}>
        <TouchableOpacity style={[styles.slowBtn, { backgroundColor: theme.surface }]} onPress={handleTap}>
          <Text style={{ fontSize: fontSize + 40 }}>🌸</Text>
        </TouchableOpacity>
        <Text style={{ color: theme.textSecondary, marginTop: 20 }}>Taps: {taps}/6</Text>
      </View>
    </View>
  );
}

export function YesNoRecognition({ onComplete, onBack, theme, fontSize }) {
  const [item, setItem] = useState({ q: 'Is this an apple? 🍎', a: true });
  const [score, setScore] = useState(0);

  const handleChoice = (ans) => {
    if (ans === item.a) {
      setScore(s => s + 25);
      if (score >= 75) onComplete(100);
      else setItem({ q: 'Is this a car? 🚲', a: false }); // Static for brevity but can be expanded
    } else {
      alert("Try again!");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={{ color: theme.secondary, fontSize }}>← Back</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.text, fontSize: fontSize + 25 }]}>{item.q}</Text>
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

export function RepeatPattern({ onComplete, onBack, theme, fontSize }) {
  const [sequence, setSequence] = useState([0, 1, 2]);
  const [userInput, setUserInput] = useState([]);
  const [playing, setPlaying] = useState(false);
  const colors = ['#FF5252', '#4CAF50', '#2196F3', '#FFC107'];

  useEffect(() => {
    speak("Starting Repeat Pattern. Watch the tiles and repeat the order they highlight.");
    setTimeout(() => playSequence(), 2000);
  }, []);

  const [highlighted, setHighlighted] = useState(null);

  const playSequence = async () => {
    setPlaying(true);
    for (const step of sequence) {
      setHighlighted(step);
      Vibration.vibrate(50);
      await new Promise(r => setTimeout(r, 800));
      setHighlighted(null);
      await new Promise(r => setTimeout(r, 400));
    }
    setPlaying(false);
    speak("Your turn!");
  };

  const handlePress = (idx) => {
    if (playing) return;
    const nextInput = [...userInput, idx];
    setUserInput(nextInput);
    Vibration.vibrate(50);
    if (nextInput.length === sequence.length) {
      if (nextInput.every((val, i) => val === sequence[i])) {
        speak("Correct!");
        onComplete(100);
      } else {
        speak("Oops! Let's try again.");
        setUserInput([]);
        setTimeout(() => playSequence(), 1000);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={{ color: theme.secondary, fontSize }}>← Back</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.text, fontSize: fontSize + 20 }]}>Repeat the Pattern 🧠</Text>
      <View style={styles.grid}>
        {colors.map((color, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.tile, { backgroundColor: color, opacity: highlighted === i ? 1 : 0.4 }]}
            onPress={() => handlePress(i)}
            disabled={playing}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  backButton: { alignSelf: 'flex-start', marginBottom: 20 },
  title: { fontWeight: 'bold', marginBottom: 50, textAlign: 'center' },
  fullTarget: { flex: 1, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  centerArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  slowBtn: { width: 150, height: 150, borderRadius: 75, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  options: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 50 },
  choiceBtn: { width: '40%', padding: 40, borderRadius: 20, alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 50 },
  tile: { width: 140, height: 140, margin: 10, borderRadius: 20 }
});
