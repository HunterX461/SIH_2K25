# Enhanced Multi-User Tracking and SOS System - Feature Guide

## New Features Implemented

### 1. Enhanced Tourist Tracking with Status

**New Database Fields:**
- `Tourist.status` - Tracks tourist status: "idle", "moving", or "emergency"

**Automatic Status Detection:**
- **Idle**: Tourist location hasn't changed significantly (< 0.001 degree change)
- **Moving**: Tourist location changed significantly (≥ 0.001 degree change)
- **Emergency**: Tourist has active SOS alert

**Backend Changes:**
- File: `geofencing_module/app.py`
- Line 41: Added `status` column to Tourist model
- Lines 247-280: Enhanced location update endpoint with automatic status detection
- Lines 282-299: Enhanced `/tourists/locations` to include status and emergency contact

### 2. SOS Alert Status Management

**New Database Fields:**
- `PanicAlert.status` - Tracks alert status: "active", "resolved", or "cancelled"
- `PanicAlert.resolved_at` - Timestamp when alert was resolved/cancelled

**Backend Features:**
- Automatic tourist status update to "emergency" when SOS sent
- Nearby tourist detection (within ~5km radius)
- Alert status tracking with resolution timestamps
- Tourist status reset when alert resolved/cancelled

**New API Endpoints:**
- `GET /alerts/active` - Get all currently active SOS alerts
- `PUT /alerts/{alert_id}/status` - Update alert status (resolve/cancel)

### 3. Nearby Tourist Alerting

When an SOS is sent, the system:
1. Identifies tourists within ~5km radius
2. Returns list of nearby tourists (max 5 shown)
3. Includes distance in kilometers for each nearby tourist
4. Provides count of total tourists alerted

## API Documentation

### Enhanced Location Update
```bash
POST /update_location
Authorization: Bearer {token}
Content-Type: application/json

{
  "latitude": 19.076,
  "longitude": 72.8777
}
```

**Response:**
```json
{
  "status": "success",
  "latitude": 19.076,
  "longitude": 72.8777,
  "tourist_id": 1,
  "user_status": "moving",
  "in_danger_zone": false
}
```

### Get All Tourist Locations (Enhanced)
```bash
GET /tourists/locations
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Test Tourist 1",
    "latitude": 19.08,
    "longitude": 72.88,
    "last_updated": "2025-10-06T05:53:09.349417",
    "status": "emergency",
    "emergency_contact": "+91-9876543210"
  },
  {
    "id": 2,
    "name": "Test Tourist 2",
    "latitude": 19.085,
    "longitude": 72.885,
    "last_updated": "2025-10-06T05:53:19.712406",
    "status": "idle",
    "emergency_contact": "+91-8765432109"
  }
]
```

### Enhanced SOS Alert
```bash
POST /sos
Authorization: Bearer {token}
Content-Type: application/json

{
  "latitude": 19.080,
  "longitude": 72.880,
  "message": "Need urgent help!"
}
```

**Response:**
```json
{
  "status": "sent",
  "alert_id": 1,
  "encrypted_message": "TmVlZCB1cmdlbnQgaGVscCE=",
  "nearest_police_station": {
    "name": "Andheri Police Station",
    "latitude": 19.1136,
    "longitude": 72.8697
  },
  "nearby_tourists_alerted": 1,
  "nearby_tourists": [
    {
      "id": 2,
      "name": "Test Tourist 2",
      "distance_km": 0.78
    }
  ],
  "timestamp": "2025-10-06T05:53:36.431316"
}
```

### Get Active SOS Alerts (NEW)
```bash
GET /alerts/active
```

**Response:**
```json
[
  {
    "id": 1,
    "tourist_id": 1,
    "tourist_name": "Test Tourist 1",
    "latitude": 19.08,
    "longitude": 72.88,
    "message": "Need urgent help!",
    "emergency_contact": "+91-9876543210",
    "timestamp": "2025-10-06T05:53:36.431316",
    "duration_minutes": 5
  }
]
```

### Update SOS Alert Status (NEW)
```bash
PUT /alerts/{alert_id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "alert_id": 1,
  "status": "resolved"
}
```

**Response:**
```json
{
  "status": "success",
  "alert_id": 1,
  "new_status": "resolved",
  "resolved_at": "2025-10-06T05:54:20.421963"
}
```

**Valid Status Values:**
- `active` - Alert is currently active
- `resolved` - Emergency has been resolved
- `cancelled` - Alert was cancelled by tourist

## Frontend Updates

### Maps Screen Enhancement
**File:** `ui/app/(tabs)/maps.tsx`

**New Features:**
- Color-coded tourist markers based on status:
  - 🔴 Red: Emergency status
  - 🟠 Orange: Moving
  - 🔵 Blue: Idle
- Enhanced legend showing all status types
- Tourist markers show status in title
- Emergency contact displayed in marker description

