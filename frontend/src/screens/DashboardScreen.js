import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import { moodAPI, gameAPI } from '../services/api';
import MoodChart from '../components/MoodChart';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  bg: '#f0edf6',
  surface: '#ece8f3',
  raised: '#f7f4fc',
  orchid: '#9b72cf',
  lavender: '#b39ddb',
  iris: '#7c6bc4',
  lilac: '#d1c4e9',
  textPrimary: '#3d2c6e',
  textSecondary: '#8b7ab8',
  shadow: '#c8c0dc',
  highlight: '#ffffff',
  success: '#a8d8b9',
};

const neu = (d = 6) => ({
  shadowColor: COLORS.shadow,
  shadowOffset: { width: d, height: d },
  shadowOpacity: 0.5,
  shadowRadius: d * 1.5,
  elevation: d,
});

const moodEmoji = { '😊 Happy': '😊', '😐 Neutral': '😐', '😔 Sad': '😔', '😴 Tired': '😴', '💪 Strong': '💪' };
const moodColors = {
  '😊 Happy': '#f9c6d0', '😐 Neutral': '#d1c4e9',
  '😔 Sad': '#b3c6f7', '😴 Tired': '#c8e6c9', '💪 Strong': '#ffe0b2',
};

export default function DashboardScreen() {
  const { theme, fontSize, titleSize, headingSize, speak } = useAccessibility();
  const [moodData, setMoodData] = useState([]);
  const [gameStats, setGameStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayMood, setTodayMood] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [moodsRes, statsRes] = await Promise.all([moodAPI.getAll(), gameAPI.getStats()]);
      setMoodData(moodsRes.data);
      setGameStats(statsRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const submitMood = async (mood) => {
    try {
      await moodAPI.create({ mood, date: new Date() });
      setTodayMood(mood);
      loadData();
      speak(`You're feeling ${mood}`);
    } catch (e) { console.error(e); }
  };

  const moodOptions = ['😊 Happy', '😐 Neutral', '😔 Sad', '😴 Tired', '💪 Strong'];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.orchid} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting */}
      <View style={styles.greetingRow}>
        <View>
          <Text style={styles.greetingEyebrow}>Good morning</Text>
          <Text style={[styles.greeting, { fontSize: titleSize }]}>
            Welcome back 👋
          </Text>
        </View>
        <View style={styles.greetingBadge}>
          <Ionicons name="heart" size={18} color={COLORS.orchid} />
        </View>
      </View>

      {/* Mood check-in */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconWrap, { backgroundColor: '#f3e5f5' }]}>
            <Text style={{ fontSize: 18 }}>🌸</Text>
          </View>
          <Text style={[styles.cardTitle, { fontSize: headingSize }]}>How are you feeling?</Text>
        </View>
        <View style={styles.moodGrid}>
          {moodOptions.map((mood) => (
            <TouchableOpacity
              key={mood}
              style={[
                styles.moodChip,
                { backgroundColor: todayMood === mood ? moodColors[mood] : COLORS.surface },
                todayMood === mood && styles.moodChipActive,
              ]}
              onPress={() => submitMood(mood)}
              activeOpacity={0.8}
              accessibilityLabel={`Mood: ${mood}`}
            >
              <Text style={{ fontSize: fontSize + 10 }}>{moodEmoji[mood]}</Text>
              <Text style={[styles.moodLabel, {
                fontSize: fontSize - 2,
                color: todayMood === mood ? COLORS.textPrimary : COLORS.textSecondary,
                fontWeight: todayMood === mood ? '700' : '500',
              }]}>
                {mood.split(' ').slice(1).join(' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Mood chart */}
      {moodData.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrap, { backgroundColor: '#e8eaf6' }]}>
              <Ionicons name="analytics-outline" size={18} color={COLORS.iris} />
            </View>
            <Text style={[styles.cardTitle, { fontSize: headingSize }]}>7-Day Mood Trend</Text>
          </View>
          <MoodChart data={moodData} theme={theme} />
        </View>
      )}

      {/* Game stats */}
      {gameStats && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconWrap, { backgroundColor: '#fce4ec' }]}>
              <Text style={{ fontSize: 18 }}>🎮</Text>
            </View>
            <Text style={[styles.cardTitle, { fontSize: headingSize }]}>Game Performance</Text>
          </View>

          <View style={styles.statsRow}>
            {[
              { value: gameStats.cognitiveBest || 0, label: 'Mental Best', icon: '🧠' },
              { value: gameStats.reflexBest || 0, label: 'Reflex Best', icon: '⚡' },
              { value: gameStats.gamesPlayed || 0, label: 'Total Played', icon: '🎯' },
            ].map((stat, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={{ fontSize: 20, marginBottom: 6 }}>{stat.icon}</Text>
                <Text style={[styles.statValue, { fontSize: titleSize }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { fontSize: fontSize - 3 }]}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.bestGameRow}>
            <Text style={[styles.bestGameLabel, { fontSize }]}>🏆 Best Game</Text>
            <Text style={[styles.bestGameValue, { fontSize }]}>{gameStats.bestGame}</Text>
          </View>

          <View style={styles.insightBox}>
            <Ionicons name="bulb-outline" size={16} color={COLORS.orchid} style={{ marginRight: 8 }} />
            <Text style={[styles.insightText, { fontSize: fontSize - 1, flex: 1 }]}>
              {gameStats.insight || 'Play more to unlock deeper insights!'}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 24, paddingBottom: 48 },

  loadingContainer: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '500' },

  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  greetingEyebrow: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  greeting: { fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  greetingBadge: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.lilac,
    justifyContent: 'center', alignItems: 'center',
    ...neu(5),
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    ...neu(6),
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  cardIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    ...neu(3),
  },
  cardTitle: { fontWeight: '700', color: COLORS.textPrimary, flex: 1 },

  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  moodChip: {
    width: '30%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 6,
    ...neu(4),
  },
  moodChipActive: { borderWidth: 1.5, borderColor: COLORS.orchid },
  moodLabel: { textAlign: 'center' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.raised,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    ...neu(4),
  },
  statValue: { fontWeight: '800', color: COLORS.orchid, letterSpacing: -0.5 },
  statLabel: { color: COLORS.textSecondary, marginTop: 4, textAlign: 'center', fontWeight: '500' },

  bestGameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.raised,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    ...neu(3),
  },
  bestGameLabel: { color: COLORS.textSecondary, fontWeight: '600' },
  bestGameValue: { color: COLORS.orchid, fontWeight: '800' },

  insightBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ede7f6',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.orchid,
  },
  insightText: { color: COLORS.textPrimary, fontStyle: 'italic', lineHeight: 20 },
});