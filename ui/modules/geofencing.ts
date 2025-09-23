/**
 * Geofencing Module for Smart Tourist Safety Monitoring
 * 
 * This module provides comprehensive geofencing functionality including:
 * - Location tracking and zone monitoring
 * - Backend integration for location updates, SOS, and zone management
 * - Alert system integration for real-time notifications
 * - Extensible hooks for other modules to integrate with geofencing events
 * 
 * @author Generated for SIH 2K25 Tourist Safety App
 */

import { Alert } from 'react-native';
import * as Location from 'expo-location';

// Type definitions
export interface GeofenceZone {
  zone_id: string;
  name: string;
  risk_level: 'normal' | 'medium' | 'high';
  color: string;
  coordinates: Array<[number, number]>;
  type?: string;
}

export interface TouristLocation {
  tourist_id: string;
  lat: number;
  lon: number;
  timestamp: number;
}

export interface SOSRequest {
  tourist_id: string;
  message: string;
  lat?: number;
  lon?: number;
}

export interface GeofenceEvent {
  type: 'zone_enter' | 'zone_exit' | 'location_update' | 'sos_trigger';
  zone?: GeofenceZone;
  location?: TouristLocation;
  data?: any;
}

export type GeofenceCallback = (event: GeofenceEvent) => void;
export type AlertFunction = (type: 'warning' | 'info' | 'danger', message: string) => void;

// Configuration
interface GeofencingConfig {
  backendBaseUrl: string;
  touristId: string;
  enableLocationTracking: boolean;
  locationUpdateInterval: number; // milliseconds
  alertFunction?: AlertFunction;
}

/**
 * Main Geofencing Service Class
 */
class GeofencingService {
  private config: GeofencingConfig;
  private zones: GeofenceZone[] = [];
  private currentLocation: TouristLocation | null = null;
  private previousLocation: TouristLocation | null = null;
  private callbacks: GeofenceCallback[] = [];
  private locationSubscription: Location.LocationSubscription | null = null;
  private isInitialized = false;
  private touristData: any = {};

  constructor(config: Partial<GeofencingConfig> = {}) {
    this.config = {
      backendBaseUrl: config.backendBaseUrl || 'http://localhost:8000',
      touristId: config.touristId || `tourist_${Date.now()}`,
      enableLocationTracking: config.enableLocationTracking ?? true,
      locationUpdateInterval: config.locationUpdateInterval || 5000,
      alertFunction: config.alertFunction || this.defaultAlertFunction,
    };
  }

  /**
   * Default alert function using React Native Alert
   */
  private defaultAlertFunction: AlertFunction = (type, message) => {
    const title = type === 'danger' ? '⚠️ Alert' : type === 'warning' ? '⚠️ Warning' : 'ℹ️ Info';
    Alert.alert(title, message);
  };

