import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import { caregiverAPI, sosAPI } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const MOCK_PATIENTS = [
  { id: 1, name: 'Robert Wilson', room: '302', status: 'Healthy', lastHeartRate: '72 bpm', location: 'Living Room' },
  { id: 2, name: 'Alice Smith', room: '105', status: 'Alert', lastHeartRate: '94 bpm', location: 'Bedroom' },
  { id: 3, name: 'James Brown', room: '201', status: 'Healthy', lastHeartRate: '68 bpm', location: 'Kitchen' },
];

export default function CaretakerDashboardScreen() {
  const { fontSize, titleSize, headingSize, COLORS, neu, speak } = useAccessibility();
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      speak('Dashboard data refreshed');
    }, 1500);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.orchid} />
      }
    >
      {/* Header Area */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Medical Staff</Text>
          <Text style={[styles.title, { fontSize: titleSize + 4 }]}>Caretaker Hub</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
          <View style={styles.notifBadge} />
          <Ionicons name="notifications-outline" size={24} color={COLORS.orchid} />
        </TouchableOpacity>
      </View>

      {/* Hero SOS Banner */}
      <TouchableOpacity 
        style={[styles.sosBanner, neu(10)]}
        activeOpacity={0.9}
        onPress={() => speak('Active Emergency: Alice Smith in Room 105')}
      >
        <View style={styles.sosIconWrap}>
          <Ionicons name="warning" size={28} color={COLORS.highlight} />
        </View>
        <View style={styles.sosContent}>
          <Text style={styles.sosTitle}>EMERGENCY ALERT</Text>
          <Text style={styles.sosPatient}>Alice Smith · Room 105</Text>
          <Text style={styles.sosAction}>Tap to view details & location →</Text>
        </View>
      </TouchableOpacity>

      {/* Stats Quick View */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, neu(6)]}>
          <Text style={styles.statVal}>08</Text>
          <Text style={styles.statLabel}>Total Patients</Text>
        </View>
        <View style={[styles.statBox, neu(6)]}>
          <Text style={[styles.statVal, { color: COLORS.success }]}>07</Text>
          <Text style={styles.statLabel}>Stable</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>PATIENT MONITORING</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Patient List */}
      {patients.map((patient) => (
        <TouchableOpacity 
          key={patient.id} 
          style={[styles.patientCard, neu(8)]}
          activeOpacity={0.8}
        >
          <View style={[styles.avatarWrap, { backgroundColor: patient.status === 'Healthy' ? COLORS.lilac : '#ffebee' }]}>
            <Text style={styles.avatarText}>{patient.name[0]}</Text>
          </View>
          
          <View style={styles.patientInfo}>
            <Text style={[styles.pName, { fontSize: headingSize }]}>{patient.name}</Text>
            <View style={styles.pMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>{patient.location}</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Ionicons name="heart-outline" size={12} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>{patient.lastHeartRate}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statusWrap}>
            <View style={[styles.statusDot, { backgroundColor: patient.status === 'Healthy' ? COLORS.success : COLORS.danger }]} />
            <Text style={[styles.statusText, { 
              color: patient.status === 'Healthy' ? COLORS.success : COLORS.danger,
              fontSize: fontSize - 4
            }]}>
              {patient.status.toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* Recent Alerts Feed */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>RECENT LOGS</Text>
      </View>
      
      <View style={[styles.logsCard, neu(5)]}>
        {[
          { time: '10:45 AM', msg: 'Medicine dose confirmed: Robert W.', icon: 'checkmark-circle' },
          { time: '09:20 AM', msg: 'Movement detected: James B.', icon: 'walk' },
        ].map((log, i) => (
          <View key={i} style={styles.logItem}>
            <Ionicons name={log.icon} size={18} color={COLORS.lavender} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.logMsg}>{log.msg}</Text>
              <Text style={styles.logTime}>{log.time}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0edf6' },
  content: { padding: 24, paddingBottom: 60 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  eyebrow: { color: '#8b7ab8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 11, marginBottom: 4 },
  title: { fontWeight: '800', color: '#3d2c6e', letterSpacing: -0.8 },
  notifBtn: { 
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#ece8f3', 
    justifyContent: 'center', alignItems: 'center'
  },
  notifBadge: { 
    position: 'absolute', top: 12, right: 12, width: 10, height: 10, 
    borderRadius: 5, backgroundColor: '#e57373', zIndex: 1, borderWidth: 2, borderColor: '#ece8f3' 
  },

  sosBanner: {
    backgroundColor: '#e57373',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  sosIconWrap: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  sosContent: { flex: 1, marginLeft: 16 },
  sosTitle: { color: '#ffffff', fontWeight: '800', fontSize: 12, letterSpacing: 1.5 },
  sosPatient: { color: '#ffffff', fontWeight: '700', fontSize: 18, marginVertical: 2 },
  sosAction: { color: 'rgba(255,255,255,0.8)', fontWeight: '600', fontSize: 12 },

  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  statBox: { flex: 1, backgroundColor: '#ece8f3', borderRadius: 20, padding: 16, alignItems: 'center' },
  statVal: { fontSize: 24, fontWeight: '800', color: '#9b72cf', marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: '600', color: '#8b7ab8', textTransform: 'uppercase' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#8b7ab8', letterSpacing: 1.2 },
  viewAll: { fontSize: 12, fontWeight: '700', color: '#9b72cf' },

  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ece8f3',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  avatarWrap: { 
    width: 52, height: 52, borderRadius: 18, justifyContent: 'center', alignItems: 'center'
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: '#3d2c6e' },
  patientInfo: { flex: 1, marginLeft: 16 },
  pName: { fontWeight: '700', color: '#3d2c6e', marginBottom: 4 },
  pMeta: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: '#8b7ab8', fontWeight: '600' },
  metaDivider: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#d1c4e9', marginHorizontal: 8 },
  
  statusWrap: { alignItems: 'flex-end', gap: 4 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontWeight: '800', letterSpacing: 0.5 },

  logsCard: { backgroundColor: '#ece8f3', borderRadius: 24, padding: 20 },
  logItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  logMsg: { fontSize: 14, fontWeight: '600', color: '#3d2c6e' },
  logTime: { fontSize: 11, color: '#8b7ab8', marginTop: 2, fontWeight: '500' },
});
