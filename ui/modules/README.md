# Geofencing Module Documentation

## Overview

The Geofencing Module provides comprehensive location-based zone monitoring and alert functionality for the Smart Tourist Safety Monitoring system. It integrates seamlessly with the React/Next.js TypeScript app without requiring any HTML modifications.

## Architecture

### Core Components

1. **GeofencingService** - Main service class managing location tracking and zone monitoring
2. **Backend Integration** - Handles communication with geofencing API endpoints
3. **Alert System** - Integrates with React Native Alert API for notifications
4. **React Hooks** - Provides easy integration for React components
5. **Extension System** - Allows other modules to extend functionality

### Key Features

- ✅ **Global Initialization** - Automatically starts on app launch via `_layout.tsx`
- ✅ **Location Tracking** - Real-time GPS monitoring with expo-location
- ✅ **Zone Management** - Loads and monitors geofence zones from backend
- ✅ **Transition Detection** - Alerts on zone entry/exit events
- ✅ **SOS Integration** - Emergency alert system with backend communication
- ✅ **Type Safety** - Full TypeScript support with comprehensive interfaces
- ✅ **Extensibility** - Callback system for module integration
- ✅ **Error Handling** - Graceful fallbacks and offline operation

## Installation & Setup

### 1. Module Files

The geofencing module consists of:
- `ui/modules/geofencing.ts` - Main module implementation
- `ui/modules/geofencing-example.ts` - Integration examples (optional)

### 2. Global Initialization

The module is automatically initialized in `ui/app/_layout.tsx`:

```typescript
import { initializeGeofencing } from '@/modules/geofencing';

// Initialize with default configuration
const initialized = await initializeGeofencing({
  backendBaseUrl: process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  enableLocationTracking: true,
  locationUpdateInterval: 5000, // 5 seconds
});
```

### 3. Environment Variables

Add to your `.env` file:
```
EXPO_PUBLIC_BACKEND_URL=https://your-backend-url.com
```

## API Reference

### Core Service

#### `getGeofencingService(config?)`
Returns the singleton geofencing service instance.

```typescript
import { getGeofencingService } from '@/modules/geofencing';

const service = getGeofencingService({
  backendBaseUrl: 'https://api.example.com',
  touristId: 'user123',
  enableLocationTracking: true,
  locationUpdateInterval: 10000
});
```

#### `initializeGeofencing(config?)`
Initializes the geofencing service with optional configuration.

```typescript
const success = await initializeGeofencing({
  backendBaseUrl: 'https://api.example.com',
  alertFunction: (type, message) => customAlert(type, message)
});
```

### React Hook

#### `useGeofencing()`
React hook for accessing geofencing functionality in components.

```typescript
import { useGeofencing } from '@/modules/geofencing';

function MyComponent() {
  const { service, currentLocation, zones, sendSOS, onEvent } = useGeofencing();
  
  // Subscribe to events
  useEffect(() => {
    const unsubscribe = onEvent((event) => {
      console.log('Geofence event:', event);
    });
    return unsubscribe;
  }, [onEvent]);
  
  // Send emergency alert
  const handleEmergency = () => sendSOS('Emergency assistance needed');
  
  return (
    <div>
      <p>Location: {currentLocation?.lat}, {currentLocation?.lon}</p>
      <p>Zones: {zones.length} active</p>
      <button onClick={handleEmergency}>Send SOS</button>
    </div>
  );
}
```

### Service Methods

#### Location Management
- `getCurrentLocation()` - Get current location
- `startLocationTracking()` - Start GPS tracking
- `stopLocationTracking()` - Stop GPS tracking

#### Zone Management
- `getZones()` - Get all loaded zones
- `loadZones()` - Reload zones from backend

#### Emergency Features
- `sendSOS(message?)` - Send emergency alert to backend

#### Event System
- `onGeofenceEvent(callback)` - Subscribe to geofencing events
- Returns unsubscribe function for cleanup

#### Configuration
- `updateConfig(config)` - Update service configuration
- `destroy()` - Cleanup all resources

## Backend Integration

### API Endpoints

The module integrates with these backend endpoints:

#### POST `/update_location`
Updates tourist location on backend.

```typescript
// Request
{
  tourist_id: string,
  lat: number,
  lon: number
}

// Response
{
  status: string,
  alerts?: any[]
}
```

#### GET `/map_zones`
Retrieves geofence zones with color coding.

