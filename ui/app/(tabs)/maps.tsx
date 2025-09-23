import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { MapPin, Navigation, CircleAlert as AlertCircle, Crosshair } from 'lucide-react-native';
import { useTranslation } from '../hooks/useTranslation';
import { safetyZones, dangerZones } from '../data/sampleData';

// Platform-specific imports
let MapView, Marker, Circle, PROVIDER_GOOGLE;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Circle = Maps.Circle;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
}

export default function MapsScreen() {
  const { t } = useTranslation();
  const mountedRef = useRef(true);
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [watchId, setWatchId] = useState<Location.LocationSubscription | null>(null);
  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    mountedRef.current = true;
    requestLocationPermission();
    return () => {
      mountedRef.current = false;
      if (watchId) {
        watchId.remove();
      }
    };
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Please enable location services to use maps features'
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      if (mountedRef.current) {
        setLocation(currentLocation);
        setRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }

      // Start watching location
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) => {
          if (mountedRef.current) {
            setLocation(newLocation);
            checkGeofences(newLocation.coords);
          }
        }
      );
      if (mountedRef.current) {
        setWatchId(subscription);
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const checkGeofences = (coords: Location.LocationObjectCoords) => {
    // Check if user entered dangerous zones
    dangerZones.forEach(zone => {
      const distance = getDistance(
        coords.latitude,
        coords.longitude,
        zone.latitude,
        zone.longitude
      );
      
      if (distance < zone.radius) {
        Alert.alert(
          'Safety Alert',
          `You are entering a high-risk area: ${zone.name}. Please be cautious.`,
          [{ text: 'OK' }]
        );
      }
    });
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

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

  // If on web platform, show web version
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        
        <View style={styles.webMapPlaceholder}>
          <MapPin size={64} color="#DC2626" />
          <Text style={styles.placeholderTitle}>Maps Feature</Text>
          <Text style={styles.placeholderText}>
            Interactive maps with real-time location tracking and safety zones are available on mobile devices.
          </Text>
          <Text style={styles.placeholderSubtext}>
            Please use the mobile app for full map functionality including GPS tracking and geofencing alerts.
          </Text>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>{t('map_legend')}</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
            <Text style={styles.legendText}>{t('safe_zones')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>{t('danger_zones')}</Text>
          </View>
        </View>
      </View>
    );
  }

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
        mapType="standard"
      >
        {/* User's current location */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title={t('your_location')}
            description={t('current_position')}
          />
        )}

        {/* Safety zones */}
        {safetyZones.map((zone, index) => (
          <React.Fragment key={`safe-${index}`}>
            <Circle
              center={{
                latitude: zone.latitude,
                longitude: zone.longitude,
              }}
              radius={zone.radius}
              strokeColor="rgba(34, 197, 94, 0.8)"
              fillColor="rgba(34, 197, 94, 0.2)"
              strokeWidth={2}
            />
            <Marker
              coordinate={{
                latitude: zone.latitude,
                longitude: zone.longitude,
              }}
              title={zone.name}
              description={`Safety Level: ${zone.safetyLevel}/10`}
              pinColor="green"
            />
          </React.Fragment>
        ))}

        {/* Danger zones */}
        {dangerZones.map((zone, index) => (
          <React.Fragment key={`danger-${index}`}>
            <Circle
              center={{
                latitude: zone.latitude,
                longitude: zone.longitude,
              }}
              radius={zone.radius}
              strokeColor="rgba(239, 68, 68, 0.8)"
              fillColor="rgba(239, 68, 68, 0.2)"
              strokeWidth={2}
            />
            <Marker
              coordinate={{
                latitude: zone.latitude,
                longitude: zone.longitude,
              }}
              title={zone.name}
              description={`Risk Level: ${zone.riskLevel}`}
              pinColor="red"
            />
          </React.Fragment>
        ))}
      </MapView>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={centerOnUser}>
          <Crosshair size={24} color="#DC2626" />
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>{t('map_legend')}</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
          <Text style={styles.legendText}>{t('safe_zones')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>{t('danger_zones')}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    gap: 12,
  },
  controlButton: {
    width: 56,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  legend: {
    position: 'absolute',
    top: 60,
    left: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#6B7280',
  },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});