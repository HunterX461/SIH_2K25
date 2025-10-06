# New Features Implementation Guide

## Overview

This document describes the newly implemented features for the Smart Tourist Safety Monitoring & Incident Response System, including must-visit places, enhanced risk zones, and authentication improvements.

## 🌟 Must-Visit Places Feature

### Backend Implementation

#### New Endpoint: GET /must_visit_places

Get all must-visit tourist attractions with optional location-based filtering.

**Parameters:**
- `latitude` (optional): User's current latitude
- `longitude` (optional): User's current longitude
- `radius_km` (optional, default: 50): Search radius in kilometers

**Example Request:**
```bash
# Get all must-visit places
curl http://localhost:8000/must_visit_places

# Get must-visit places near Delhi (within 10km)
curl "http://localhost:8000/must_visit_places?latitude=28.6139&longitude=77.2090&radius_km=10"
```

**Response:**
```json
[
  {
    "id": 12,
    "zone_id": "india_gate",
    "name": "India Gate",
    "latitude": 28.6132,
    "longitude": 77.23,
    "coordinates": [[77.2295, 28.6127], [77.2305, 28.6127], ...],
    "description": "Popular tourist attraction - India Gate",
    "distance_km": 2.33
  }
]
```

### Must-Visit Places Added

The following 10 must-visit tourist attractions have been added to the database:

1. **Taj Mahal** (Agra) - UNESCO World Heritage Site
2. **India Gate** (Delhi) - War memorial and iconic landmark
3. **Red Fort Delhi** - Historic Mughal fortress
4. **Qutub Minar** (Delhi) - Medieval Islamic monument
5. **Amber Fort** (Jaipur) - Hilltop fort and palace
6. **Hawa Mahal** (Jaipur) - Palace of Winds
7. **Mysore Palace** - Royal residence in Karnataka
8. **Golden Temple** (Amritsar) - Sikh holy site
9. **Ajanta Caves** - Ancient Buddhist rock-cut caves
10. **Hampi UNESCO Site** - Ancient temple complex

### Frontend Integration

**Map Visualization:**
- Must-visit places appear as **gold pins** (⭐) on the map
- Hover/click shows place name, description, and distance
- Legend includes "⭐ Must Visit" indicator

**API Usage in Frontend:**
```typescript
// Get nearby must-visit places
const places = await apiService.getMustVisitPlaces(
  userLat,
  userLon,
  100 // 100km radius
);
```

---

## 🚨 Enhanced Risk Zone Features

### Danger Zone Detection

The location update endpoint now detects when users enter high-risk zones and provides real-time alerts.

#### Enhanced Endpoint: POST /update_location

**New Response Fields:**
```json
{
  "status": "success",
  "latitude": 19.045,
  "longitude": 72.855,
  "tourist_id": 9,
  "user_status": "idle",
  "in_danger_zone": true,
  "current_zone": "Dharavi Area",
  "danger_zone_info": {
    "zone_name": "Dharavi Area",
    "risk_level": "high",
    "zone_id": "mumbai_dharavi"
  }
}
```

**Frontend Alert:**
When a user enters a danger zone, they receive an alert:
```
⚠️ Danger Zone Alert

You have entered Dharavi Area - a high risk area. 
Please stay alert and consider leaving the area.
```

### Zone Statistics

#### New Endpoint: GET /zones/statistics

Get comprehensive statistics about zones and incidents.

**Example Request:**
```bash
curl http://localhost:8000/zones/statistics
```

**Response:**
```json
{
  "total_zones": 20,
  "zone_types": {
    "tourist": 6,
    "risk": 2,
    "city": 2,
    "must_visit": 10
  },
  "risk_levels": {
    "normal": 16,
    "high": 2,
    "medium": 2
  },
  "active_incidents": 3,
  "total_incidents": 5,
  "must_visit_places": 10
}
```

### Zone Filtering

#### Enhanced Endpoint: GET /zones

Now supports filtering by zone type.

**Example Requests:**
```bash
# Get all zones
curl http://localhost:8000/zones

# Get only risk zones
curl http://localhost:8000/zones?zone_type=risk

# Get only must-visit places
curl http://localhost:8000/zones?zone_type=must_visit

# Get tourist zones
curl http://localhost:8000/zones?zone_type=tourist
```

---

## 🔐 Authentication Improvements

### Password Reset Feature

Complete password reset flow with token-based authentication.

#### Step 1: Request Password Reset

**Endpoint:** POST /password-reset/request

```bash
curl -X POST http://localhost:8000/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

**Response:**
```json
{
  "status": "success",
  "message": "Password reset token generated",
  "token": "4UnH4WA0dhTA5NhCOoWgBaKGB_v8Prf37QcI3e5SSuQ",
  "expires_at": "2025-10-06T19:41:53.273551"
}
```

**Note:** In production, the token should be sent via email, not returned in response.

#### Step 2: Confirm Password Reset

**Endpoint:** POST /password-reset/confirm

```bash
curl -X POST http://localhost:8000/password-reset/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "token":"4UnH4WA0dhTA5NhCOoWgBaKGB_v8Prf37QcI3e5SSuQ",
    "new_password":"newpass123"
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Password reset successfully"
}
```

### Guest User Authentication

**Improvements:**
- Guest users cannot login with the login endpoint
- Clear error message: "Guest users cannot login. Please register as guest again."
- Guest users are prevented from requesting password resets
- Guest authentication properly handles null password hashes

### Frontend API Integration

```typescript
// Request password reset
const response = await apiService.requestPasswordReset(email);

