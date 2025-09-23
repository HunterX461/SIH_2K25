import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { User, CreditCard as Edit, Shield, IdCard, MapPin, Calendar } from 'lucide-react-native';
import { useTranslation } from '../hooks/useTranslation';
import { ProfileSection } from '../components/ProfileSection';
import { TouristIdCard } from '../components/TouristIdCard';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    nationality: 'USA',
    passportNumber: 'A12345678',
    emergencyContact: 'Jane Doe - +1 (555) 987-6543',
    currentLocation: 'San Francisco, CA',
    travelDates: '2025-01-15 to 2025-01-30',
    touristId: 'TST-2025-001234',
    verificationStatus: 'Verified',
  });

  const handleSaveProfile = () => {
    setIsEditing(false);
    Alert.alert('Profile Updated', 'Your profile has been successfully updated.');
  };

  const handleVerifyIdentity = () => {
    Alert.alert(
      'Identity Verification',
      'Please upload a clear photo of your passport or government-issued ID.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upload', onPress: () => {
          Alert.alert('Success', 'Identity verification initiated. You will be notified once verified.');
        }}
      ]
    );
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
            <View style={styles.verificationBadge}>
              <Shield size={16} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.touristId}>Tourist ID: {profile.touristId}</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Edit size={16} color="#DC2626" />
            <Text style={styles.editButtonText}>
              {isEditing ? t('save') : t('edit_profile')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tourist ID Card */}
        <TouristIdCard profile={profile} />

        {/* Profile Information */}
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
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>{t('email')}</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={profile.email}
                  onChangeText={(text) => setProfile({...profile, email: text})}
                  keyboardType="email-address"
                />
              ) : (
                <Text style={styles.value}>{profile.email}</Text>
              )}
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>{t('phone')}</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={profile.phone}
                  onChangeText={(text) => setProfile({...profile, phone: text})}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.value}>{profile.phone}</Text>
              )}
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>{t('nationality')}</Text>
              <Text style={styles.value}>{profile.nationality}</Text>
            </View>
          </ProfileSection>

          <ProfileSection 
            title={t('identification')}
            icon={IdCard}
          >
            <View style={styles.infoRow}>
              <Text style={styles.label}>{t('passport_number')}</Text>
              <Text style={styles.value}>{profile.passportNumber}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>{t('verification_status')}</Text>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusBadge,
                  profile.verificationStatus === 'Verified' && styles.verifiedBadge
                ]}>
                  <Text style={[
                    styles.statusText,
                    profile.verificationStatus === 'Verified' && styles.verifiedText
                  ]}>
                    {profile.verificationStatus}
                  </Text>
                </View>
              </View>
            </View>
            
            {profile.verificationStatus !== 'Verified' && (
              <TouchableOpacity 
                style={styles.verifyButton}
                onPress={handleVerifyIdentity}
              >
                <Text style={styles.verifyButtonText}>{t('verify_identity')}</Text>
              </TouchableOpacity>
            )}
          </ProfileSection>

          <ProfileSection 
            title={t('travel_information')}
            icon={MapPin}
          >
            <View style={styles.infoRow}>
              <Text style={styles.label}>{t('current_location')}</Text>
              <Text style={styles.value}>{profile.currentLocation}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>{t('travel_dates')}</Text>
              <Text style={styles.value}>{profile.travelDates}</Text>
            </View>
            
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    backgroundColor: '#E5E7EB',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    backgroundColor: '#059669',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  touristId: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  profileSections: {
    paddingHorizontal: 20,
    gap: 16,
  },
  infoRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#111827',
  },
  input: {
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
  },
  verifiedBadge: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  verifiedText: {
    color: '#065F46',
  },
  verifyButton: {
    marginTop: 12,
    paddingVertical: 12,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveSection: {
    padding: 20,
  },
  saveButton: {
    paddingVertical: 16,
    backgroundColor: '#059669',
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});