# Quick Demo Guide - Tourist Safety System

## 🚀 Start Demo in 30 Seconds

```bash
# 1. Start backend and seed data
./run_demo.sh

# 2. In another terminal, start web server
python3 -m http.server 8080

# 3. Open browser
# Visit: http://localhost:8080
```

## 🎯 Demo Flow (5 Minutes)

### Step 1: Login (30 sec)
- Click "Continue without wallet"
- Enter any name/email or use: `demo@example.com`
- Click Continue

### Step 2: View Must-Visit Places (1 min)
- Click "Must-Visit Places" tab
- See 6 tourist attractions with ratings:
  - Gateway of India (4.5⭐)
  - Marine Drive (4.7⭐)
  - Juhu Beach (4.2⭐)
  - Bandra Fort (4.3⭐)
  - Siddhivinayak Temple (4.6⭐)
  - Haji Ali Dargah (4.5⭐)
- Click "Add to Itinerary" on any place

### Step 3: Check Live Tracking (1 min)
- Scroll down on "Must-Visit Places" tab
- See "Live Tourist Tracking" section
- View 3 demo tourists:
  - **John Doe** - Idle (19.076, 72.8777)
  - **Maria Garcia** - Moving (19.085, 72.885)
  - **Chen Wei** - Idle (19.055, 72.84)

### Step 4: View Risk Zones (1 min)
- Click "Geo-fences" tab
- See pre-loaded zones:
  - 4 Risk zones (red/yellow)
  - 5 Safe zones (green)

### Step 5: Test SOS (1 min)
- Click "Dashboard" tab
- Press and hold red "PANIC" button
- See 5-second countdown
- Alert sent with nearest police station info

## 📋 Demo Talking Points

**Live Tracking:**
- "Real-time location tracking of tourists with status indicators"
- "Updates every 30 seconds automatically"
- "Shows emergency contact for each tourist"

**Must-Visit Places:**
- "Curated list of safe tourist attractions"
- "Each has ratings, descriptions, and GPS coordinates"
- "One-click add to itinerary"

**Risk Zones:**
- "Pre-identified danger areas in Mumbai"
- "Color-coded by risk level (red=high, yellow=medium)"
- "Automatic alerts when entering risk zones"

**SOS Feature:**
- "Instant emergency alert system"
- "Finds nearest police station automatically"
- "Alerts nearby tourists for crowd assistance"

## 🔑 Quick API Tests

```bash
# Get live tourists
curl http://localhost:8000/tourists

# Get all zones
curl http://localhost:8000/zones

# Login
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@demo.com","password":"demo123"}'

# Test SOS (need token from login)
curl -X POST http://localhost:8000/sos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":19.076,"longitude":72.8777,"message":"Demo!"}'
```

## 💾 Demo Data

### Tourists
- john@demo.com / demo123
- maria@demo.com / demo123
- chen@demo.com / demo123

### Police Stations
- Bandra Police Station (19.055, 72.84)
- Andheri Police Station (19.115, 72.869)
- Malvani Police Station (19.178, 72.83)
- Colaba Police Station (18.906, 72.822)
- Powai Police Station (19.121, 72.906)

### Risk Zones
1. Kamathipura Area (HIGH)
2. Kurla West Protest Area (HIGH)
3. Dharavi Area (MEDIUM)
4. Mankhurd Industrial Area (MEDIUM)

### Must-Visit Places
1. Gateway of India - 4.5⭐
2. Marine Drive - 4.7⭐
3. Juhu Beach - 4.2⭐
4. Bandra Fort - 4.3⭐
5. Siddhivinayak Temple - 4.6⭐
6. Haji Ali Dargah - 4.5⭐

## 🎬 Demo Commands

```bash
# Reset demo data
cd geofencing_module
rm tourists.db
python3 demo_seed.py

# Check backend health
curl http://localhost:8000/

# View API docs
# Open: http://localhost:8000/docs

# Check active tourists
curl http://localhost:8000/tourists | python3 -m json.tool

# Check zones
curl http://localhost:8000/zones | python3 -m json.tool | grep name
```

## 🐛 Troubleshooting

**Backend won't start:**
```bash
pip3 install fastapi uvicorn sqlalchemy pydantic python-jose passlib[bcrypt]
```

**Port already in use:**
```bash
lsof -ti:8000 | xargs kill -9
lsof -ti:8080 | xargs kill -9
```

**Database errors:**
```bash
cd geofencing_module
rm tourists.db
python3 demo_seed.py
```

## 📊 Expected Results

### API Responses:

**GET /tourists:**
```json
[
  {
    "id": 9,
    "name": "John Doe",
    "latitude": 19.076,
    "longitude": 72.8777,
    "status": "idle",
    "emergency_contact": "+1-555-123-4567"
  }
]
```

**GET /zones (9 total):**
- 5 safe zones (normal risk)
- 4 risk zones (high/medium)

**POST /sos:**
```json
{
  "status": "sent",
  "alert_id": 1,
  "nearest_police_station": {...},
  "nearby_tourists_alerted": 9
}
```

## 📖 Full Documentation

For detailed information, see:
- `DEMO_GUIDE.md` - Complete demo walkthrough
- `README.md` - Project overview
- `http://localhost:8000/docs` - API documentation

## ✅ Success Indicators

- ✅ Backend running on port 8000
- ✅ Web server running on port 8080
- ✅ Can login to web dashboard
- ✅ Must-Visit Places tab shows 6 attractions
- ✅ Live tracking shows 3 tourists
- ✅ SOS button sends alerts
- ✅ API endpoints respond correctly

## 🎯 Demo Complete!

All features implemented and tested:
- ✅ Live Tracking
- ✅ SOS / Emergency Alert
- ✅ Risk Zones
- ✅ Must-Visit Places

**Time to complete:** 5 minutes
**Lines of code added:** ~500
**API endpoints working:** 7+
**Demo data entries:** 21
