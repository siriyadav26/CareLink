import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import { moodAPI, gameAPI } from '../services/api';
import MoodChart from '../components/MoodChart';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { theme, fontSize, titleSize, headingSize, speak } = useAccessibility();
  const [moodData, setMoodData] = useState([]);
  const [gameStats, setGameStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayMood, setTodayMood] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [moodsRes, statsRes] = await Promise.all([
        moodAPI.getAll(),
        gameAPI.getStats(),
      ]);
      setMoodData(moodsRes.data);
      setGameStats(statsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const submitMood = async (mood) => {
    try {
      await moodAPI.create({ mood, date: new Date() });
      setTodayMood(mood);
      loadData();
      speak(`You're feeling ${mood}`);
    } catch (error) {
      console.error(error);
    }
  };

  const moodOptions = ['😊 Happy', '😐 Neutral', '😔 Sad', '😴 Tired', '💪 Strong'];

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.secondary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.greeting, { color: theme.text, fontSize: titleSize }]}>
        Welcome back! 👋
      </Text>

      {/* Mood Check-in */}
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.text, fontSize: headingSize }]}>
          How are you feeling today?
        </Text>
        <View style={styles.moodRow}>
          {moodOptions.map((mood) => (
            <TouchableOpacity
              key={mood}
              style={[styles.moodButton, { backgroundColor: theme.background }]}
              onPress={() => submitMood(mood)}
              accessibilityLabel={`Mood: ${mood}`}
            >
              <Text style={[styles.moodText, { color: theme.text, fontSize: fontSize + 8 }]}>
                {mood}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Mood Trends Chart */}
      {moodData.length > 0 && (
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.text, fontSize: headingSize }]}>
            Mood Trends (Last 7 Days)
          </Text>
          <MoodChart data={moodData} theme={theme} />
        </View>
      )}

      {/* Game Performance Summary */}
      {gameStats && (
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.text, fontSize: headingSize }]}>
            🎮 Game Performance
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.secondary, fontSize: titleSize }]}>
                {gameStats.cognitiveBest || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary, fontSize: fontSize - 2 }]}>
                Mental Best
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.secondary, fontSize: titleSize }]}>
                {gameStats.reflexBest || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary, fontSize: fontSize - 2 }]}>
                Reflex Best
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.secondary, fontSize: titleSize }]}>
                {gameStats.gamesPlayed || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary, fontSize: fontSize - 2 }]}>
                Total Played
              </Text>
            </View>
          </View>
          <View style={styles.bestGameRow}>
            <Text style={{ color: theme.text, fontSize }}>🏆 Best Game: </Text>
            <Text style={{ color: theme.secondary, fontSize, fontWeight: 'bold' }}>{gameStats.bestGame}</Text>
          </View>
          <Text style={[styles.aiInsight, { color: theme.text, fontSize }]}>
            🤖 AI Insight: {gameStats.insight || "Play more to unlock deeper insights!"}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 40 },
  greeting: { fontWeight: 'bold', marginBottom: 20 },
  card: { borderRadius: 20, padding: 20, marginBottom: 20, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  cardTitle: { fontWeight: '600', marginBottom: 15 },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  moodButton: { padding: 12, borderRadius: 12, marginBottom: 10, width: '48%', alignItems: 'center' },
  moodText: { fontWeight: '500' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  statItem: { alignItems: 'center' },
  statValue: { fontWeight: 'bold' },
  statLabel: { marginTop: 5 },
  bestGameRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10, padding: 10, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 10 },
  aiInsight: { marginTop: 10, fontStyle: 'italic', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#ddd' },
});