### Emergency Screen Enhancement
**File:** `ui/app/(tabs)/emergency.tsx`

**New Features:**
- Stores active alert ID after SOS sent
- Shows nearby tourists alerted count
- Cancel alert functionality updates backend status
- Automatic tourist status reset on cancel/resolve

### API Service Enhancement
**File:** `ui/app/services/apiService.ts`

**New Methods:**
- `getActiveAlerts()` - Fetch all active SOS alerts
- `updateAlertStatus()` - Update alert status
- Enhanced type definitions for all responses

## Testing the New Features

### 1. Test Enhanced Status Tracking

```bash
# Register two test users
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Tourist 1", "email": "tourist1@test.com", "password": "test123"}'

curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Tourist 2", "email": "tourist2@test.com", "password": "test123"}'

# Update location (first time - will be idle)
curl -X POST http://localhost:8000/update_location \
  -H "Authorization: Bearer {token1}" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 19.076, "longitude": 72.8777}'

# Update location again (moved - will be moving)
curl -X POST http://localhost:8000/update_location \
  -H "Authorization: Bearer {token1}" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 19.080, "longitude": 72.8800}'

# Check all tourist locations
curl http://localhost:8000/tourists/locations
```

### 2. Test Enhanced SOS System

```bash
# Position second tourist nearby
curl -X POST http://localhost:8000/update_location \
  -H "Authorization: Bearer {token2}" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 19.085, "longitude": 72.885}'

# Send SOS alert
curl -X POST http://localhost:8000/sos \
  -H "Authorization: Bearer {token1}" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 19.080, "longitude": 72.880, "message": "Emergency!"}'

# Check active alerts
curl http://localhost:8000/alerts/active

# Verify tourist status is now "emergency"
curl http://localhost:8000/tourists/locations

# Resolve the alert
curl -X PUT http://localhost:8000/alerts/1/status \
  -H "Authorization: Bearer {token1}" \
  -H "Content-Type: application/json" \
  -d '{"alert_id": 1, "status": "resolved"}'

# Verify status reset and no active alerts
curl http://localhost:8000/tourists/locations
curl http://localhost:8000/alerts/active
```

## Use Cases

### For Tourists
1. **Real-time status visibility**: See which tourists are moving, idle, or in emergency
2. **Nearby tourist awareness**: When sending SOS, know who nearby can help
3. **Alert management**: Cancel false alerts or mark emergencies as resolved

### For Authorities
1. **Active emergency dashboard**: Monitor all active SOS alerts in real-time
2. **Tourist activity monitoring**: Track which tourists are moving vs idle
3. **Response coordination**: See emergency contacts and nearby tourists for coordination

### For App Administrators
1. **System health monitoring**: Track active users and their locations
2. **Emergency response metrics**: Duration of emergencies, resolution rates
3. **User behavior analytics**: Movement patterns, emergency frequency

## Performance Considerations

- **Location Updates**: Every 30 seconds or 50 meters of movement
- **Status Detection**: Calculated on each location update (minimal overhead)
- **Nearby Tourist Search**: O(n) linear search, optimized for typical tourist counts
- **Active Alert Queries**: Limited to 50 most recent alerts
- **Database Indices**: Added on tourist_id, status fields for fast queries

## Security Notes

- Alert status can only be updated by the tourist who created it
- Tourist locations include emergency contacts (consider privacy in production)
- Active alerts endpoint is public (may need authentication in production)
- Nearby tourist alerting currently passive (consider push notifications in production)

## Future Enhancements

1. **Real-time Push Notifications**: Alert nearby tourists via push notifications
2. **WebSocket Support**: Real-time status updates without polling
3. **Geofence Integration**: Automatic danger zone alerts
4. **Alert Escalation**: Auto-escalate unresolved alerts to authorities
5. **Route History**: Track tourist movement patterns
6. **Heatmap Visualization**: Show emergency hotspots on map
7. **Alert Categories**: Different types of emergencies (medical, crime, accident, etc.)
8. **Multi-language Support**: Emergency messages in multiple languages

## Database Migration Notes

**Breaking Change:** The database schema has been updated with new columns.

**Required Actions:**
1. Backup existing database: `cp tourists.db tourists.db.backup`
2. Delete old database: `rm tourists.db`
3. Recreate with new schema: `python3 -c "from app import Base, engine; Base.metadata.create_all(bind=engine)"`
4. Reseed data: `python3 seed.py`

**Production Migration:**
For production systems, use proper database migrations:
```sql
ALTER TABLE tourists ADD COLUMN status VARCHAR DEFAULT 'idle';
ALTER TABLE panic_alerts ADD COLUMN status VARCHAR DEFAULT 'active';
ALTER TABLE panic_alerts ADD COLUMN resolved_at DATETIME;
```
