# Enhanced Tracking & SOS - Quick Reference Card

## 🚀 Quick Start

### Backend Setup
```bash
cd geofencing_module
rm -f tourists.db  # Only if schema changed
python3 -c "from app import Base, engine; Base.metadata.create_all(bind=engine)"
python3 seed.py
python3 app.py
```

### Frontend Setup
```bash
cd ui
npm install --legacy-peer-deps
npm run dev
```

## 📡 API Endpoints Cheat Sheet

### Tourist Status Tracking
```bash
# Update location (auto-detects movement)
POST /update_location
Auth: Bearer {token}
Body: {"latitude": 19.076, "longitude": 72.8777}
Returns: {"user_status": "idle|moving|emergency", ...}

# Get all tourists with status
GET /tourists/locations
Returns: [{"id": 1, "status": "idle", "emergency_contact": "...", ...}]
```

### SOS Management
```bash
# Send SOS (auto-detects nearby tourists)
POST /sos
Auth: Bearer {token}
Body: {"latitude": 19.08, "longitude": 72.88, "message": "Help!"}
Returns: {"nearby_tourists_alerted": 2, "nearby_tourists": [...], ...}

# Get active alerts
GET /alerts/active
Returns: [{"tourist_name": "...", "duration_minutes": 5, ...}]

# Resolve/Cancel alert
PUT /alerts/{id}/status
Auth: Bearer {token}
Body: {"alert_id": 1, "status": "resolved|cancelled"}
Returns: {"new_status": "resolved", ...}
```

## 🎨 Frontend Color Codes

| Status | Color | Emoji |
|--------|-------|-------|
| Emergency | 🔴 Red | 🚨 |
| Moving | 🟠 Orange | - |
| Idle | 🔵 Blue | - |

## 🧪 Test Scenarios

### Test Movement Detection
```bash
TOKEN="your_token_here"

# First update (idle)
curl -X POST http://localhost:8000/update_location \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"latitude": 19.076, "longitude": 72.8777}'

# Second update (moving - changed > 0.001 degrees)
curl -X POST http://localhost:8000/update_location \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"latitude": 19.080, "longitude": 72.8800}'
```

### Test SOS with Nearby Detection
```bash
# Position tourist 1
curl -X POST http://localhost:8000/update_location \
  -H "Authorization: Bearer $TOKEN1" -H "Content-Type: application/json" \
  -d '{"latitude": 19.080, "longitude": 72.880}'

# Position tourist 2 nearby (within 5km)
curl -X POST http://localhost:8000/update_location \
  -H "Authorization: Bearer $TOKEN2" -H "Content-Type: application/json" \
  -d '{"latitude": 19.085, "longitude": 72.885}'

# Tourist 1 sends SOS
curl -X POST http://localhost:8000/sos \
  -H "Authorization: Bearer $TOKEN1" -H "Content-Type: application/json" \
  -d '{"latitude": 19.080, "longitude": 72.880, "message": "Help!"}'
# Returns: nearby_tourists_alerted: 1
```

### Test Alert Lifecycle
```bash
# Send SOS
SOS_RESPONSE=$(curl -X POST http://localhost:8000/sos \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"latitude": 19.080, "longitude": 72.880, "message": "Help!"}')
ALERT_ID=$(echo $SOS_RESPONSE | jq -r '.alert_id')

# Check active alerts
curl http://localhost:8000/alerts/active
# Shows 1 active alert

# Resolve alert
curl -X PUT http://localhost:8000/alerts/$ALERT_ID/status \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"alert_id\": $ALERT_ID, \"status\": \"resolved\"}"

# Check active alerts again
curl http://localhost:8000/alerts/active
# Shows 0 active alerts
```

## 🔑 Key Features at a Glance

| Feature | Description | Benefit |
|---------|-------------|---------|
| Auto Status Detection | Idle vs Moving based on location change | Real-time activity awareness |
| Emergency Status | Auto-set on SOS, reset on resolve | Clear emergency visibility |
| Nearby Tourist Detection | Find tourists within ~5km | Enable peer assistance |
| Alert Lifecycle | active → resolved/cancelled | Proper emergency management |
| Emergency Contacts | Visible on map & alerts | Better coordination |

## 📊 Database Schema (New Fields)

```sql
-- Tourist table
ALTER TABLE tourists ADD COLUMN status VARCHAR DEFAULT 'idle';

-- PanicAlert table
ALTER TABLE panic_alerts ADD COLUMN status VARCHAR DEFAULT 'active';
ALTER TABLE panic_alerts ADD COLUMN resolved_at DATETIME;
```

## 🎯 Status Transitions

```
Tourist Status Flow:
idle ↔ moving (based on location change)
     ↓
  emergency (on SOS send)
     ↓
  idle (on alert resolve/cancel)

Alert Status Flow:
active → resolved (emergency resolved)
active → cancelled (false alarm)
```

## 🐛 Debugging Tips

**Tourist not showing on map?**
- Check last_updated < 5 minutes ago
- Verify latitude/longitude not null

**Status not updating?**
- Movement threshold: 0.001 degrees (~111 meters)
- Status only changes if not in emergency

**Nearby tourists not detected?**
- Detection radius: ~5km (0.05 degrees)
- Both tourists must have recent locations

**Alert won't resolve?**
- Only alert creator can update status
- Check authorization token matches tourist_id

## 📖 Full Documentation

- **Feature Guide**: `ENHANCED_TRACKING_SOS_GUIDE.md`
- **Changes Summary**: `CHANGES_SUMMARY_ENHANCED.md`
- **Integration**: `INTEGRATION_GUIDE.md`
- **Testing**: `TEST_LOCATION_TRACKING.md`