  /**
   * Initialize the geofencing service
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      console.log('Geofencing service already initialized');
      return true;
    }

    try {
      console.log('Initializing geofencing service...');
      
      // Load zones from backend
      await this.loadZones();
      
      // Start location tracking if enabled
      if (this.config.enableLocationTracking) {
        await this.startLocationTracking();
      }
      
      this.isInitialized = true;
      console.log('Geofencing service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize geofencing service:', error);
      return false;
    }
  }

  /**
   * Load geofence zones from backend
   */
  async loadZones(): Promise<GeofenceZone[]> {
    try {
      const response = await fetch(`${this.config.backendBaseUrl}/map_zones`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load zones: ${response.status}`);
      }

      this.zones = await response.json();
      console.log(`Loaded ${this.zones.length} geofence zones`);
      return this.zones;
    } catch (error) {
      console.error('Error loading zones:', error);
      // Fall back to default zones if backend is unavailable
      this.zones = this.getDefaultZones();
      return this.zones;
    }
  }

  /**
   * Default zones for offline operation
   */
  private getDefaultZones(): GeofenceZone[] {
    return [
      {
        zone_id: 'safe_zone_1',
        name: 'Tourist Safe Zone',
        risk_level: 'normal',
        color: 'green',
        coordinates: [[0, 0], [0.01, 0], [0.01, 0.01], [0, 0.01]],
        type: 'safe',
      },
    ];
  }

  /**
   * Start location tracking
   */
  async startLocationTracking(): Promise<boolean> {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        this.config.alertFunction?.('warning', 'Location permission is required for geofencing to work properly.');
        return false;
      }

      // Start watching location
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: this.config.locationUpdateInterval,
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          this.handleLocationUpdate(location);
        }
      );

      console.log('Location tracking started');
      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  /**
   * Stop location tracking
   */
  stopLocationTracking(): void {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
      console.log('Location tracking stopped');
    }
  }

  /**
   * Handle location updates
   */
  private async handleLocationUpdate(location: Location.LocationObject): Promise<void> {
    const touristLocation: TouristLocation = {
      tourist_id: this.config.touristId,
      lat: location.coords.latitude,
      lon: location.coords.longitude,
      timestamp: Date.now(),
    };

    this.previousLocation = this.currentLocation;
    this.currentLocation = touristLocation;

    // Send location update to backend
    await this.sendLocationUpdate(touristLocation);

    // Check for zone transitions
    this.checkZoneTransitions();

    // Notify callbacks
    this.notifyCallbacks({
      type: 'location_update',
      location: touristLocation,
    });
  }

  /**
   * Send location update to backend
   */
  async sendLocationUpdate(location: TouristLocation): Promise<any> {
    try {
      const response = await fetch(`${this.config.backendBaseUrl}/update_location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tourist_id: location.tourist_id,
          lat: location.lat,
          lon: location.lon,
        }),
      });

      if (!response.ok) {
        throw new Error(`Location update failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Location updated successfully:', result);
      return result;
    } catch (error) {
      console.error('Error sending location update:', error);
      return null;
    }
  }

  /**
   * Check for zone transitions (entry/exit)
   */
  private checkZoneTransitions(): void {
    if (!this.currentLocation || !this.previousLocation) {
      return;
    }

    for (const zone of this.zones) {
      const wasInside = this.isPointInZone(this.previousLocation, zone);
      const isInside = this.isPointInZone(this.currentLocation, zone);

      if (!wasInside && isInside) {
        // Zone entry
        const alertType = zone.risk_level === 'high' ? 'danger' : 
                         zone.risk_level === 'medium' ? 'warning' : 'info';
        this.config.alertFunction?.(alertType, `You've entered ${zone.name} (${zone.risk_level} risk zone)`);
        
        this.notifyCallbacks({
          type: 'zone_enter',
          zone,
          location: this.currentLocation,
        });
      } else if (wasInside && !isInside) {
        // Zone exit
        this.config.alertFunction?.('info', `You've exited ${zone.name}`);
        
        this.notifyCallbacks({
          type: 'zone_exit',
          zone,
          location: this.currentLocation,
        });
      }
    }
  }

  /**
   * Check if a point is inside a zone (basic polygon check)
   */
  private isPointInZone(location: TouristLocation, zone: GeofenceZone): boolean {
    // Simple bounding box check for now - in production, use proper polygon containment
    const coords = zone.coordinates;
    if (coords.length < 3) return false;

    const minLat = Math.min(...coords.map(c => c[1]));
    const maxLat = Math.max(...coords.map(c => c[1]));
    const minLon = Math.min(...coords.map(c => c[0]));
    const maxLon = Math.max(...coords.map(c => c[0]));

    return location.lat >= minLat && location.lat <= maxLat &&
           location.lon >= minLon && location.lon <= maxLon;
  }

  /**
   * Send SOS request
   */
  async sendSOS(message: string = 'Emergency assistance needed'): Promise<boolean> {
    try {
      const sosRequest: SOSRequest = {
        tourist_id: this.config.touristId,
        message,
        lat: this.currentLocation?.lat,
        lon: this.currentLocation?.lon,
      };

      const response = await fetch(`${this.config.backendBaseUrl}/sos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sosRequest),
      });

      if (!response.ok) {
        throw new Error(`SOS request failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('SOS sent successfully:', result);
      
      this.config.alertFunction?.('info', 'Emergency alert sent successfully. Help is on the way.');
      
      this.notifyCallbacks({
        type: 'sos_trigger',
        data: result,
      });

      return true;
    } catch (error) {
      console.error('Error sending SOS:', error);
      this.config.alertFunction?.('danger', 'Failed to send emergency alert. Please try again or call local emergency services.');
      return false;
    }
  }

  /**
   * Register a callback for geofence events
   */
  onGeofenceEvent(callback: GeofenceCallback): () => void {
    this.callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify all registered callbacks
   */
  private notifyCallbacks(event: GeofenceEvent): void {
    this.callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in geofence callback:', error);
      }
    });
  }

  /**
   * Get current location
   */
  getCurrentLocation(): TouristLocation | null {
    return this.currentLocation;
  }

  /**
   * Get all zones
   */
  getZones(): GeofenceZone[] {
    return this.zones;
  }

  /**
   * Get tourist data
   */
  getTouristData(): any {
    return this.touristData;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<GeofencingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopLocationTracking();
    this.callbacks = [];
    this.isInitialized = false;
    console.log('Geofencing service destroyed');
  }
}

// Singleton instance
let geofencingService: GeofencingService | null = null;

/**
 * Get or create the singleton geofencing service instance
 */
export function getGeofencingService(config?: Partial<GeofencingConfig>): GeofencingService {
  if (!geofencingService) {
    geofencingService = new GeofencingService(config);
  }
  return geofencingService;
}

/**
 * Initialize geofencing service with default configuration
 */
export async function initializeGeofencing(config?: Partial<GeofencingConfig>): Promise<boolean> {
  const service = getGeofencingService(config);
  return await service.initialize();
}

/**
 * React hook for geofencing events
 */
export function useGeofencing() {
  const service = getGeofencingService();
  
  return {
    service,
    currentLocation: service.getCurrentLocation(),
    zones: service.getZones(),
    sendSOS: (message?: string) => service.sendSOS(message),
    onEvent: (callback: GeofenceCallback) => service.onGeofenceEvent(callback),
  };
}

// Export the service class and types
export { GeofencingService };
export default getGeofencingService;