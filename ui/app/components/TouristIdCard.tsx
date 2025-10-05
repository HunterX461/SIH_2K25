import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Shield, MapPin, Calendar } from 'lucide-react-native';

interface TouristIdCardProps {
  profile: {
    name: string;
    nationality: string;
    touristId: string;
    currentLocation: string;
    travelDates: string;
    verificationStatus: string;
  };
}

export function TouristIdCard({ profile }: TouristIdCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.cardHeader}>
        <View style={styles.logoContainer}>
          <Shield size={24} color="#FFFFFF" />
        </View>
        <View style={styles.cardTitle}>
          <Text style={styles.cardTitleText}>TOURIST ID</Text>
          <Text style={styles.cardSubtitle}>Digital Safety Pass</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.profileRow}>
          <View style={styles.profileImage}>
            <Text style={styles.initials}>
              {profile.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileNationality}>{profile.nationality}</Text>
            <Text style={styles.touristIdNumber}>{profile.touristId}</Text>
          </View>
          <View style={styles.verificationBadge}>
            <Shield size={16} color="#FFFFFF" />
          </View>
        </View>
        
        <View style={styles.travelInfo}>
          <View style={styles.infoItem}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.infoText}>{profile.currentLocation}</Text>
          </View>
          <View style={styles.infoItem}>
            <Calendar size={16} color="#6B7280" />
            <Text style={styles.infoText}>{profile.travelDates}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.footerText}>Valid • Verified • Emergency Ready</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#DC2626',
  },
  logoContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    flex: 1,
  },
  cardTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#FCA5A5',
  },
  cardContent: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    backgroundColor: '#DC2626',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  initials: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  profileNationality: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  touristIdNumber: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  verificationBadge: {
    width: 32,
    height: 32,
    backgroundColor: '#059669',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  travelInfo: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
  },
  cardFooter: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default TouristIdCard;