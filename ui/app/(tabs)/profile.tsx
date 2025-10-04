import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { User, CreditCard as Edit, MapPin } from 'lucide-react-native';
import { useTranslation } from '../hooks/useTranslation';
import { ProfileSection } from '../components/ProfileSection';
import { TouristIdCard } from '../components/TouristIdCard';
import { router } from 'expo-router'; // Import the router
import * as Location from 'expo-location'; // Import location library

// API URL - Make sure this is your computer's network IP address
const API_URL = 'http://10.232.121.138:8000'; 

export default function ProfileScreen() {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    emergencyContact: 'Jane Doe - +1 (555) 987-6543',
    touristId: 'TST-2025-001234',
    // You can keep other fields for UI purposes
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    nationality: 'USA',
    passportNumber: 'A12345678',
    currentLocation: 'San Francisco, CA',
    travelDates: '2025-01-15 to 2025-01-30',
    verificationStatus: 'Verified',
  });

  // This will store the raw numeric ID for API calls and to trigger location tracking
  const [numericTouristId, setNumericTouristId] = useState<number | null>(null);

  const handleSaveProfile = async () => {
    setIsEditing(false);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: profile.name, 
          emergency_contact: profile.emergencyContact 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register');
      }

      const data = await response.json();

      // Update the profile state for the UI
      setProfile({ ...profile, touristId: `TST-2025-${data.id}` });
      // Store the numeric ID for API calls
      setNumericTouristId(data.id);
      
      // THIS IS THE CRUCIAL LINE that shares the ID with the navigation layout
      router.setParams({ touristId: data.id.toString() });

      // Use standard web alert for browser compatibility
      alert(`Registration Success! Your new Tourist ID is: ${data.id}`);

    } catch (error) {
      console.error(error);
      alert('API Error: An error occurred while registering.');
    }
  };

  // This useEffect hook handles location tracking
  useEffect(() => {
    // It will only run when numericTouristId gets a value (i.e., after registration)
    if (numericTouristId === null) {
      return; // Do nothing if not registered
    }

    console.log(`Starting location tracking for tourist ID: ${numericTouristId}`);

    const startLocationTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied.');
        return;
      }

      const intervalId = setInterval(async () => {
        try {
          let location = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = location.coords;
          console.log(`Sending location for tourist ${numericTouristId}: ${latitude}, ${longitude}`);

          await fetch(`${API_URL}/update_location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tourist_id: numericTouristId,
              lat: latitude,
              lon: longitude,
            }),
          });
        } catch (error) {
          console.error("Failed to send location update:", error);
        }
      }, 30000); // Send update every 30 seconds

      return () => clearInterval(intervalId);
    };

    startLocationTracking();

  }, [numericTouristId]); // This dependency array ensures the effect runs only when the ID changes

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
  profileSections: { paddingHorizontal: 20, gap: 16 },
  infoRow: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 },
  value: { fontSize: 16, color: '#111827' },
  input: { fontSize: 16, color: '#111827', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FFFFFF' },
  saveSection: { padding: 20 },
  saveButton: { paddingVertical: 16, backgroundColor: '#059669', borderRadius: 12, alignItems: 'center' },
  saveButtonText: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
});