import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Vibration } from 'react-native';
import { MindGames } from '../../utils/MindGames';

export default function MemoryMatch({ onComplete, onBack, theme, fontSize, speak }) {
  const [cards, setCards] = useState(MindGames.generateMemoryCards(8));
  const [selectedIds, setSelectedIds] = useState([]);
  const [matches, setMatches] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    speak("Starting Memory Match. Turn over the cards to find matching pairs.");
  }, []);

  const handlePress = (id) => {
    if (selectedIds.length === 2 || selectedIds.includes(id) || cards.find(c => c.id === id).matched) return;
    
    const newSelected = [...selectedIds, id];
    setSelectedIds(newSelected);
    
    if (newSelected.length === 2) {
      const [id1, id2] = newSelected;
      const card1 = cards.find(c => c.id === id1);
      const card2 = cards.find(c => c.id === id2);
      
      if (card1.emoji === card2.emoji) {
        setTimeout(() => {
          setCards(cards.map(c => (c.id === id1 || c.id === id2 ? { ...c, matched: true } : c)));
          setMatches(m => m + 1);
          setSelectedIds([]);
          Vibration.vibrate(50);
          speak("Match found!");
        }, 500);
      } else {
        setTimeout(() => setSelectedIds([]), 1000);
      }
    }
  };

  useEffect(() => {
    if (matches === 4) {
      const timeTaken = (Date.now() - startTime) / 1000;
      onComplete(Math.floor(200 / timeTaken));
    }
  }, [matches]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={{ color: theme.secondary, fontSize }}>← Back</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.text, fontSize: fontSize + 10 }]}>🧠 Memory Match</Text>
      <FlatList
        data={cards}
        numColumns={3}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: item.matched || selectedIds.includes(item.id) ? theme.surface : theme.secondary }]}
            onPress={() => handlePress(item.id)}
          >
            <Text style={{ fontSize: fontSize + 20 }}>
              {item.matched || selectedIds.includes(item.id) ? item.emoji : '?'}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, alignItems: 'center' },
  backButton: { alignSelf: 'flex-start', marginBottom: 20 },
  title: { fontWeight: 'bold', marginBottom: 20 },
  card: { width: 90, height: 90, margin: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 15 },
});
