import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import { gameAPI } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

import MemoryMatch from '../components/games/MemoryMatch';
import ReactionTime from '../components/games/ReactionTime';
import { SimpleMath, AttentionFocus, EmotionSelect, BreathingRelax } from '../components/games/CoreGames';
import { PatternMatch, AudioMemory } from '../components/games/SpecializedGames';
import { LargeIconTap, VisualRhythm, SingleTapChoice } from '../components/games/SupportGames';
import { VisualReaction, SlowInteraction, YesNoRecognition, RepeatPattern } from '../components/games/CognitiveGames';

const { width } = Dimensions.get('window');

const COLORS = {
  bg: '#f0edf6', surface: '#ece8f3', raised: '#f7f4fc',
  orchid: '#9b72cf', lavender: '#b39ddb', iris: '#7c6bc4',
  lilac: '#d1c4e9', textPrimary: '#3d2c6e', textSecondary: '#8b7ab8',
  shadow: '#c8c0dc', highlight: '#ffffff',
};
const neu = (d = 6) => ({
  shadowColor: COLORS.shadow, shadowOffset: { width: d, height: d },
  shadowOpacity: 0.5, shadowRadius: d * 1.5, elevation: d,
});

const CATEGORY_COLORS = {
  cognitive: { bg: '#ede7f6', accent: '#7c6bc4', light: '#d1c4e9' },
  reaction: { bg: '#fce4ec', accent: '#e57373', light: '#f8bbd0' },
  specialized: { bg: '#e8f5e9', accent: '#66bb6a', light: '#c8e6c9' },
  motor: { bg: '#fff3e0', accent: '#ffa726', light: '#ffe0b2' },
};

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
    } catch (e) { console.error(e); }
  };

  const renderGame = () => {
    const props = {
      onComplete: (score) => { saveScore(activeGame, score); setActiveGame(null); },
      onBack: () => setActiveGame(null),
      theme, fontSize, speak,
    };
    const map = {
      'Memory Match': MemoryMatch, 'Reaction Time': ReactionTime, 'Simple Math': SimpleMath,
      'Attention Focus': AttentionFocus, 'Emotion Select': EmotionSelect, 'Breathing Relax': BreathingRelax,
      'Pattern Match': PatternMatch, 'Audio Memory': AudioMemory, 'Large Icon Tap': LargeIconTap,
      'Visual Reaction': VisualReaction, 'Visual Rhythm': VisualRhythm, 'Single Tap Choice': SingleTapChoice,
      'Slow Interaction': SlowInteraction, 'Yes/No Logic': YesNoRecognition, 'Repeat Pattern': RepeatPattern,
    };
    const Component = map[activeGame];
    return Component ? <Component {...props} /> : null;
  };

  const gameData = {
    cognitive: [
      { id: 'Memory Match', icon: '🧠', desc: 'Recall & match' },
      { id: 'Simple Math', icon: '🔢', desc: 'Quick arithmetic' },
      { id: 'Yes/No Logic', icon: '💡', desc: 'Decision making' },
      { id: 'Repeat Pattern', icon: '🔄', desc: 'Pattern recall' },
    ],
    reaction: [
      { id: 'Reaction Time', icon: '⚡', desc: 'Tap on cue' },
      { id: 'Attention Focus', icon: '🎯', desc: 'Stay on target' },
      { id: 'Visual Reaction', icon: '👁️', desc: 'See & respond' },
      { id: 'Visual Rhythm', icon: '🎵', desc: 'Follow the beat' },
    ],
    specialized: [
      { id: 'Audio Memory', icon: '🎧', desc: 'Sound recall' },
      { id: 'Pattern Match', icon: '🌈', desc: 'Visual patterns' },
      { id: 'Large Icon Tap', icon: '👆', desc: 'Tap accuracy' },
    ],
    motor: [
      { id: 'Emotion Select', icon: '😊', desc: 'Recognize feelings' },
      { id: 'Breathing Relax', icon: '🌬️', desc: 'Guided breathing' },
      { id: 'Single Tap Choice', icon: '🖐️', desc: 'One-tap decisions' },
      { id: 'Slow Interaction', icon: '🐢', desc: 'Mindful pace' },
    ],
  };

  const categoryMeta = {
    cognitive: { key: 'cognitive', label: '🧠 Mental Stability', subtitle: 'Logic & memory' },
    reaction: { key: 'reaction', label: '⚡ Reflex & Focus', subtitle: 'Speed & coordination' },
    specialized: { key: 'specialized', label: '👁️ Vision & Audio', subtitle: 'Sensory support' },
    motor: { key: 'motor', label: '🖐️ Motor & Relaxation', subtitle: 'Movement & calm' },
  };

  if (activeGame) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        {renderGame()}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>Daily Exercise</Text>
          <Text style={[styles.headerTitle, { fontSize: titleSize + 4 }]}>Brain Training</Text>
          <Text style={styles.headerSub}>15 exercises for a sharper mind</Text>
        </View>
        <View style={styles.headerIcon}>
          <Text style={{ fontSize: 28 }}>🏆</Text>
        </View>
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        {[
          { value: '15', label: 'Exercises', icon: 'game-controller-outline' },
          { value: '4', label: 'Categories', icon: 'grid-outline' },
          { value: '∞', label: 'Replays', icon: 'refresh-outline' },
        ].map((s) => (
          <View key={s.label} style={styles.statItem}>
            <Ionicons name={s.icon} size={14} color={COLORS.orchid} />
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Success banner */}
      {gameResult && (
        <View style={styles.successBanner}>
          <Text style={{ fontSize: 18 }}>🎉</Text>
          <Text style={[styles.successText, { fontSize: fontSize - 1 }]}>
            {gameResult.type} — Score: <Text style={styles.successScore}>{gameResult.score}</Text>
          </Text>
        </View>
      )}

      {/* Category sections */}
      {Object.entries(categoryMeta).map(([key, meta]) => {
        const colors = CATEGORY_COLORS[key];
        return (
          <View key={key} style={styles.categorySection}>
            {/* Category header */}
            <View style={[styles.categoryHeader, { backgroundColor: colors.bg }]}>
              <View>
                <Text style={[styles.categoryTitle, { fontSize: headingSize - 1, color: colors.accent }]}>{meta.label}</Text>
                <Text style={[styles.categorySub, { fontSize: fontSize - 3, color: colors.accent, opacity: 0.7 }]}>{meta.subtitle}</Text>
              </View>
              <View style={[styles.categoryCount, { backgroundColor: colors.light }]}>
                <Text style={[styles.categoryCountText, { color: colors.accent }]}>{gameData[key].length}</Text>
              </View>
            </View>

            {/* Game grid */}
            <View style={styles.grid}>
              {gameData[key].map((game) => (
                <TouchableOpacity
                  key={game.id}
                  style={styles.gameCard}
                  onPress={() => { setActiveGame(game.id); speak(`Starting ${game.id}`); }}
                  activeOpacity={0.85}
                >
                  <View style={[styles.gameIconWrap, { backgroundColor: colors.bg }]}>
                    <Text style={{ fontSize: 28 }}>{game.icon}</Text>
                  </View>
                  <Text style={[styles.gameName, { fontSize: fontSize - 1, color: COLORS.textPrimary }]} numberOfLines={2}>
                    {game.id}
                  </Text>
                  <Text style={[styles.gameDesc, { fontSize: fontSize - 4 }]}>{game.desc}</Text>
                  <View style={[styles.playBtn, { backgroundColor: colors.bg }]}>
                    <Ionicons name="play" size={12} color={colors.accent} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      })}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const CARD_WIDTH = (width - 48 - 12) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 24, paddingBottom: 48 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, marginTop: 8 },
  headerEyebrow: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 },
  headerTitle: { fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5, marginBottom: 4 },
  headerSub: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  headerIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.lilac, justifyContent: 'center', alignItems: 'center', ...neu(6),
  },

  statsBar: {
    flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 20,
    paddingVertical: 16, paddingHorizontal: 20, marginBottom: 24, justifyContent: 'space-around', ...neu(5),
  },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },

  successBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#e8f5e9', borderRadius: 16, padding: 16, marginBottom: 20,
    borderLeftWidth: 4, borderLeftColor: '#66bb6a',
  },
  successText: { color: COLORS.textPrimary, fontWeight: '600' },
  successScore: { color: COLORS.orchid, fontWeight: '800' },

  categorySection: { marginBottom: 24 },
  categoryHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: 16, paddingHorizontal: 18, paddingVertical: 14, marginBottom: 12,
  },
  categoryTitle: { fontWeight: '800', letterSpacing: -0.2 },
  categorySub: { marginTop: 2, fontWeight: '600' },
  categoryCount: {
    width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
  },
  categoryCountText: { fontSize: 14, fontWeight: '800' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gameCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.surface, borderRadius: 20,
    padding: 18, alignItems: 'center', ...neu(5),
  },
  gameIconWrap: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12, ...neu(4),
  },
  gameName: { fontWeight: '700', textAlign: 'center', marginBottom: 4, lineHeight: 18 },
  gameDesc: { color: COLORS.textSecondary, fontWeight: '500', textAlign: 'center', marginBottom: 12 },
  playBtn: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', ...neu(3),
  },
});