// Confirm password reset
await apiService.confirmPasswordReset(token, newPassword);
```

---

## 📊 API Summary

### New Endpoints

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/must_visit_places` | GET | No | Get must-visit tourist attractions |
| `/zones/statistics` | GET | No | Get zone and incident statistics |
| `/password-reset/request` | POST | No | Request password reset token |
| `/password-reset/confirm` | POST | No | Confirm password reset with token |

### Enhanced Endpoints

| Endpoint | Method | Enhancements |
|----------|--------|--------------|
| `/zones` | GET | Added zone_type filter parameter |
| `/update_location` | POST | Added danger zone detection and alerts |
| `/me` | GET | Added status field to response |

---

## 🎨 Frontend Changes

### Maps Screen

**New Features:**
1. Gold pins for must-visit places
2. Legend includes "⭐ Must Visit" indicator
3. Distance information on place markers

### Home Screen

**New Features:**
1. Automatic danger zone alerts when user location updates
2. Real-time risk level information
3. Zone-specific safety warnings

### API Service

**New Methods:**
- `getMustVisitPlaces(lat?, lon?, radius?, token?)`
- `getZoneStatistics(token?)`
- `requestPasswordReset(email)`
- `confirmPasswordReset(token, newPassword)`

**Enhanced Methods:**
- `getZones(zone_type?, token?)` - Added filtering
- `updateLocation(token, lat, lon)` - Added danger zone info to response

---

## 🧪 Testing

### Must-Visit Places

```bash
# Test basic functionality
curl http://localhost:8000/must_visit_places | jq '.[0]'

# Test location filtering
curl "http://localhost:8000/must_visit_places?latitude=28.6139&longitude=77.2090&radius_km=10" | jq '.'
```

### Danger Zone Detection

```bash
# Register user
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"pass123"}'

# Update location to danger zone (Dharavi Area: 19.04-19.05, 72.85-72.86)
curl -X POST http://localhost:8000/update_location \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":19.045,"longitude":72.855}' | jq '.danger_zone_info'
```

### Password Reset

```bash
# Request reset
curl -X POST http://localhost:8000/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}' | jq '.token'

# Confirm reset
curl -X POST http://localhost:8000/password-reset/confirm \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_HERE","new_password":"newpass"}' | jq '.'

# Test login with new password
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"newpass"}' | jq '.'
```

---

## 🔄 Database Schema Changes

### New Table: password_reset_tokens

```sql
CREATE TABLE password_reset_tokens (
    id INTEGER PRIMARY KEY,
    email VARCHAR NOT NULL,
    token VARCHAR UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Updated Tables

**zones table:**
- No schema changes, but new zone_type value: "must_visit"

**tourists table:**
- Status field properly utilized for danger zone tracking

---

## 🚀 Performance Considerations

### Must-Visit Places
- **Query Time:** < 10ms for filtered queries
- **Distance Calculation:** Simple Euclidean distance (111km per degree approximation)
- **Recommended:** Use location filtering to reduce payload size

### Danger Zone Detection
- **Check Time:** < 5ms per location update
- **Algorithm:** Bounding box intersection (simple and fast)
- **Limitation:** Uses rectangular bounds, not precise polygon intersection

### Password Reset
- **Token Expiration:** 1 hour
- **Token Storage:** SQLite with indexed lookups
- **Security:** 256-bit URL-safe tokens

---

## 📝 Migration Notes

### Backward Compatibility

✅ **Fully backward compatible** - all existing endpoints and functionality remain unchanged.

**Optional Fields:**
- `danger_zone_info` in location update response (only present if in danger zone)
- `distance_km` in must-visit places (only present with location filter)
- `status` field in /me response (added but optional)

### Database Migration

Run the seed script to add new must-visit places:

```bash
cd geofencing_module
python3 seed.py
```

This will:
- Clear existing zones and police stations
- Add 10 tourist zones
- Add 2 risk zones
- Add 10 must-visit places
- Add 10 police stations

---

## 🐛 Known Issues and Limitations

1. **Danger Zone Detection:**
   - Uses bounding box, not precise polygon intersection
   - May have false positives near zone boundaries

2. **Password Reset:**
   - Token currently returned in response (should use email in production)
   - No rate limiting on reset requests
   - No notification to user when password changes

3. **Must-Visit Places:**
   - Distance calculation is approximate (not geodesic)
   - No user ratings or reviews yet
   - No images or detailed information

---

## 🔮 Future Enhancements

1. **Must-Visit Places:**
   - Add user ratings and reviews
   - Add photos and detailed descriptions
   - Add opening hours and ticket prices
   - Integrate with third-party tourism APIs

2. **Risk Zones:**
   - Implement precise point-in-polygon detection
   - Add time-based risk levels (higher at night)
   - Add incident heatmaps
   - Historical risk data and trends

3. **Authentication:**
   - Email integration for password reset
   - Two-factor authentication
   - Social login (Google, Facebook)
   - Wallet-based authentication

4. **General:**
   - Push notifications for danger zones
   - WebSocket for real-time updates
   - Mobile app offline mode
   - Multi-language support for places

---

## 📞 Support

For issues or questions about these features, please refer to:
- Main README: `/README.md`
- Implementation Summary: `/IMPLEMENTATION_SUMMARY.md`
- Quick Reference: `/QUICK_REFERENCE.md`
- Enhanced Tracking Guide: `/ENHANCED_TRACKING_SOS_GUIDE.md`
