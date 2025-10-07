import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { User, CreditCard as Edit, MapPin, LogOut, Phone, Shield, Bell } from 'lucide-react-native';
import { useTranslation } from '../hooks/useTranslation';
import { ProfileSection } from '../components/ProfileSection';
import { TouristIdCard } from '../components/TouristIdCard';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || 'Guest User',
    emergencyContact: user?.emergency_contact || 'Not set',
    touristId: `TST-${user?.id || '000'}`,
    email: user?.email || 'guest@example.com',
    phone: '',
    nationality: '',
    passportNumber: '',
    currentLocation: '',
    travelDates: '',
    verificationStatus: user?.is_guest ? 'Guest' : 'Verified',
  });

  useEffect(() => {
    // Update profile when user changes
    if (user) {
      setProfile({
        name: user.name,
        emergencyContact: user.emergency_contact || 'Not set',
        touristId: `TST-${user.id}`,
        email: user.email,
        phone: '',
        nationality: '',
        passportNumber: '',
        currentLocation: '',
        travelDates: '',
        verificationStatus: user.is_guest ? 'Guest' : 'Verified',
      });
    }
  }, [user]);

  // This useEffect hook handles location tracking
  useEffect(() => {
    if (!user?.token) return;

    console.log(`Starting location tracking for user: ${user.name}`);

    const startLocationTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        const alertMsg = 'Permission to access location was denied.';
        if (Platform.OS === 'web') {
          alert(alertMsg);
        } else {
          Alert.alert('Permission Denied', alertMsg);
        }
        return;
      }

      const intervalId = setInterval(async () => {
        try {
          let location = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = location.coords;
          console.log(`Sending location: ${latitude}, ${longitude}`);

          await apiService.updateLocation(user.token, latitude, longitude);
        } catch (error) {
          console.error("Failed to send location update:", error);
        }
      }, 30000); // Send update every 30 seconds

      return () => clearInterval(intervalId);
    };

    startLocationTracking();

  }, [user]);

  const handleSaveProfile = () => {
    setIsEditing(false);
    const msg = 'Profile changes saved locally. Sync with backend in Settings.';
    if (Platform.OS === 'web') {
      alert(msg);
    } else {
      Alert.alert('Success', msg);
    }
  };

  const handleLogout = async () => {
    const confirmed = Platform.OS === 'web' 
      ? window.confirm('Are you sure you want to logout?')
      : true;

    if (Platform.OS !== 'web') {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Logout',
            onPress: async () => {
              await logout();
              router.replace('/login');
            }
          }
        ]
      );
    } else if (confirmed) {
      await logout();
      router.replace('/login');
    }
  };

  const handleEmergencyCall = async () => {
    const phoneNumber = profile.emergencyContact !== 'Not set' ? profile.emergencyContact : '+917821873078';
    const phoneUrl = `tel:${phoneNumber}`;
    
    try {
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', `Unable to make call. Please dial ${phoneNumber} manually.`);
      }
    } catch (error) {
      console.error('Error making call:', error);
      Alert.alert('Error', `Failed to initiate call. Please dial ${phoneNumber} manually.`);
    }
  };

  const navigateToEmergency = () => {
    router.push('/(tabs)/emergency');
  };

  const navigateToSettings = () => {
    router.push('/(tabs)/settings');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={48} color="#6B7280" />
            </View>
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.touristId}>Tourist ID: {profile.touristId}</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
          >
            <Edit size={16} color="#DC2626" />
            <Text style={styles.editButtonText}>
              {isEditing ? t('save') : t('edit_profile')}
            </Text>
          </TouchableOpacity>
        </View>

        <TouristIdCard profile={profile} />

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionCard} onPress={navigateToEmergency}>
              <Shield size={24} color="#DC2626" />
              <Text style={styles.quickActionText}>Emergency SOS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard} onPress={handleEmergencyCall}>
              <Phone size={24} color="#059669" />
              <Text style={styles.quickActionText}>Call Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard} onPress={navigateToSettings}>
              <Bell size={24} color="#7C3AED" />
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileSections}>
          <ProfileSection 
            title={t('personal_information')}
            icon={User}
          >
            <View style={styles.infoRow}>
              <Text style={styles.label}>{t('full_name')}</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={profile.name}
                  onChangeText={(text) => setProfile({...profile, name: text})}
                />
              ) : (
                <Text style={styles.value}>{profile.name}</Text>
              )}
            </View>
          </ProfileSection>
          
          <ProfileSection 
            title={t('travel_information')}
            icon={MapPin}
          >
            <View style={styles.infoRow}>
              <Text style={styles.label}>{t('emergency_contact')}</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={profile.emergencyContact}
                  onChangeText={(text) => setProfile({...profile, emergencyContact: text})}
                />
              ) : (
                <Text style={styles.value}>{profile.emergencyContact}</Text>
              )}
            </View>
          </ProfileSection>
        </View>

        {isEditing && (
          <View style={styles.saveSection}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
              <Text style={styles.saveButtonText}>{t('save_changes')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Logout Button */}
        <View style={styles.saveSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#DC2626" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// Your original styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollView: { flex: 1, paddingTop: 60 },
  header: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 32 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, backgroundColor: '#E5E7EB', borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  touristId: { fontSize: 16, color: '#6B7280', marginBottom: 16 },
  editButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#FEF2F2', borderRadius: 8, gap: 8 },
  editButtonText: { fontSize: 16, fontWeight: '600', color: '#DC2626' },
  quickActionsContainer: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#111827', marginBottom: 16 },
  quickActions: { flexDirection: 'row', gap: 12 },
  quickActionCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  quickActionText: { fontSize: 12, fontWeight: '600', color: '#374151', textAlign: 'center' },
  profileSections: { paddingHorizontal: 20, gap: 16 },
  infoRow: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 },
  value: { fontSize: 16, color: '#111827' },
  input: { fontSize: 16, color: '#111827', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FFFFFF' },
  saveSection: { padding: 20 },
  saveButton: { paddingVertical: 16, backgroundColor: '#059669', borderRadius: 12, alignItems: 'center' },
  saveButtonText: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, backgroundColor: '#FEF2F2', borderRadius: 12, gap: 8, borderWidth: 1, borderColor: '#FCA5A5' },
  logoutButtonText: { fontSize: 18, fontWeight: '600', color: '#DC2626' },
});