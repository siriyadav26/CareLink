import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import { gameAPI } from '../services/api';

// Categorized Imports
import MemoryMatch from '../components/games/MemoryMatch';
import ReactionTime from '../components/games/ReactionTime';
import { SimpleMath, AttentionFocus, EmotionSelect, BreathingRelax } from '../components/games/CoreGames';
import { PatternMatch, AudioMemory } from '../components/games/SpecializedGames';
import { LargeIconTap, VisualRhythm, SingleTapChoice } from '../components/games/SupportGames';
import { VisualReaction, SlowInteraction, YesNoRecognition, RepeatPattern } from '../components/games/CognitiveGames';

const { width } = Dimensions.get('window');

export default function GamesScreen() {
  const { theme, fontSize, titleSize, headingSize, speak } = useAccessibility();
  const [activeGame, setActiveGame] = useState(null);
  const [gameResult, setGameResult] = useState(null);

  const saveScore = async (gameType, score) => {
    try {
      await gameAPI.saveScore({ gameType, score });
      speak(`Excellent! You scored ${score} in ${gameType}`);
      setGameResult({ type: gameType, score });
      setTimeout(() => setGameResult(null), 5000);
    } catch (error) {
      console.error(error);
    }
  };

  const renderGame = () => {
    const props = {
      onComplete: (score) => {
        saveScore(activeGame, score);
        setActiveGame(null);
      },
      onBack: () => setActiveGame(null),
      theme,
      fontSize,
      speak
    };

    switch (activeGame) {
      case 'Memory Match': return <MemoryMatch {...props} />;
      case 'Reaction Time': return <ReactionTime {...props} />;
      case 'Simple Math': return <SimpleMath {...props} />;
      case 'Attention Focus': return <AttentionFocus {...props} />;
      case 'Emotion Select': return <EmotionSelect {...props} />;
      case 'Breathing Relax': return <BreathingRelax {...props} />;
      case 'Pattern Match': return <PatternMatch {...props} />;
      case 'Audio Memory': return <AudioMemory {...props} />;
      case 'Large Icon Tap': return <LargeIconTap {...props} />;
      case 'Visual Reaction': return <VisualReaction {...props} />;
      case 'Visual Rhythm': return <VisualRhythm {...props} />;
      case 'Single Tap Choice': return <SingleTapChoice {...props} />;
      case 'Slow Interaction': return <SlowInteraction {...props} />;
      case 'Yes/No Logic': return <YesNoRecognition {...props} />;
      case 'Repeat Pattern': return <RepeatPattern {...props} />;
      default: return null;
    }
  };

  const renderCategory = (title, games) => (
    <View style={styles.categorySection}>
      <Text style={[styles.categoryTitle, { color: theme.secondary, fontSize: headingSize }]}>{title}</Text>
      <View style={styles.grid}>
        {games.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={[styles.gameCard, { backgroundColor: theme.surface }]}
            onPress={() => {
              setActiveGame(game.id);
              speak(`Starting ${game.id}`);
            }}
          >
            <Text style={{ fontSize: fontSize + 20 }}>{game.icon}</Text>
            <Text style={[styles.gameName, { color: theme.text, fontSize }]}>{game.id}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const gameData = {
    cognitive: [
      { id: 'Memory Match', icon: '🧠' },
      { id: 'Simple Math', icon: '🔢' },
      { id: 'Yes/No Logic', icon: '🧠' },
      { id: 'Repeat Pattern', icon: '🧠' },
    ],
    reaction: [
      { id: 'Reaction Time', icon: '⚡' },
      { id: 'Attention Focus', icon: '🎯' },
      { id: 'Visual Reaction', icon: '👂' },
      { id: 'Visual Rhythm', icon: '👂' },
    ],
    specialized: [
      { id: 'Audio Memory', icon: '👁️' },
      { id: 'Pattern Match', icon: '🌈' },
      { id: 'Large Icon Tap', icon: '👁️' },
    ],
    motor: [
      { id: 'Emotion Select', icon: '😊' },
      { id: 'Breathing Relax', icon: '🎧' },
      { id: 'Single Tap Choice', icon: '🖐️' },
      { id: 'Slow Interaction', icon: '🖐️' },
    ]
  };

  if (activeGame) {
    return <View style={[styles.container, { backgroundColor: theme.background }]}>{renderGame()}</View>;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text, fontSize: titleSize }]}>Brain Training Hub</Text>
        <Text style={[styles.headerSub, { color: theme.textSecondary, fontSize }]}>15 specialized exercises for your mind</Text>
      </View>

      {gameResult && (
        <View style={[styles.resultBanner, { backgroundColor: theme.success || '#4CAF50' }]}>
          <Text style={[styles.resultText, { color: '#fff', fontSize }]}>
            Success! Saved {gameResult.type} score: {gameResult.score}
          </Text>
        </View>
      )}

      {renderCategory('🧠 Mental Stability & Logic', gameData.cognitive)}
      {renderCategory('⚡ Reflex & Coordination', gameData.reaction)}
      {renderCategory('👁️ Vision & Audio Support', gameData.specialized)}
      {renderCategory('🖐️ Motor & Relaxation', gameData.motor)}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 25, paddingTop: 40 },
  headerTitle: { fontWeight: 'bold' },
  headerSub: { marginTop: 5 },
  categorySection: { padding: 20 },
  categoryTitle: { fontWeight: 'bold', marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gameCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gameName: { marginTop: 10, fontWeight: '600', textAlign: 'center' },
  resultBanner: { margin: 20, padding: 15, borderRadius: 15, alignItems: 'center' },
  resultText: { fontWeight: 'bold' },
});