import * as Location from 'expo-location';

class LocationService {
  private locationSubscription: Location.LocationSubscription | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      return await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  async startLocationTracking(
    callback: (location: Location.LocationObject) => void
  ): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return false;

      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        callback
      );

      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  stopLocationTracking(): void {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
  }

  async calculateSafetyScore(latitude: number, longitude: number): Promise<number> {
    // Mock AI-based safety scoring
    // In a real app, this would call your backend API with ML models
    
    // Simple algorithm based on coordinates and time
    const now = new Date();
    const hour = now.getHours();
    
    let baseScore = 75;
    
    // Time-based adjustments
    if (hour >= 22 || hour <= 5) {
      baseScore -= 15; // Night time
    } else if (hour >= 6 && hour <= 18) {
      baseScore += 10; // Daytime
    }
    
    // Location-based adjustments (simplified)
    const locationFactor = Math.sin(latitude) * Math.cos(longitude) * 100;
    const adjustment = Math.abs(locationFactor) % 20 - 10;
    
    const finalScore = Math.max(10, Math.min(100, baseScore + adjustment));
    
    return Math.round(finalScore);
  }

  getDistanceBetweenPoints(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
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
  }

  isPointInGeofence(
    pointLat: number,
    pointLon: number,
    centerLat: number,
    centerLon: number,
    radius: number
  ): boolean {
    const distance = this.getDistanceBetweenPoints(
      pointLat,
      pointLon,
      centerLat,
      centerLon
    );
    return distance <= radius;
  }
}

export const locationService = new LocationService();
export default locationService;