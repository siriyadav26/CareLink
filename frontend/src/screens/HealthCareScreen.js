import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const DAILY_TIPS = [
  { id: 1, text: "Stay hydrated! Drink at least 8 glasses of water today.", icon: "water" },
  { id: 2, text: "A 10-minute walk can boost your mood significantly.", icon: "walk" },
  { id: 3, text: "Eat protein-rich snacks like nuts or yogurt for energy.", icon: "nutrition" },
];

const EXERCISES = [
  {
    id: 1,
    title: "Seated Leg Lifts",
    duration: "5 mins",
    difficulty: "Beginner",
    category: "Seated",
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    title: "Neck Stretches",
    duration: "3 mins",
    difficulty: "Easy",
    category: "Stretching",
    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80"
  }
];

export default function HealthCareScreen() {
  const { theme, fontSize, headingSize, speak } = useAccessibility();
  const [completedExercises, setCompletedExercises] = useState([]);

  const toggleExercise = (id) => {
    if (completedExercises.includes(id)) {
      setCompletedExercises(prev => prev.filter(item => item !== id));
    } else {
      setCompletedExercises(prev => [...prev, id]);
      speak("Great job! Keep moving!");
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.padding}>
        <Text style={[styles.title, { color: theme.text, fontSize: headingSize }]}>
          Daily Health Tips
        </Text>
        
        {DAILY_TIPS.map(tip => (
          <View key={tip.id} style={[styles.tipCard, { backgroundColor: theme.surface }]}>
            <Ionicons name={tip.icon} size={30} color={theme.secondary} />
            <Text style={[styles.tipText, { color: theme.text, fontSize }]}>
              {tip.text}
            </Text>
          </View>
        ))}

        <Text style={[styles.title, { color: theme.text, fontSize: headingSize, marginTop: 30 }]}>
          Exercise Videos
        </Text>

        {EXERCISES.map(exercise => (
          <TouchableOpacity 
            key={exercise.id} 
            style={[styles.exerciseCard, { backgroundColor: theme.surface }]}
            onPress={() => speak(`Starting ${exercise.title}`)}
          >
            <Image source={{ uri: exercise.thumbnail }} style={styles.thumbnail} />
            <View style={styles.exerciseInfo}>
              <Text style={[styles.exerciseTitle, { color: theme.text, fontSize }]}>
                {exercise.title}
              </Text>
              <Text style={[styles.exerciseSub, { color: theme.textSecondary, fontSize: fontSize - 2 }]}>
                {exercise.category} • {exercise.duration} • {exercise.difficulty}
              </Text>
              
              <TouchableOpacity 
                style={[
                  styles.completeButton, 
                  { backgroundColor: completedExercises.includes(exercise.id) ? '#4CAF50' : theme.secondary }
                ]}
                onPress={() => toggleExercise(exercise.id)}
              >
                <Text style={[styles.completeText, { fontSize: fontSize - 2 }]}>
                  {completedExercises.includes(exercise.id) ? 'Completed!' : 'Mark Done'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  padding: { padding: 20 },
  title: { fontWeight: 'bold', marginBottom: 20 },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
  },
  tipText: { marginLeft: 15, flex: 1 },
  exerciseCard: {
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
  },
  thumbnail: { width: '100%', height: 180 },
  exerciseInfo: { padding: 15 },
  exerciseTitle: { fontWeight: 'bold', marginBottom: 5 },
  exerciseSub: { marginBottom: 15 },
  completeButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeText: { color: 'white', fontWeight: 'bold' }
});
