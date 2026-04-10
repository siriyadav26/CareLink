import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { medicineAPI } from '../services/api';
import { notificationService } from '../services/notificationService';
import { Ionicons } from '@expo/vector-icons';

export default function MedicineItem({ medicine, onEdit, onDelete, onRefresh, theme, fontSize }) {
  const [taken, setTaken] = useState(medicine.takenToday || false);

  const handleToggleTaken = async () => {
    try {
      await medicineAPI.markTaken(medicine._id);
      setTaken(true);
      Alert.alert('Success', `Medicine "${medicine.name}" marked as taken`);
      onRefresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSnooze = async () => {
    try {
      await notificationService.snoozeMedicineReminder(
        medicine._id,
        medicine.name,
        `Don't forget to take ${medicine.name} (${medicine.dosage})`
      );
      Alert.alert('Snoozed', 'Reminder delayed by 10 minutes');
    } catch (error) {
       Alert.alert('Error', 'Failed to snooze reminder');
    }
  };

  const isLowStock = medicine.stock <= medicine.refillThreshold;

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.name, { color: theme.text, fontSize: fontSize + 2 }]}>
          💊 {medicine.name}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit(medicine)} style={styles.iconButton}>
            <Ionicons name="pencil" size={22} color={theme.secondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(medicine._id)} style={styles.iconButton}>
            <Ionicons name="trash" size={22} color={theme.accent} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.stockRow}>
        <Text style={[styles.dosage, { color: theme.textSecondary, fontSize: fontSize - 2 }]}>
          Dosage: {medicine.dosage} • Time: {medicine.time}
        </Text>
        <Text style={[
          styles.stock, 
          { color: isLowStock ? theme.accent : theme.textSecondary, fontSize: fontSize - 2, fontWeight: isLowStock ? 'bold' : 'normal' }
        ]}>
          Stock: {medicine.stock} left {isLowStock ? '(Low!)' : ''}
        </Text>
      </View>
      <Text style={[styles.time, { color: theme.textSecondary, fontSize: fontSize - 2 }]}>
        Days: {medicine.days.join(', ')}
      </Text>

      <View style={styles.takenRow}>
        <Text style={[styles.takenLabel, { color: theme.text, fontSize }]}>
          {taken ? '✓ Taken Today' : 'Not Taken Yet'}
        </Text>
        {!taken && (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.snoozeButton, { borderColor: theme.secondary }]}
              onPress={handleSnooze}
            >
              <Text style={[styles.snoozeButtonText, { color: theme.secondary, fontSize: fontSize - 2 }]}>
                Snooze
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.takenButton, { backgroundColor: theme.secondary }]}
              onPress={handleToggleTaken}
            >
              <Text style={[styles.takenButtonText, { color: theme.background, fontSize: fontSize - 2 }]}>
                Mark as Taken
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  name: { fontWeight: 'bold', flex: 1 },
  actions: { flexDirection: 'row' },
  iconButton: { marginLeft: 12 },
  dosage: { marginBottom: 4 },
  time: { marginBottom: 12 },
  takenRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  takenLabel: { fontWeight: '500' },
  buttonGroup: { flexDirection: 'row', alignItems: 'center' },
  snoozeButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, marginRight: 8 },
  snoozeButtonText: { fontWeight: 'bold' },
  takenButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  takenButtonText: { fontWeight: 'bold' },
});