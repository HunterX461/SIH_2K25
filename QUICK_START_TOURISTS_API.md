# Quick Start Guide - /tourists Endpoint

## What Changed?

### ✅ New Endpoint Added
**GET /tourists** - Returns all active tourists with live location data

### ✅ Authentication Verified
- **POST /update_location** - Requires authentication ✓
- **POST /sos** - Requires authentication ✓

### ✅ Error-Free Operation Confirmed
All endpoints tested and working correctly.

---

## Quick Test

### 1. Start the API Server
```bash
cd geofencing_module
python3 app.py
```

### 2. Test the New Endpoint
```bash
curl http://localhost:8000/tourists
```

**Expected Response:**
```json
[]
```
_(Empty array if no tourists have updated location recently)_

---

## Complete Example

```bash
# 1. Register a user
TOKEN=$(curl -s -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@test.com", "password": "test123", "emergency_contact": "+1234567890"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

# 2. Update location (requires auth)
curl -X POST http://localhost:8000/update_location \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"latitude": 19.076, "longitude": 72.8777}'

# 3. Send SOS alert (requires auth)
curl -X POST http://localhost:8000/sos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"latitude": 19.076, "longitude": 72.8777, "message": "Help!"}'

# 4. Get all tourists (NEW endpoint - no auth required)
curl http://localhost:8000/tourists
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "name": "Test User",
    "latitude": 19.076,
    "longitude": 72.8777,
    "last_updated": "2025-10-06T09:39:50.202129",
    "status": "emergency",
    "emergency_contact": "+1234567890"
  }
]
```

---

## Testing Authentication

### Test Without Auth (Should Fail)
```bash
# This will return 401 error
curl -X POST http://localhost:8000/update_location \
  -H "Content-Type: application/json" \
  -d '{"latitude": 19.0, "longitude": 72.0}'
```

**Expected Response:**
```json
{
  "detail": "Not authenticated"
}
```

### Test With Invalid Token (Should Fail)
```bash
# This will return 403 error
curl -X POST http://localhost:8000/update_location \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid_token" \
  -d '{"latitude": 19.0, "longitude": 72.0}'
```

**Expected Response:**
```json
{
  "detail": "Could not validate credentials"
}
```

---

## API Endpoints Summary

### Public Endpoints (No Auth Required)
- `GET /` - API status
- `GET /tourists` - **NEW** - All active tourists
- `GET /tourists/locations` - All tourist locations (same as above)
- `GET /zones` - All geofenced zones
- `GET /police_stations` - All police stations
- `GET /alerts/active` - All active alerts

### Protected Endpoints (Auth Required)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user profile
- `POST /update_location` - Update user location ✅
- `POST /sos` - Send SOS alert ✅
- `POST /zones` - Create new zone
- `GET /alerts/history` - Get alert history
- `PUT /alerts/{id}/status` - Update alert status

---

## Frontend Integration

### In maps.web.tsx
```typescript
// This now works correctly!
const response = await fetch(`${API_URL}/tourists`);
const data: Tourist[] = await response.json();
setTouristCount(data.length);
```

### In apiService.ts
```typescript
// Existing method works
await apiService.getAllTouristLocations();

// Or use direct fetch
const response = await fetch('/tourists');
const tourists = await response.json();
```

---

## Documentation

For detailed information, see:
- **TOURISTS_ENDPOINT_GUIDE.md** - Comprehensive API documentation
- **IMPLEMENTATION_SUMMARY_TOURISTS.md** - Implementation details and testing results

---

## Support

### View API Documentation
```bash
# Start server first, then visit:
http://localhost:8000/docs
```

### Check Server Status
```bash
curl http://localhost:8000/
```

**Expected Response:**
```json
{
  "message": "Tourist Safety API",
  "status": "active"
}
```

---

## Troubleshooting

### Issue: Empty array returned from /tourists
**Solution:** Make sure at least one user has updated their location in the last 5 minutes.

### Issue: "Not authenticated" error
**Solution:** Include `Authorization: Bearer <token>` header for protected endpoints.

### Issue: Server not responding
**Solution:** Make sure the server is running: `cd geofencing_module && python3 app.py`

---

**Status:** ✅ Complete and Working  
**Last Updated:** October 6, 2025
