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
  danger: '#ff8a80',
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', dosage: '', time: '09:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  });

  useEffect(() => { 
    loadMedicines(); 
  }, []);

  // ── Loads data from DB only (does NOT touch OS alarms) ─────────────────
  const loadMedicines = async () => {
    try {
      const response = await medicineAPI.getAll();
      const meds = response.data;
      setMedicines(meds);
      return meds; // Return for use by rescheduleAllAlarms
    } catch (e) { 
      console.error('Load Error:', e.message);
      return [];
    }
  };

  // ── NUCLEAR RESCHEDULE: Wipe ALL OS alarms first, then rebuild from DB ──
  // This is the ONLY way to guarantee no zombie alarms exist.
  const rescheduleAllAlarms = async (medsOverride) => {
    console.log('🧹 V18 Wiping ALL OS alarms before rescheduling...');
    await notificationService.wipeAllLocalAlarms();
    const meds = medsOverride || await loadMedicines();
    let scheduled = 0;
    for (const med of meds) {
      if (!med.takenToday) {
        try {
          await notificationService.scheduleMedicineReminder(med._id, med.name, med.dosage, med.time);
          scheduled++;
          console.log(`✅ V18 Scheduled: ${med.name} at ${med.time}`);
        } catch (e) {
          console.warn(`⚠️ Could not schedule ${med.name}:`, e.message);
        }
      }
    }
    console.log(`🎯 V18 Reschedule complete: ${scheduled} alarms active.`);
    return meds;
  };

  const handleGlobalSync = async () => {
    setIsSyncing(true);
    try {
      speak('Starting global alarm sync. Cleaning old notifications.');
      const meds = await loadMedicines();
      await rescheduleAllAlarms(meds);
      setMedicines(meds);
      Alert.alert('✅ Sync Complete', `All alarms wiped and re-scheduled from scratch.\nActive alarms: ${meds.filter(m => !m.takenToday).length}`);
    } catch (e) {
      Alert.alert('Sync Error', e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const saveMedicine = async () => {
    if (!formData.name.trim() || !formData.dosage.trim()) { 
      Alert.alert('Missing Fields', 'Please enter both a medicine name and dosage.'); 
      return; 
    }
    if (!formData.time || !formData.time.includes(':')) {
      Alert.alert('Missing Fields', 'Please select a valid alarm time.');
      return;
    }
    
    let savedMed = null;
    
    // ── Step 1: Save to DB (always runs) ────────────────────────────────
    try {
      console.log('📤 V18 Saving Medicine to DB:', JSON.stringify(formData));
      if (editingMedicine) {
        const response = await medicineAPI.update(editingMedicine._id, formData);
        savedMed = response.data;
        // Cancel old alarm before scheduling new one
        await notificationService.cancelReminder(editingMedicine._id).catch(() => {});
      } else {
        const response = await medicineAPI.create(formData);
        savedMed = response.data.medicine;
      }
    } catch (e) { 
      const errMsg = e.response?.data?.message || e.message || 'Unknown error';
      const status = e.response?.status || 'No response';
      console.error(`❌ DB Save Error [HTTP ${status}]:`, errMsg);
      Alert.alert('Save Failed', `Could not save medicine.\nHTTP ${status}: ${errMsg}`);
      return; // Stop here — only show error if DB save actually failed
    }

    // ── Step 2: NUCLEAR reschedule — wipe ALL OS alarms and rebuild ──────
    // This guarantees NO zombie alarms from previous failed saves or stale schedules
    try {
      // First reload so we get the full fresh list including the just-saved medicine
      const freshMeds = await loadMedicines();
      await rescheduleAllAlarms(freshMeds);
      setMedicines(freshMeds);
      if (savedMed) await notificationService.notifyAdded(savedMed.name);
    } catch (notifErr) {
      // Alarm scheduling failed, but medicine IS saved — just warn
      console.warn('⚠️ Alarm scheduling failed (but medicine was saved):', notifErr.message);
      const freshMeds = await loadMedicines();
      setMedicines(freshMeds);
      Alert.alert(
        'Medicine Saved ✅',
        `${savedMed?.name || 'Medicine'} was saved but the alarm could not be scheduled.\nTap the sync button (🔄) to retry.`
      );
    }

    // ── Step 3: Close modal ──────────────────────────────────────────────
    setModalVisible(false);
    resetForm();
    speak('Medicine saved. All alarms refreshed.');
  };

  const resetForm = () => {
    setFormData({ name: '', dosage: '', time: '09:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] });
    setEditingMedicine(null);
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete Medicine', 'Are you sure?', [
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
            <Text style={styles.pageEyebrow}>V17.1 IMMORTAL SYNC</Text>
            <Text style={[styles.pageTitle, { fontSize: headingSize + 4 }]}>Medicines</Text>
          </View>
          <TouchableOpacity 
            style={[styles.syncBtn, isSyncing && { opacity: 0.5 }]} 
            onPress={handleGlobalSync}
            disabled={isSyncing}
          >
            <Ionicons name="sync" size={24} color={COLORS.orchid} />
          </TouchableOpacity>
        </View>

        {/* Add button */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <View style={styles.addBtnIcon}>
            <Ionicons name="add" size={22} color={COLORS.highlight} />
          </View>
          <Text style={[styles.addBtnText, { fontSize }]}>Add New Medicine</Text>
        </TouchableOpacity>

        {/* List */}
        {medicines.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>💊</Text>
            <Text style={styles.emptyTitle}>No medicines yet</Text>
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

      {/* Modal Container */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { fontSize: headingSize }]}>
              {editingMedicine ? '✏️ Edit Medicine' : '💊 Add Medicine'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Name</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.inputText, { fontSize }]}
                    placeholder="Medicine Name"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                </View>
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Dosage</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.inputText, { fontSize }]}
                    placeholder="e.g. 1 Tablet"
                    value={formData.dosage}
                    onChangeText={(text) => setFormData({ ...formData, dosage: text })}
                  />
                </View>
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Time: {formData.time}</Text>
                <View style={[styles.inputRow, { justifyContent: 'center' }]}>
                  <DateTimePicker
                    value={(() => {
                      const [hh, mm] = (formData.time || '09:00').split(':');
                      const d = new Date();
                      d.setHours(parseInt(hh) || 9, parseInt(mm) || 0, 0, 0);
                      return d;
                    })()}
                    mode="time"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      // On Android, event.type is 'dismissed' if user cancelled - don't update
                      if (event.type === 'dismissed' || !selectedDate) return;
                      const h = selectedDate.getHours().toString().padStart(2, '0');
                      const m = selectedDate.getMinutes().toString().padStart(2, '0');
                      setFormData(prev => ({ ...prev, time: `${h}:${m}` }));
                    }}
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setModalVisible(false); resetForm(); }}>
                  <Text style={styles.cancelBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={saveMedicine}>
                  <Text style={styles.saveBtnText}>Save Alarm</Text>
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
  content: { padding: 24 },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pageEyebrow: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '700', letterSpacing: 1 },
  pageTitle: { fontWeight: '900', color: COLORS.textPrimary },
  syncBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', ...neu(4) },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 20, padding: 18, marginBottom: 24, gap: 14, ...neu(6) },
  addBtnIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.iris, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { fontWeight: '700', color: COLORS.textPrimary },
  emptyState: { alignItems: 'center', paddingVertical: 50 },
  emptyTitle: { color: COLORS.textSecondary, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: { backgroundColor: COLORS.bg, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '90%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.lilac, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontWeight: '900', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 25 },
  fieldWrap: { marginBottom: 20 },
  fieldLabel: { color: COLORS.textSecondary, fontWeight: '700', marginBottom: 8, fontSize: 12, textTransform: 'uppercase' },
  inputRow: { backgroundColor: COLORS.surface, borderRadius: 15, paddingHorizontal: 15, paddingVertical: 5, ...neu(3) },
  inputText: { paddingVertical: 10, color: COLORS.textPrimary },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelBtn: { flex: 1, padding: 15, borderRadius: 15, backgroundColor: COLORS.surface, alignItems: 'center' },
  cancelBtnText: { color: COLORS.textSecondary, fontWeight: '700' },
  saveBtn: { flex: 2, padding: 15, borderRadius: 15, backgroundColor: COLORS.iris, alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: '800' },
});