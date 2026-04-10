import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const GameCard = ({ title, onPress, theme, fontSize }) => {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.surface }]}
      onPress={onPress}
    >
      <Text style={[styles.title, { color: theme.text, fontSize: fontSize + 4 }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 15,
    marginVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontWeight: 'bold',
  },
});

export default GameCard;
