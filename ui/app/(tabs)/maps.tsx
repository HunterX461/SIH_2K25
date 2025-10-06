import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { Crosshair } from 'lucide-react-native';
import { useTranslation } from '../hooks/useTranslation';
import { MapView, Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { mustVisitPlaces } from '../data/sampleData';

interface Tourist {
  id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
  status?: string;
  emergency_contact?: string;
}

interface Zone {
  zone_id: string;
  name: string;
  risk_level: string;
  zone_type: string;
  color: string;
  coordinates: number[][];
}

export default function MapsScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [region, setRegion] = useState({
    latitude: 19.0760,
    longitude: 72.8777,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });
  const [zones, setZones] = useState<Zone[]>([]);
  const [allTourists, setAllTourists] = useState<Tourist[]>([]);
  const [safetyZones, setSafetyZones] = useState<any[]>([]);
  const [dangerZones, setDangerZones] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    let watchId: Location.LocationSubscription | null = null;

    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted' && isMounted) {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        setRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });

        // Start watching location and auto-update to backend
        watchId = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 30000, // Every 30 seconds
            distanceInterval: 50, // Or every 50 meters
          },
          async (newLocation) => {
            if (isMounted) {
              setLocation(newLocation);
              // Auto-update location to backend
              if (user?.token) {
                try {
                  await apiService.updateLocation(
                    user.token,
                    newLocation.coords.latitude,
                    newLocation.coords.longitude
                  );
                } catch (error) {
                  console.error('Failed to update location:', error);
                }
              }
            }
          }
        );
      }
    };

    const fetchZones = async () => {
      try {
        const data = await apiService.getZones(user?.token);
        if (isMounted) {
          setZones(data);
          // Separate zones by risk level
          const safe = data.filter(z => z.risk_level === 'normal');
          const danger = data.filter(z => z.risk_level === 'high' || z.risk_level === 'medium');
          
          // Convert to circle format (simplified - using first coordinate)
          setSafetyZones(safe.map(z => ({
            latitude: z.coordinates[0]?.[1] || 0,
            longitude: z.coordinates[0]?.[0] || 0,
            radius: 500
          })));
          setDangerZones(danger.map(z => ({
            latitude: z.coordinates[0]?.[1] || 0,
            longitude: z.coordinates[0]?.[0] || 0,
            radius: 500
          })));
        }
      } catch (error) {
        console.error("Failed to fetch zones:", error);
      }
    };

    const fetchTourists = async () => {
      try {
        const data = await apiService.getAllTouristLocations(user?.token);
        if (isMounted) {
          setAllTourists(data.filter(t => t.latitude !== null && t.longitude !== null));
        }
      } catch (error) {
        console.error("Failed to fetch tourists:", error);
      }
    };
    
    requestLocationPermission();
    fetchZones();
    fetchTourists();
    
    const zonesFetchInterval = setInterval(fetchZones, 30000);
    const touristFetchInterval = setInterval(fetchTourists, 10000); // Every 10 seconds

    return () => {
      isMounted = false;
      if (watchId) watchId.remove();
      clearInterval(zonesFetchInterval);
      clearInterval(touristFetchInterval);
    };
  }, [user?.token]);
  
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
        {allTourists.map(tourist => {
          // Color based on status: red for emergency, orange for moving, blue for idle
          const pinColor = tourist.status === 'emergency' ? 'red' : 
                          tourist.status === 'moving' ? 'orange' : 'blue';
          const statusText = tourist.status === 'emergency' ? ' 🚨 EMERGENCY' : 
                            tourist.status === 'moving' ? ' (Moving)' : ' (Idle)';
          return (
            <Marker
              key={`tourist-${tourist.id}`}
              coordinate={{ latitude: tourist.latitude!, longitude: tourist.longitude! }}
              title={tourist.name + statusText}
              description={`Tourist ID: ${tourist.id}${tourist.emergency_contact ? '\nContact: ' + tourist.emergency_contact : ''}`}
              pinColor={pinColor}
            />
          );
        })}
        {safetyZones.map((zone, index) => (
          <Circle key={`safe-${index}`} center={{ latitude: zone.latitude, longitude: zone.longitude }} radius={zone.radius} strokeColor="rgba(34, 197, 94, 0.8)" fillColor="rgba(34, 197, 94, 0.2)" />
        ))}
        {dangerZones.map((zone, index) => (
          <Circle key={`danger-${index}`} center={{ latitude: zone.latitude, longitude: zone.longitude }} radius={zone.radius} strokeColor="rgba(239, 68, 68, 0.8)" fillColor="rgba(239, 68, 68, 0.2)" />
        ))}
        {mustVisitPlaces.map((place) => (
          <Marker
            key={`place-${place.id}`}
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            title={`⭐ ${place.name}`}
            description={`${place.category} • ${place.rating}★\n${place.description}`}
            pinColor="green"
          />
        ))}
      </MapView>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={centerOnUser}>
          <Crosshair size={24} color="#DC2626" />
        </TouchableOpacity>
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>{t('map_legend')}</Text>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: 'red' }]} /><Text style={styles.legendText}>Emergency 🚨</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: 'orange' }]} /><Text style={styles.legendText}>Moving</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: 'blue' }]} /><Text style={styles.legendText}>Idle</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} /><Text style={styles.legendText}>{t('safe_zones')}</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} /><Text style={styles.legendText}>{t('danger_zones')}</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: 'green' }]} /><Text style={styles.legendText}>Must-Visit ⭐</Text></View>
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