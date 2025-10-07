import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TriangleAlert as AlertTriangle, Phone, MessageSquare, Shield, Clock } from 'lucide-react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '../hooks/useTranslation';
import { EmergencyContactCard } from '../components/EmergencyContactCard';
import { emergencyContacts } from '../data/sampleData';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

export default function EmergencyScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const mountedRef = useRef(true);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [activeAlertId, setActiveAlertId] = useState<number | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    getCurrentLocation();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          setCountdown(countdown - 1);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({});
      if (mountedRef.current) {
        setLocation(currentLocation);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const triggerEmergencyAlert = () => {
    if (!user) {
      showAlert('Error', 'Please login to send SOS alerts');
      return;
    }

    const isConfirmed = Platform.OS === 'web'
      ? window.confirm('Emergency SOS\n\nThis will send your location to all emergency contacts and authorities. Are you sure?')
      : true;

    if (Platform.OS !== 'web') {
      Alert.alert(
        'Emergency SOS',
        'This will send your location to all emergency contacts and authorities. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Send SOS', 
            style: 'destructive',
            onPress: () => {
              if (mountedRef.current) {
                setIsEmergencyActive(true);
                setCountdown(30);
              }
              sendEmergencyAlert();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }
          }
        ]
      );
    } else if (isConfirmed) {
      if (mountedRef.current) {
        setIsEmergencyActive(true);
        setCountdown(30);
      }
      sendEmergencyAlert();
    }
  };

  const sendEmergencyAlert = async () => {
    if (!user?.token) return;

    try {
      const currentLoc = location || await Location.getCurrentPositionAsync({});
      const result = await apiService.sendSOS(
        user.token,
        currentLoc.coords.latitude,
        currentLoc.coords.longitude,
        'Emergency SOS Alert!'
      );

      console.log('SOS sent:', result);
      
      if (mountedRef.current) {
        setActiveAlertId(result.alert_id);
        const nearbyInfo = result.nearby_tourists_alerted 
          ? `\n\n${result.nearby_tourists_alerted} nearby tourists alerted!` 
          : '';
        showAlert(
          'SOS Sent Successfully!',
          `Your emergency contacts have been notified. Help is on the way!\n\nNearest station: ${result.nearest_police_station?.name || 'Unknown'}${nearbyInfo}`
        );
      }
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      if (mountedRef.current) {
        showAlert('Error', 'Failed to send emergency alert. Please try again.');
      }
    }
  };

  const cancelEmergencyAlert = async () => {
    const isConfirmed = Platform.OS === 'web'
      ? window.confirm('Are you sure you want to cancel the emergency alert?')
      : true;

    const performCancel = async () => {
      if (mountedRef.current) {
        setIsEmergencyActive(false);
        setCountdown(0);
      }
      
      // Update alert status on backend
      if (user?.token && activeAlertId) {
        try {
          await apiService.updateAlertStatus(user.token, activeAlertId, 'cancelled');
          setActiveAlertId(null);
          console.log('Alert cancelled successfully');
        } catch (error) {
          console.error('Error cancelling alert:', error);
        }
      }
    };

    if (Platform.OS !== 'web') {
      Alert.alert(
        'Cancel Alert',
        'Are you sure you want to cancel the emergency alert?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes',
            onPress: performCancel
          }
        ]
      );
    } else if (isConfirmed) {
      await performCancel();
    }
  };

  const handleEmergencyCall = async () => {
    const phoneNumber = '+917821873078';
    const phoneUrl = `tel:${phoneNumber}`;
    
    try {
      const canOpen = await Linking.canOpenURL(phoneUrl);
      
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        showAlert('Error', 'Unable to make phone call. Please dial +91 7821873078 manually.');
      }
    } catch (error) {
      console.error('Error making emergency call:', error);
      showAlert('Error', 'Failed to initiate call. Please dial +91 7821873078 manually.');
    }
  };

  const handleSendMessage = async () => {
    const phoneNumber = '+917821873078';
    const message = 'EMERGENCY: I need immediate assistance. Please help!';
    const smsUrl = Platform.OS === 'ios' 
      ? `sms:${phoneNumber}&body=${encodeURIComponent(message)}`
      : `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
    
    try {
      const canOpen = await Linking.canOpenURL(smsUrl);
      
      if (canOpen) {
        await Linking.openURL(smsUrl);
      } else {
        showAlert('Error', 'Unable to open messaging app. Please send a message to +91 7821873078 manually.');
      }
    } catch (error) {
      console.error('Error opening messaging app:', error);
      showAlert('Error', 'Failed to open messaging app. Please send a message to +91 7821873078 manually.');
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
        <TouchableOpacity
          style={styles.emergencyCallButton}
          onPress={handleEmergencyCall}
        >
          <Phone size={28} color="#FFFFFF" />
          <Text style={styles.emergencyCallText}>Call Emergency: +91 7821873078</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.contactsSection}>
        <Text style={styles.sectionTitle}>{t('emergency_contacts')}</Text>
        {emergencyContacts.map((contact, index) => (
          <EmergencyContactCard key={index} contact={contact} />
        ))}
      </View>
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleEmergencyCall}>
          <Phone size={24} color="#DC2626" />
          <Text style={styles.actionButtonText}>{t('call_police')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleSendMessage}>
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
  emergencyCallButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7F1D1D', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 12, marginTop: 20, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  emergencyCallText: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  contactsSection: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#111827', marginBottom: 16 },
  quickActions: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingBottom: 20, paddingHorizontal: 20, gap: 12 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', paddingVertical: 16, borderRadius: 12, gap: 8 },
  actionButtonText: { fontSize: 16, fontWeight: '600', color: '#DC2626' },
});