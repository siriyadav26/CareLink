import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SoundButton = ({ onPress, enabled, theme, fontSize }) => {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: enabled ? theme.secondary : theme.surface }]}
      onPress={onPress}
      accessibilityLabel={enabled ? "Turn sound off" : "Turn sound on"}
    >
      <Ionicons name={enabled ? "volume-high" : "volume-mute"} size={24} color={theme.background} />
      <Text style={[styles.text, { fontSize, color: theme.background }]}>
        {enabled ? "Sound ON" : "Sound OFF"}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  text: {
    marginLeft: 10,
    fontWeight: 'bold',
  },
});

export default SoundButton;
