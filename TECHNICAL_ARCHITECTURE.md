# Technical Architecture & Implementation Guide

## Table of Contents
1. [Offline Support Strategy](#offline-support-strategy)
2. [Geofencing Implementation](#geofencing-implementation)
3. [Risk Zone Management](#risk-zone-management)

---

## Offline Support Strategy

### Challenge
Tourists may enter areas with poor or no network connectivity, but they still need access to critical safety features and information.

### Technical Solutions

#### 1. **Local Data Caching**
- **Implementation**: Use AsyncStorage (React Native) or IndexedDB (Web) to cache essential data
- **Cached Data Includes**:
  - User profile and emergency contacts
  - Last known safety zones and danger zones
  - Must-visit places within a reasonable radius
  - Recent SOS alerts and incident history
  - Map tiles for offline viewing

```typescript
// Example implementation in locationService.ts
const cacheZoneData = async (zones: Zone[]) => {
  await AsyncStorage.setItem('cached_zones', JSON.stringify({
    data: zones,
    timestamp: Date.now(),
    expiresIn: 24 * 60 * 60 * 1000 // 24 hours
  }));
};

const getCachedZoneData = async () => {
  const cached = await AsyncStorage.getItem('cached_zones');
  if (cached) {
    const { data, timestamp, expiresIn } = JSON.parse(cached);
    if (Date.now() - timestamp < expiresIn) {
      return data;
    }
  }
  return null;
};
```

#### 2. **Offline Queue for Actions**
- **Implementation**: Queue critical actions when offline and sync when connection is restored
- **Queued Actions**:
  - Location updates
  - SOS alerts (with highest priority)
  - Profile changes

```typescript
// Example offline queue implementation
interface QueuedAction {
  id: string;
  type: 'location_update' | 'sos_alert' | 'profile_update';
  data: any;
  timestamp: number;
  priority: number;
}

const offlineQueue: QueuedAction[] = [];

const addToQueue = (action: QueuedAction) => {
  offlineQueue.push(action);
  offlineQueue.sort((a, b) => b.priority - a.priority);
};

const processQueue = async () => {
  while (offlineQueue.length > 0) {
    const action = offlineQueue[0];
    try {
      await executeAction(action);
      offlineQueue.shift();
    } catch (error) {
      break; // Stop if connection fails
    }
  }
};
```

#### 3. **Offline SOS Mechanism**
- **SMS Fallback**: Use device's SMS capability to send emergency messages
- **Local Notifications**: Alert user when SOS cannot be sent due to no connection
- **GPS Coordinates Storage**: Store last known location for later transmission

```typescript
// Emergency SMS fallback
const sendOfflineSOS = async (location: Location, emergencyContact: string) => {
  const message = `EMERGENCY ALERT! I need help. Last known location: ${location.coords.latitude}, ${location.coords.longitude}. Timestamp: ${new Date().toISOString()}`;
  
  // Use Linking API to open SMS app
  const smsUrl = `sms:${emergencyContact}?body=${encodeURIComponent(message)}`;
  await Linking.openURL(smsUrl);
  
  // Store in queue for backend sync when online
  addToQueue({
    id: Date.now().toString(),
    type: 'sos_alert',
    data: { location, message },
    timestamp: Date.now(),
    priority: 10 // Highest priority
  });
};
```

#### 4. **Offline Map Tiles**
- **Implementation**: Pre-download map tiles for frequently visited areas
- **Library**: Use `react-native-offline-maps` or similar
- **Strategy**: Download tiles when connected, use cached tiles when offline

#### 5. **Background Sync**
- **Implementation**: Use Background Fetch API to sync data when connection is available
- **Synced Data**: Location history, cached SOS alerts, zone updates

```typescript
// Background sync registration
BackgroundFetch.configure({
  minimumFetchInterval: 15, // minutes
  stopOnTerminate: false,
  startOnBoot: true,
}, async (taskId) => {
  console.log('[BackgroundFetch] Event received');
  await processQueue();
  BackgroundFetch.finish(taskId);
});
```

#### 6. **Connection Status Monitoring**
```typescript
import NetInfo from '@react-native-community/netinfo';

const [isOnline, setIsOnline] = useState(true);

useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    setIsOnline(state.isConnected);
    if (state.isConnected) {
      processQueue(); // Sync queued actions
    }
  });
  
  return () => unsubscribe();
}, []);
```

---

## Geofencing Implementation

### Overview
Geofencing is implemented using a combination of GPS location tracking, polygon geometry calculations, and real-time zone detection.

### Architecture

#### 1. **Zone Definition**
Zones are defined as polygons with coordinates stored in the database:

```python
# Backend: app.py
class Zone(Base):
    __tablename__ = "zones"
    
    id = Column(Integer, primary_key=True)
    zone_id = Column(String, unique=True)
    name = Column(String)
    risk_level = Column(String)  # 'low', 'medium', 'high'
    zone_type = Column(String)   # 'safe', 'danger', 'must_visit'
    coordinates = Column(String) # JSON: [[lng, lat], [lng, lat], ...]
```

#### 2. **Location Tracking Flow**

```
Tourist Device (GPS) → Mobile App → API Endpoint (/update_location) 
                                           ↓
                                    Zone Detection Engine
                                           ↓
                                    Check Tourist in Zones
                                           ↓
                      ┌─────────────────────┼─────────────────────┐
                      ↓                     ↓                     ↓
                In Danger Zone      In Safe Zone         In Must-Visit
                      ↓                     ↓                     ↓
                Alert Tourist         Update Status        Suggest Place
```

#### 3. **Zone Detection Algorithm**

```python
# geofencing_module/core/geofence.py
from shapely.geometry import Point, Polygon

def is_point_in_zone(latitude: float, longitude: float, zone_coords: List[List[float]]) -> bool:
    """
    Check if a point is inside a polygon zone
    Uses ray-casting algorithm via shapely library
    """
    point = Point(longitude, latitude)  # Note: shapely uses (x, y) = (lng, lat)
    polygon = Polygon(zone_coords)
    return polygon.contains(point)

def get_zone_for_location(latitude: float, longitude: float, zones: List[Zone]) -> Optional[Zone]:
    """
    Find which zone a location falls into
    Returns the first matching zone (prioritize danger zones)
    """
    # Sort zones by priority: danger > safe > must_visit
    sorted_zones = sorted(zones, key=lambda z: zone_priority(z.risk_level), reverse=True)
    
    for zone in sorted_zones:
        coords = json.loads(zone.coordinates)
        if is_point_in_zone(latitude, longitude, coords):
            return zone
    
    return None
```

#### 4. **Real-Time Location Updates**

```typescript
// Mobile App: locationService.ts
class LocationService {
  private watchId: number | null = null;
  
  startTracking(onLocationUpdate: (location: Location) => void) {
    this.watchId = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 30000,      // Update every 30 seconds
        distanceInterval: 50,     // Or when moved 50 meters
      },
      async (location) => {
        onLocationUpdate(location);
        
        // Send to backend for zone detection
        if (user?.token) {
          const response = await apiService.updateLocation(
            user.token,
            location.coords.latitude,
            location.coords.longitude
          );
          
          // Handle zone transition alerts
          if (response.in_danger_zone) {
            this.triggerDangerAlert(response.danger_zone_info);
          }
        }
      }
    );
  }
  
  stopTracking() {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
  }
}
```

#### 5. **Zone Transition Detection**

```python
# Backend: app.py
@app.post("/update_location")
def update_location(
    location: LocationUpdate,
    current_user: Tourist = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Update tourist location in database
    current_user.latitude = location.latitude
    current_user.longitude = location.longitude
    current_user.last_updated = datetime.utcnow()
    
    # Detect zone transitions
    zones = db.query(Zone).all()
    current_zone = get_zone_for_location(
        location.latitude, 
        location.longitude, 
        zones
    )
    
    response = {
        "status": "success",
        "latitude": location.latitude,
        "longitude": location.longitude,
        "in_danger_zone": False,
        "danger_zone_info": None
    }
    
    if current_zone and current_zone.risk_level in ['high', 'medium']:
        response["in_danger_zone"] = True
        response["danger_zone_info"] = {
            "zone_id": current_zone.zone_id,
            "zone_name": current_zone.name,
            "risk_level": current_zone.risk_level
        }
        
        # Update tourist status
        current_user.status = "in_danger_zone"
        
        # Optionally notify nearby authorities
        notify_nearby_police(location.latitude, location.longitude, current_user)
    
    db.commit()
    return response
```

---

## Risk Zone Management

### How Risk Zones Are Updated

#### 1. **Data Sources**
- Police incident reports
- Crime statistics APIs
- Tourist feedback and reports
- Historical incident data
- Government advisory systems

#### 2. **Update Mechanism**

```python
# Backend: Zone Update Endpoint
@app.put("/zones/{zone_id}")
def update_zone(
    zone_id: str,
    zone_update: ZoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)  # Admin only
):
    zone = db.query(Zone).filter(Zone.zone_id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    # Update zone properties
    zone.risk_level = zone_update.risk_level
    zone.name = zone_update.name
    zone.coordinates = json.dumps(zone_update.coordinates)
    
    db.commit()
    
    # Broadcast update to all connected tourists in the zone
    broadcast_zone_update(zone)
    
    return {"status": "success", "zone": zone}
```

#### 3. **Automated Risk Assessment**

```python
def calculate_zone_risk(zone_id: str, db: Session) -> str:
    """
    Calculate risk level based on recent incidents
    """
    recent_incidents = db.query(Incident)\
        .filter(Incident.zone_id == zone_id)\
        .filter(Incident.timestamp >= datetime.utcnow() - timedelta(days=30))\
        .all()
    
    incident_count = len(recent_incidents)
    severity_score = sum(incident.severity for incident in recent_incidents)
    
    if incident_count > 10 or severity_score > 50:
        return 'high'
    elif incident_count > 5 or severity_score > 25:
        return 'medium'
    else:
        return 'low'
```

#### 4. **Police and Tourist Perspectives**

##### For Police/Authorities:
- **Dashboard**: Web interface to view all tourists' locations in real-time
- **Zone Management**: Create, update, and delete safety/danger zones
- **Alert Response**: Receive SOS alerts with tourist location and emergency contact
- **Analytics**: View zone statistics and incident reports

```python
@app.get("/police/dashboard")
def police_dashboard(db: Session = Depends(get_db)):
    """
    Police dashboard showing all active tourists and alerts
    """
    active_tourists = db.query(Tourist)\
        .filter(Tourist.last_updated >= datetime.utcnow() - timedelta(minutes=5))\
        .all()
    
    active_alerts = db.query(PanicAlert)\
        .filter(PanicAlert.status == 'active')\
        .all()
    
    zones = db.query(Zone).all()
    
    return {
        "tourists": active_tourists,
        "alerts": active_alerts,
        "zones": zones,
        "statistics": get_zone_statistics(db)
    }
```

##### For Tourists:
- **Real-time Tracking**: GPS location sent every 30 seconds or 50 meters
- **Zone Alerts**: Notifications when entering danger zones
- **SOS Button**: One-tap emergency alert with location
- **Map View**: Visual representation of safe/danger zones
- **Must-Visit Places**: Recommendations based on location

### Geofencing Accuracy Considerations

1. **GPS Accuracy**: ±5-10 meters in good conditions
2. **Zone Buffer**: Add 10-20 meter buffer to zone boundaries to account for GPS drift
3. **Update Frequency**: Balance between battery life and accuracy (30 seconds default)
4. **Indoor Limitations**: GPS less accurate indoors, rely on last known location

### Performance Optimization

```python
# Use spatial indexing for faster zone lookups
from sqlalchemy import Index

# Add spatial index to zones table
Index('idx_zone_coordinates', Zone.coordinates)

# Use R-tree or similar spatial data structure for O(log n) lookups
# instead of checking every zone polygon
```

---

## Implementation Status

✅ **Implemented**:
- Real-time location tracking
- Zone detection (point-in-polygon)
- Danger zone alerts
- SOS system with backend integration
- Tourist location visualization on maps
- Must-visit places API

🚧 **In Progress**:
- Offline data caching
- SMS fallback for offline SOS
- Background sync
- Offline map tiles

📋 **Planned**:
- Automated risk assessment based on incidents
- Police/authority dashboard
- Advanced analytics and reporting
- Multi-language zone descriptions

---

## Developer Notes

### Testing Geofencing Locally

```bash
# 1. Start the backend
cd geofencing_module
python app.py

# 2. Create test zones
curl -X POST http://localhost:8000/zones \
  -H "Content-Type: application/json" \
  -d '{
    "zone_id": "test_danger_1",
    "name": "Test Danger Zone",
    "risk_level": "high",
    "zone_type": "danger",
    "coordinates": [[72.8777, 19.0760], [72.8777, 19.0780], [72.8797, 19.0780], [72.8797, 19.0760], [72.8777, 19.0760]]
  }'

# 3. Simulate location updates
curl -X POST http://localhost:8000/update_location \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 19.0770, "longitude": 72.8787}'
```

### Mobile App Testing

```typescript
// Test zone detection
const testLocation = {
  latitude: 19.0770,
  longitude: 72.8787
};

const response = await apiService.updateLocation(
  user.token,
  testLocation.latitude,
  testLocation.longitude
);

console.log('In danger zone:', response.in_danger_zone);
console.log('Zone info:', response.danger_zone_info);
```

---

## References

- [Shapely Documentation](https://shapely.readthedocs.io/) - Geometry operations
- [React Native Geolocation](https://docs.expo.dev/versions/latest/sdk/location/) - Location tracking
- [Point-in-Polygon Algorithm](https://en.wikipedia.org/wiki/Point_in_polygon) - Zone detection theory
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) - Offline caching

---

*Last Updated: 2024*
