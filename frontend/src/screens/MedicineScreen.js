import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Modal, Alert, Platform,
} from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import { medicineAPI } from '../services/api';
import { notificationService } from '../services/notificationService';
import MedicineItem from '../components/MedicineItem';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

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

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MedicineScreen() {
  const { fontSize, headingSize, speak } = useAccessibility();
  const [medicines, setMedicines] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [formData, setFormData] = useState({
    name: '', dosage: '', time: '09:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  });

  useEffect(() => { loadMedicines(); }, []);

  const loadMedicines = async () => {
    try {
      const response = await medicineAPI.getAll();
      setMedicines(response.data);
    } catch (e) { console.error(e); }
  };

  const saveMedicine = async () => {
    if (!formData.name || !formData.dosage) { Alert.alert('Missing fields', 'Please fill all fields'); return; }
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
    } catch { Alert.alert('Error', 'Failed to save medicine'); }
  };

  const resetForm = () => {
    setFormData({ name: '', dosage: '', time: '09:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] });
    setEditingMedicine(null);
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete Medicine', 'Are you sure you want to remove this?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await medicineAPI.delete(id);
          await notificationService.cancelReminder(id);
          await loadMedicines();
          speak('Medicine deleted');
        }
      },
    ]);
  };

  const toggleDay = (day) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
    }));
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageEyebrow}>Your Schedule</Text>
            <Text style={[styles.pageTitle, { fontSize: headingSize + 4 }]}>Medicines</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{medicines.length}</Text>
          </View>
        </View>

        {/* Add button */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
          accessibilityLabel="Add new medicine"
        >
          <View style={styles.addBtnIcon}>
            <Ionicons name="add" size={22} color={COLORS.highlight} />
          </View>
          <Text style={[styles.addBtnText, { fontSize }]}>Add New Medicine</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.lavender} />
        </TouchableOpacity>

        {/* List */}
        {medicines.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>💊</Text>
            <Text style={styles.emptyTitle}>No medicines yet</Text>
            <Text style={styles.emptySub}>Tap above to add your first reminder</Text>
          </View>
        ) : (
          medicines.map((medicine) => (
            <MedicineItem
              key={medicine._id}
              medicine={medicine}
              onEdit={(med) => {
                setEditingMedicine(med);
                setFormData({ name: med.name, dosage: med.dosage, time: med.time, days: med.days });
                setModalVisible(true);
              }}
              onDelete={handleDelete}
              onRefresh={loadMedicines}
              theme={{ surface: COLORS.surface, secondary: COLORS.orchid, text: COLORS.textPrimary }}
              fontSize={fontSize}
            />
          ))
        )}
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Handle */}
            <View style={styles.modalHandle} />

            <Text style={[styles.modalTitle, { fontSize: headingSize }]}>
              {editingMedicine ? '✏️ Edit Medicine' : '💊 Add Medicine'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Name */}
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { fontSize: fontSize - 3 }]}>Medicine Name</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="medkit-outline" size={17} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
                  <TextInput
                    style={[styles.inputText, { fontSize, color: COLORS.textPrimary }]}
                    placeholder="e.g. Aspirin"
                    placeholderTextColor={COLORS.textSecondary}
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                </View>
              </View>

              {/* Dosage */}
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { fontSize: fontSize - 3 }]}>Dosage</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="water-outline" size={17} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
                  <TextInput
                    style={[styles.inputText, { fontSize, color: COLORS.textPrimary }]}
                    placeholder="e.g. 1 tablet"
                    placeholderTextColor={COLORS.textSecondary}
                    value={formData.dosage}
                    onChangeText={(text) => setFormData({ ...formData, dosage: text })}
                  />
                </View>
              </View>

              {/* Time */}
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { fontSize: fontSize - 3 }]}>
                  Time — <Text style={{ color: COLORS.orchid, fontWeight: '700' }}>{formData.time}</Text>
                </Text>
                <View style={[styles.inputRow, { justifyContent: 'center' }]}>
                  <DateTimePicker
                    value={new Date(`2000-01-01T${formData.time}:00`)}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        const h = selectedDate.getHours().toString().padStart(2, '0');
                        const m = selectedDate.getMinutes().toString().padStart(2, '0');
                        setFormData({ ...formData, time: `${h}:${m}` });
                      }
                    }}
                  />
                </View>
              </View>

              {/* Days */}
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { fontSize: fontSize - 3 }]}>Repeat on</Text>
                <View style={styles.daysRow}>
                  {weekDays.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[styles.dayChip, formData.days.includes(day) && styles.dayChipActive]}
                      onPress={() => toggleDay(day)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.dayText, {
                        fontSize: fontSize - 2,
                        color: formData.days.includes(day) ? COLORS.highlight : COLORS.textSecondary,
                        fontWeight: formData.days.includes(day) ? '700' : '500',
                      }]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => { setModalVisible(false); resetForm(); }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.cancelBtnText, { fontSize }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={saveMedicine} activeOpacity={0.85}>
                  <Text style={[styles.saveBtnText, { fontSize }]}>Save</Text>
                  <Ionicons name="checkmark" size={18} color={COLORS.highlight} />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 24, paddingBottom: 48 },

  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 8 },
  pageEyebrow: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 },
  pageTitle: { fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  headerBadge: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.lilac, justifyContent: 'center', alignItems: 'center', ...neu(4),
  },
  headerBadgeText: { fontSize: 16, fontWeight: '800', color: COLORS.orchid },

  addBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20, padding: 18, marginBottom: 24, gap: 14, ...neu(6),
  },
  addBtnIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.iris, justifyContent: 'center', alignItems: 'center', ...neu(4),
  },
  addBtnText: { flex: 1, fontWeight: '700', color: COLORS.textPrimary },

  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  emptySub: { fontSize: 13, color: COLORS.textSecondary },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(61,44,110,0.25)' },
  modalSheet: {
    backgroundColor: COLORS.bg, borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 28, paddingBottom: 48, maxHeight: '92%',
    shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 20,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.lilac, alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: { fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 28, letterSpacing: -0.3 },

  fieldWrap: { marginBottom: 20 },
  fieldLabel: { color: COLORS.textSecondary, fontWeight: '600', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4, ...neu(4),
  },
  inputText: { flex: 1, paddingVertical: 13, fontWeight: '500' },

  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayChip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
    backgroundColor: COLORS.surface, ...neu(3),
  },
  dayChipActive: { backgroundColor: COLORS.iris },
  dayText: {},

  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 18,
    backgroundColor: COLORS.surface, alignItems: 'center', ...neu(4),
  },
  cancelBtnText: { color: COLORS.textSecondary, fontWeight: '700' },
  saveBtn: {
    flex: 2, flexDirection: 'row', paddingVertical: 16, borderRadius: 18,
    backgroundColor: COLORS.iris, alignItems: 'center', justifyContent: 'center', gap: 8, ...neu(5),
  },
  saveBtnText: { color: COLORS.highlight, fontWeight: '700' },
});