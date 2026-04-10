import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Switch,
} from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import { medicineAPI } from '../services/api';
import { notificationService } from '../services/notificationService';
import MedicineItem from '../components/MedicineItem';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

export default function MedicineScreen() {
  const { theme, fontSize, headingSize, speak } = useAccessibility();
  const [medicines, setMedicines] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    time: '09:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  });

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      const response = await medicineAPI.getAll();
      setMedicines(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const saveMedicine = async () => {
    if (!formData.name || !formData.dosage) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      if (editingMedicine) {
        await medicineAPI.update(editingMedicine._id, formData);
        await notificationService.cancelReminder(editingMedicine._id);
      } else {
        await medicineAPI.create(formData);
      }
      await loadMedicines();
      setModalVisible(false);
      resetForm();
      speak('Medicine saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save medicine');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      time: '09:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    });
    setEditingMedicine(null);
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await medicineAPI.delete(id);
          await notificationService.cancelReminder(id);
          await loadMedicines();
          speak('Medicine deleted');
        },
      },
    ]);
  };

  const toggleDay = (day) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.secondary }]}
          onPress={() => setModalVisible(true)}
          accessibilityLabel="Add new medicine"
        >
          <Ionicons name="add" size={24} color={theme.background} />
          <Text style={[styles.addButtonText, { color: theme.background, fontSize }]}>
            Add Medicine
          </Text>
        </TouchableOpacity>

        {medicines.map((medicine) => (
          <MedicineItem
            key={medicine._id}
            medicine={medicine}
            onEdit={(med) => {
              setEditingMedicine(med);
              setFormData({
                name: med.name,
                dosage: med.dosage,
                time: med.time,
                days: med.days,
              });
              setModalVisible(true);
            }}
            onDelete={handleDelete}
            onRefresh={loadMedicines}
            theme={theme}
            fontSize={fontSize}
          />
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text, fontSize: headingSize }]}>
              {editingMedicine ? 'Edit Medicine' : 'Add Medicine'}
            </Text>

            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, fontSize }]}
              placeholder="Medicine Name"
              placeholderTextColor={theme.textSecondary}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, fontSize }]}
              placeholder="Dosage (e.g., 1 tablet)"
              placeholderTextColor={theme.textSecondary}
              value={formData.dosage}
              onChangeText={(text) => setFormData({ ...formData, dosage: text })}
            />

            <Text style={[styles.label, { color: theme.text, fontSize: fontSize - 2 }]}>
              Time: {formData.time}
            </Text>
            <DateTimePicker
              value={new Date(`2000-01-01T${formData.time}:00`)}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  const hours = selectedDate.getHours().toString().padStart(2, '0');
                  const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
                  setFormData({ ...formData, time: `${hours}:${minutes}` });
                }
              }}
            />

            <Text style={[styles.label, { color: theme.text, fontSize: fontSize - 2 }]}>
              Repeat on:
            </Text>
            <View style={styles.daysRow}>
              {weekDays.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    {
                      backgroundColor: formData.days.includes(day)
                        ? theme.secondary
                        : theme.background,
                    },
                  ]}
                  onPress={() => toggleDay(day)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      {
                        color: formData.days.includes(day) ? theme.background : theme.text,
                        fontSize,
                      },
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.background }]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={[styles.modalButtonText, { color: theme.text, fontSize }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.secondary }]}
                onPress={saveMedicine}
              >
                <Text style={[styles.modalButtonText, { color: theme.background, fontSize }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  addButtonText: { fontWeight: 'bold', marginLeft: 10 },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { margin: 20, borderRadius: 20, padding: 20 },
  modalTitle: { fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderRadius: 10, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  label: { marginBottom: 10, marginTop: 10 },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  dayButton: { padding: 10, borderRadius: 8, margin: 5, minWidth: 50, alignItems: 'center' },
  dayText: { fontWeight: '500' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  modalButton: { flex: 1, padding: 12, borderRadius: 10, marginHorizontal: 5, alignItems: 'center' },
  modalButtonText: { fontWeight: 'bold' },
});