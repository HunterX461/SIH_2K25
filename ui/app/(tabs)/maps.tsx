import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { Crosshair } from 'lucide-react-native';
import { useTranslation } from '../hooks/useTranslation';
import { safetyZones, dangerZones } from '../data/sampleData';

// --- THIS IS THE CORRECTED IMPORT ---
// MapView and other components are NAMED exports, so they must be inside curly braces.
import { MapView, Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';

const API_URL = 'http://10.232.121.138:8000';

interface Tourist {
  id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

export default function MapsScreen() {
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [region, setRegion] = useState({
    latitude: 19.0760,
    longitude: 72.8777,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });
  const [allTourists, setAllTourists] = useState<Tourist[]>([]);

  useEffect(() => {
    let isMounted = true;
    let watchId: Location.LocationSubscription | null = null;

    const requestLocationPermission = async () => {
      // Your location permission logic here...
    };

    const fetchAllTourists = async () => {
      try {
        const response = await fetch(`${API_URL}/tourists`);
        if (!response.ok) return;
        const data: Tourist[] = await response.json();
        if (isMounted) {
          const locatedTourists = data.filter(t => t.latitude !== null && t.longitude !== null);
          setAllTourists(locatedTourists);
        }
      } catch (error) {
        console.error("Failed to fetch tourists:", error);
      }
    };
    
    requestLocationPermission();
    fetchAllTourists();
    const touristFetchInterval = setInterval(fetchAllTourists, 15000);

    return () => {
      isMounted = false;
      if (watchId) watchId.remove();
      clearInterval(touristFetchInterval);
    };
  }, []);
  
  const centerOnUser = () => {
      if (location && mapRef.current) {
          mapRef.current.animateToRegion({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
          });
      }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {allTourists.map(tourist => (
          <Marker
            key={`tourist-${tourist.id}`}
            coordinate={{ latitude: tourist.latitude!, longitude: tourist.longitude! }}
            title={tourist.name}
            description={`Tourist ID: ${tourist.id}`}
            pinColor="blue"
          />
        ))}
        {safetyZones.map((zone, index) => (
          <Circle key={`safe-${index}`} center={{ latitude: zone.latitude, longitude: zone.longitude }} radius={zone.radius} strokeColor="rgba(34, 197, 94, 0.8)" fillColor="rgba(34, 197, 94, 0.2)" />
        ))}
        {dangerZones.map((zone, index) => (
          <Circle key={`danger-${index}`} center={{ latitude: zone.latitude, longitude: zone.longitude }} radius={zone.radius} strokeColor="rgba(239, 68, 68, 0.8)" fillColor="rgba(239, 68, 68, 0.2)" />
        ))}
      </MapView>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={centerOnUser}>
          <Crosshair size={24} color="#DC2626" />
        </TouchableOpacity>
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>{t('map_legend')}</Text>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: 'blue' }]} /><Text style={styles.legendText}>Other Tourists</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} /><Text style={styles.legendText}>{t('safe_zones')}</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} /><Text style={styles.legendText}>{t('danger_zones')}</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    controls: { position: 'absolute', right: 16, bottom: 100, gap: 12 },
    controlButton: { width: 56, height: 56, backgroundColor: '#FFFFFF', borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    legend: { position: 'absolute', top: 60, left: 16, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    legendTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
    legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
    legendText: { fontSize: 14, color: '#6B7280' },
}); 