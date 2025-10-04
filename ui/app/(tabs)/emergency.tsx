import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TriangleAlert as AlertTriangle, Phone, MessageSquare, Shield, Clock } from 'lucide-react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '../hooks/useTranslation';
import { EmergencyContactCard } from '../components/EmergencyContactCard';
import { emergencyContacts } from '../data/sampleData';
import { useGlobalSearchParams } from 'expo-router';

const API_URL = 'http://10.232.121.138:8000';

export default function EmergencyScreen() {
  const { t } = useTranslation();
  const mountedRef = useRef(true);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [countdown, setCountdown] = useState(0);
  const { touristId } = useGlobalSearchParams<{ touristId: string }>();

  useEffect(() => { /* ... (no changes here) ... */ }, []);
  useEffect(() => { /* ... (no changes here) ... */ }, [countdown]);
  const getCurrentLocation = async () => { /* ... (no changes here) ... */ };

  // --- THIS ENTIRE FUNCTION IS UPDATED ---
  const triggerEmergencyAlert = () => {
    if (!touristId) {
      alert("Cannot send SOS. Please register on the Profile tab first.");
      return;
    }

    // Use window.confirm for a web-compatible confirmation dialog
    const isConfirmed = window.confirm(
      'Emergency SOS\n\nThis will send your location to all emergency contacts and authorities. Are you sure?'
    );

    if (isConfirmed) {
      if (mountedRef.current) {
        setIsEmergencyActive(true);
        setCountdown(30);
      }
      sendEmergencyAlert();
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    }
  };

  // --- THIS FUNCTION IS UPDATED ---
  const sendEmergencyAlert = async () => {
    if (!touristId) return;

    try {
      const response = await fetch(`${API_URL}/panic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourist_id: parseInt(touristId, 10),
        }),
      });

      if (!response.ok) {
        throw new Error('Server responded with an error');
      }
      
      console.log(`Panic alert sent for tourist ID: ${touristId}`);
      
      if (mountedRef.current) {
        // Use standard web alert
        alert('SOS Sent Successfully! Your emergency contacts have been notified. Help is on the way!');
      }
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      if (mountedRef.current) {
        // Use standard web alert
        alert('Error: Failed to send emergency alert. Please try again.');
      }
    }
  };

  // --- THIS FUNCTION IS UPDATED ---
  const cancelEmergencyAlert = () => {
    // Use window.confirm for a web-compatible confirmation dialog
    const isConfirmed = window.confirm(
      'Are you sure you want to cancel the emergency alert?'
    );

    if (isConfirmed) {
      if (mountedRef.current) {
        setIsEmergencyActive(false);
        setCountdown(0);
        // Use standard web alert
        alert('Alert Canceled. Emergency alert has been canceled.');
      }
    }
  };

  // The rest of your UI and styles are unchanged
  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#DC2626" />
      <View style={styles.header}>
        <Text style={styles.title}>{t('emergency_assistance')}</Text>
        <Text style={styles.subtitle}>{t('immediate_help_available')}</Text>
      </View>
      {isEmergencyActive && (
        <View style={styles.emergencyStatus}>
          <View style={styles.emergencyIndicator}><Shield size={32} color="#FFFFFF" /></View>
          <Text style={styles.emergencyText}>{t('emergency_active')}</Text>
          {countdown > 0 && (
            <View style={styles.countdownContainer}>
              <Clock size={20} color="#FFFFFF" />
              <Text style={styles.countdownText}>{t('help_arriving_in')} {countdown}s</Text>
            </View>
          )}
          <TouchableOpacity style={styles.cancelButton} onPress={cancelEmergencyAlert}>
            <Text style={styles.cancelButtonText}>{t('cancel_alert')}</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.sosContainer}>
        <TouchableOpacity
          style={[styles.sosButton, isEmergencyActive && styles.sosButtonActive]}
          onPress={triggerEmergencyAlert}
          disabled={isEmergencyActive}
        >
          <AlertTriangle size={64} color="#FFFFFF" />
          <Text style={styles.sosButtonText}>{isEmergencyActive ? t('alert_sent') : 'SOS'}</Text>
        </TouchableOpacity>
        <Text style={styles.sosInstructions}>{t('press_for_emergency_help')}</Text>
      </View>
      <View style={styles.contactsSection}>
        <Text style={styles.sectionTitle}>{t('emergency_contacts')}</Text>
        {emergencyContacts.map((contact, index) => (
          <EmergencyContactCard key={index} contact={contact} />
        ))}
      </View>
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Phone size={24} color="#DC2626" />
          <Text style={styles.actionButtonText}>{t('call_police')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MessageSquare size={24} color="#DC2626" />
          <Text style={styles.actionButtonText}>{t('send_message')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Your styles are unchanged
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#DC2626' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#FCA5A5' },
  emergencyStatus: { backgroundColor: '#B91C1C', margin: 20, borderRadius: 16, padding: 20, alignItems: 'center' },
  emergencyIndicator: { width: 64, height: 64, backgroundColor: '#DC2626', borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 12,},
  emergencyText: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  countdownContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  countdownText: { fontSize: 16, color: '#FFFFFF', marginLeft: 8 },
  cancelButton: { backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#DC2626' },
  sosContainer: { alignItems: 'center', paddingVertical: 40 },
  sosButton: { width: 200, height: 200, backgroundColor: '#B91C1C', borderRadius: 100, justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  sosButtonActive: { backgroundColor: '#7F1D1D' },
  sosButtonText: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginTop: 12 },
  sosInstructions: { fontSize: 16, color: '#FCA5A5', textAlign: 'center', paddingHorizontal: 40 },
  contactsSection: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#111827', marginBottom: 16 },
  quickActions: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingBottom: 20, paddingHorizontal: 20, gap: 12 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', paddingVertical: 16, borderRadius: 12, gap: 8 },
  actionButtonText: { fontSize: 16, fontWeight: '600', color: '#DC2626' },
});