```typescript
// Response
[
  {
    zone_id: string,
    name: string,
    risk_level: 'normal' | 'medium' | 'high',
    color: string,
    coordinates: Array<[number, number]>
  }
]
```

#### POST `/sos`
Sends emergency alert request.

```typescript
// Request
{
  tourist_id: string,
  message: string,
  lat?: number,
  lon?: number
}

// Response
{
  status: string,
  encrypted_message?: string,
  to?: string
}
```

## Type Definitions

### Core Interfaces

```typescript
interface GeofenceZone {
  zone_id: string;
  name: string;
  risk_level: 'normal' | 'medium' | 'high';
  color: string;
  coordinates: Array<[number, number]>;
  type?: string;
}

interface TouristLocation {
  tourist_id: string;
  lat: number;
  lon: number;
  timestamp: number;
}

interface GeofenceEvent {
  type: 'zone_enter' | 'zone_exit' | 'location_update' | 'sos_trigger';
  zone?: GeofenceZone;
  location?: TouristLocation;
  data?: any;
}

type GeofenceCallback = (event: GeofenceEvent) => void;
type AlertFunction = (type: 'warning' | 'info' | 'danger', message: string) => void;
```

## Extension System

### Creating Extensions

Other modules can extend geofencing functionality by subscribing to events:

```typescript
import { getGeofencingService } from '@/modules/geofencing';

class MyExtension {
  initialize() {
    const service = getGeofencingService();
    
    service.onGeofenceEvent((event) => {
      if (event.type === 'zone_enter') {
        this.handleZoneEntry(event);
      }
    });
  }
  
  private handleZoneEntry(event) {
    // Custom logic for zone entry
    console.log(`Entered zone: ${event.zone?.name}`);
  }
}
```

### Available Events

- `zone_enter` - User enters a geofence zone
- `zone_exit` - User exits a geofence zone  
- `location_update` - Location coordinates updated
- `sos_trigger` - Emergency alert sent

### Custom Alert Functions

Replace the default alert system:

```typescript
service.updateConfig({
  alertFunction: (type, message) => {
    // Custom notification system
    showToast(message, type);
  }
});
```

## Configuration Options

```typescript
interface GeofencingConfig {
  backendBaseUrl: string;           // Backend API URL
  touristId: string;                // Unique tourist identifier
  enableLocationTracking: boolean;  // Enable GPS tracking
  locationUpdateInterval: number;   // Update interval in milliseconds
  alertFunction?: AlertFunction;    // Custom alert handler
}
```

## Error Handling

The module includes comprehensive error handling:

- **Permission Denied** - Graceful fallback when location access denied
- **Network Errors** - Offline operation with default zones
- **Backend Unavailable** - Local-only operation mode
- **Invalid Coordinates** - Validation and sanitization
- **Service Failures** - Automatic retry and recovery

## Performance Considerations

- **Efficient Location Updates** - Configurable intervals and distance thresholds
- **Memory Management** - Automatic cleanup of subscriptions
- **Battery Optimization** - Uses expo-location's efficient tracking
- **Network Usage** - Batched updates and offline caching

## Testing

The module is production-ready and has been tested with:
- ✅ TypeScript compilation (no errors)
- ✅ Expo build system (successful web build)
- ✅ React Native Alert integration
- ✅ expo-location compatibility
- ✅ Backend API integration

## Troubleshooting

### Common Issues

1. **Location Permission Denied**
   - Module will show alert and disable tracking
   - Check device location settings

2. **Backend Connection Failed**
   - Module falls back to default zones
   - Check `backendBaseUrl` configuration

3. **No Zones Loaded**
   - Verify backend `/map_zones` endpoint
   - Check network connectivity

### Debug Mode

Enable console logging to see detailed operation:

```typescript
// Module logs all operations to console
console.log('Geofencing service initialized successfully');
```

## Production Deployment

### Environment Setup
1. Configure `EXPO_PUBLIC_BACKEND_URL` environment variable
2. Ensure backend CORS is configured for your domain
3. Test location permissions on target devices

### Backend Requirements
- HTTPS endpoint (required for location services)
- CORS headers configured
- All three API endpoints implemented (/update_location, /sos, /map_zones)

### Security Considerations
- Tourist IDs should be properly authenticated
- SOS messages are encrypted by backend
- Location data is transmitted securely via HTTPS

## License

This module is part of the SIH 2K25 Smart Tourist Safety Monitoring system.