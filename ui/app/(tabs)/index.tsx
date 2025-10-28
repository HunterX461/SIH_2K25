import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MapPin, AlertTriangle, Users } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useTranslation } from '../hooks/useTranslation';
import { SafetyScoreCard } from '../components/SafetyScoreCard';
import { QuickActionCard } from '../components/QuickActionCard';
import { RecentAlertsCard } from '../components/RecentAlertsCard';
import { MustVisitPlaces } from '../components/MustVisitPlaces';
import { locationService } from '../services/locationService';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/apiService';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { theme, colors } = useTheme();
  const router = useRouter();
  const mountedRef = useRef(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [safetyScore, setSafetyScore] = useState(85);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for safety monitoring');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      if (mountedRef.current) {
        setLocation(currentLocation);
      }
      
      // Update location on backend if user is authenticated
      if (user?.token) {
        try {
          const response = await apiService.updateLocation(
            user.token,
            currentLocation.coords.latitude,
            currentLocation.coords.longitude
          );
          
          // Check if user entered a danger zone
          if (response.in_danger_zone && response.danger_zone_info) {
            const zoneInfo = response.danger_zone_info;
            Alert.alert(
              '⚠️ Danger Zone Alert',
              `You have entered ${zoneInfo.zone_name} - a ${zoneInfo.risk_level} risk area. Please stay alert and consider leaving the area.`,
              [{ text: 'OK', style: 'default' }]
            );
          }
        } catch (error) {
          console.error('Error updating location on backend:', error);
        }
      }
      
      // Calculate safety score for current area
      const score = await locationService.calculateSafetyScore(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
      if (mountedRef.current) {
        setSafetyScore(score);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    getCurrentLocation();
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const quickActions = [
    {
      icon: AlertTriangle,
      title: t('emergency_sos'),
      subtitle: t('instant_help'),
      color: '#DC2626',
      onPress: () => router.push('/(tabs)/emergency')
    },
    {
      icon: MapPin,
      title: t('track_location'),
      subtitle: t('real_time_monitoring'),
      color: '#059669',
      onPress: () => router.push('/(tabs)/maps')
    },
    {
      icon: Users,
      title: t('emergency_contacts'),
      subtitle: t('manage_contacts'),
      color: '#7C3AED',
      onPress: () => router.push('/(tabs)/profile')
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('tourist_safety')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('stay_safe_travel_smart')}</Text>
        </View>

        <SafetyScoreCard 
          score={safetyScore} 
          location={location}
          onRefresh={getCurrentLocation}
        />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('quick_actions')}</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action, index) => (
              <QuickActionCard key={index} {...action} />
            ))}
          </View>
        </View>

        <MustVisitPlaces />

        <RecentAlertsCard />
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
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  quickActions: {
    gap: 12,
  },
});
