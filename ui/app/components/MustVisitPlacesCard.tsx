import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { MapPin, Star } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import * as Location from 'expo-location';

interface MustVisitPlace {
  id: number;
  zone_id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  distance_km?: number;
}

export function MustVisitPlacesCard() {
  const { user } = useAuth();
  const [places, setPlaces] = useState<MustVisitPlace[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMustVisitPlaces = useCallback(async () => {
    try {
      setLoading(true);
      // Try to get user's location
      const { status } = await Location.requestForegroundPermissionsAsync();
      let lat, lon;
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        lat = location.coords.latitude;
        lon = location.coords.longitude;
      }
      
      // Fetch must-visit places (with or without location)
      const data = await apiService.getMustVisitPlaces(lat, lon, 100, user?.token);
      setPlaces(data.slice(0, 5)); // Show only top 5
    } catch (error) {
      console.error('Failed to fetch must-visit places:', error);
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    fetchMustVisitPlaces();
  }, [fetchMustVisitPlaces]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Star size={20} color="#F59E0B" />
          <Text style={styles.title}>Must Visit Places</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#DC2626" />
        </View>
      </View>
    );
  }

  if (places.length === 0) {
    return null; // Don't show the card if there are no places
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Star size={20} color="#F59E0B" />
        <Text style={styles.title}>Must Visit Places</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.placesScroll}>
        {places.map((place) => (
          <View key={place.id} style={styles.placeCard}>
            <View style={styles.placeIconContainer}>
              <MapPin size={20} color="#DC2626" />
            </View>
            <Text style={styles.placeName} numberOfLines={1}>{place.name}</Text>
            <Text style={styles.placeDescription} numberOfLines={2}>{place.description}</Text>
            {place.distance_km !== undefined && (
              <Text style={styles.placeDistance}>{place.distance_km.toFixed(1)} km away</Text>
            )}
          </View>
        ))}
      </ScrollView>
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
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  placesScroll: {
    flexDirection: 'row',
  },
  placeCard: {
    width: 160,
    marginRight: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  placeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  placeDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    minHeight: 32,
  },
  placeDistance: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '500',
  },
});

export default MustVisitPlacesCard;
