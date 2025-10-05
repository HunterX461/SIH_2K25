import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Shield, MapPin, RotateCcw } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useTranslation } from '../hooks/useTranslation';

interface SafetyScoreCardProps {
  score: number;
  location: Location.LocationObject | null;
  onRefresh: () => void;
}

export function SafetyScoreCard({ score, location, onRefresh }: SafetyScoreCardProps) {
  const { t } = useTranslation();

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#059669';
    if (score >= 60) return '#D97706';
    return '#DC2626';
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return 'Safe';
    if (score >= 60) return 'Caution';
    return 'High Risk';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('safety_score')}</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <RotateCcw size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.scoreContainer}>
        <View style={styles.scoreCircle}>
          <Shield size={32} color={getScoreColor(score)} />
          <Text style={[styles.scoreNumber, { color: getScoreColor(score) }]}>
            {score}
          </Text>
          <Text style={styles.scoreMax}>/ 100</Text>
        </View>
        
        <View style={styles.scoreInfo}>
          <Text style={[styles.scoreStatus, { color: getScoreColor(score) }]}>
            {getScoreText(score)}
          </Text>
          <Text style={styles.scoreDescription}>
            {t('current_area_safety')}
          </Text>
          {location && (
            <View style={styles.locationInfo}>
              <MapPin size={14} color="#6B7280" />
              <Text style={styles.locationText}>
                {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  refreshButton: {
    padding: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  scoreCircle: {
    alignItems: 'center',
    gap: 4,
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreMax: {
    fontSize: 14,
    color: '#6B7280',
  },
  scoreInfo: {
    flex: 1,
  },
  scoreStatus: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default SafetyScoreCard;