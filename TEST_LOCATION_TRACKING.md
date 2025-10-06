# Live Multi-User Location Tracking and SOS Phone Call - Testing Guide

## Features Implemented

### 1. Live Multi-User Location Tracking
- **Backend**: New endpoint `GET /tourists/locations` returns all active tourists
- **Mobile App**: Automatic location updates every 30 seconds or 50 meters of movement
- **Map Display**: Shows all tourists as blue markers with real-time updates every 10 seconds
- **Active Tracking**: Only shows tourists who updated location within last 5 minutes

### 2. SOS Phone Call Feature
- **Emergency Call Button**: Prominent button on Emergency screen
- **Phone Number**: +91 7821873078
- **Quick Action**: Also available in footer quick actions
- **Platform Support**: Works on iOS and Android using native tel: URL scheme

## Backend API

### Get All Tourist Locations
```bash
GET /tourists/locations
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Test User 1",
    "latitude": 19.076,
    "longitude": 72.8777,
    "last_updated": "2025-10-06T05:04:18.342577"
  }
]
```

### Update Location (Auto-triggered)
```bash
POST /update_location
Authorization: Bearer {token}
Content-Type: application/json

{
  "latitude": 19.076,
  "longitude": 72.8777
}
```

## Testing Steps

### 1. Start Backend
```bash
cd geofencing_module
pip3 install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] pydantic[email]
python3 seed.py
python3 app.py
```

### 2. Register Test Users
```bash
# User 1
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Tourist 1", "email": "tourist1@example.com", "password": "test123"}'

# User 2
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Tourist 2", "email": "tourist2@example.com", "password": "test123"}'
```

### 3. Update Locations
```bash
# Update User 1 location
curl -X POST http://localhost:8000/update_location \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token1}" \
  -d '{"latitude": 19.076, "longitude": 72.8777}'

# Update User 2 location
curl -X POST http://localhost:8000/update_location \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token2}" \
  -d '{"latitude": 19.085, "longitude": 72.885}'
```

### 4. Fetch All Locations
```bash
curl http://localhost:8000/tourists/locations
```

### 5. Test Mobile App
1. Start the mobile app: `cd ui && npm run dev`
2. Login or register a user
3. Navigate to Maps tab - see your location and other tourists
4. Navigate to Emergency tab
5. Click "Call Emergency: +91 7821873078" button
6. Verify phone dialer opens with the number

## Mobile App Behavior

### Location Tracking
- App requests location permissions on startup
- Tracks location automatically every 30 seconds
- Updates backend with current coordinates
- No user interaction required after initial permission

### Map Display
- Your location: Blue dot (native map marker)
- Other tourists: Blue markers with name
- Safety zones: Green circles
- Danger zones: Red circles
- Auto-refreshes every 10 seconds

### Emergency Features
- **SOS Button**: Large red button for emergency alerts
- **Emergency Call**: Direct call button to +91 7821873078
- **Quick Actions**: Call and message buttons for emergency contacts
- **Countdown**: Shows 30-second countdown after SOS sent

## Technical Details

### Backend Changes
- File: `geofencing_module/app.py`
- Lines 246-270: Added location update with timestamp
- Lines 272-287: New `/tourists/locations` endpoint
- Active users determined by `created_at` timestamp

### Frontend Changes
- **apiService.ts**: Added `getAllTouristLocations()` method
- **maps.tsx**: 
  - Lines 40-79: Location tracking with auto-update
  - Lines 80-94: Fetch tourists every 10 seconds
  - Lines 102-110: Display tourist markers
- **emergency.tsx**:
  - Line 1: Added Linking import
  - Lines 160-177: Emergency call handler
  - Lines 195-200: Emergency call button UI

### Performance Considerations
- Location updates: Every 30 seconds (configurable)
- Tourist fetch: Every 10 seconds (configurable)
- Active threshold: 5 minutes (configurable)
- Distance threshold: 50 meters (configurable)

## Troubleshooting

### Location Not Updating
- Check location permissions granted
- Verify backend is running (port 8000)
- Check API_BASE_URL in apiService.ts
- Verify token is valid

### Phone Call Not Working
- Ensure device has phone capabilities
- Check phone permissions granted
- On simulator: Click will show error (expected)
- On real device: Should open dialer

### Tourists Not Appearing on Map
- Verify tourists have updated location recently (within 5 minutes)
- Check backend logs for errors
- Verify network connectivity
- Check tourist fetch interval is active

## Security Notes
- Phone number is hardcoded in emergency.tsx
- Location data sent over HTTP (use HTTPS in production)
- JWT tokens expire after 30 minutes
- No encryption on location data (add in production)

## Future Enhancements
- WebSocket for real-time updates
- Geofence breach notifications
- Route history tracking
- Emergency contact auto-SMS
- Multi-language support for emergency call
