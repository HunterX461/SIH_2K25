# Tourist Safety System - Demo Guide

This guide explains how to run and demonstrate the Tourist Safety System with all its key features.

## Quick Start

### Option 1: Automated Demo (Recommended)
```bash
./run_demo.sh
```

### Option 2: Manual Setup

1. **Install Dependencies**
```bash
cd geofencing_module
pip3 install fastapi uvicorn sqlalchemy pydantic python-jose passlib[bcrypt] python-multipart email-validator
```

2. **Seed Demo Data**
```bash
python3 demo_seed.py
```

3. **Start Backend Server**
```bash
python3 -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

4. **Open Web Dashboard**
- Open `index.html` in your browser
- Or run: `python3 -m http.server 8080` and visit http://localhost:8080

## Demo Features

### 1. Live Tracking 🗺️

**What it does:**
- Real-time location tracking of tourists
- Auto-updates every 30 seconds
- Shows tourist status: idle, moving, or emergency

**Demo Steps:**
1. Login with demo credentials (see below)
2. Navigate to "Must-Visit Places" tab
3. See live tourists with real-time status updates
4. Location automatically updates in the background

**API Endpoint:**
```bash
GET http://localhost:8000/tourists
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "latitude": 19.076,
    "longitude": 72.8777,
    "status": "idle",
    "last_updated": "2025-01-15T10:30:00",
    "emergency_contact": "+1-555-123-4567"
  }
]
```

### 2. SOS / Emergency Alert 🚨

**What it does:**
- Instant emergency alert system
- Sends location to nearest police station
- Alerts nearby tourists
- Encrypted message transmission

**Demo Steps:**
1. Login with demo credentials
2. Go to Dashboard
3. Press and hold the red "PANIC" button
4. Countdown starts (5 seconds)
5. Alert is sent with:
   - Current location
   - Encrypted message
   - Nearest police station info
   - Nearby tourists notified

**API Endpoint:**
```bash
POST http://localhost:8000/sos
Authorization: Bearer {token}
Content-Type: application/json

{
  "latitude": 19.076,
  "longitude": 72.8777,
  "message": "Emergency! Need help!"
}
```

**Expected Response:**
```json
{
  "status": "sent",
  "alert_id": 1,
  "encrypted_message": "RW1lcmdlbmN5ISBOZWVkIGhlbHAh",
  "nearest_police_station": {
    "name": "Bandra Police Station",
    "latitude": 19.055,
    "longitude": 72.84
  },
  "nearby_tourists_alerted": 2,
  "timestamp": "2025-01-15T10:35:00"
}
```

### 3. Risk Zones (Danger Areas) ⚠️

**What it does:**
- Identifies high-risk areas
- Color-coded zones (red = high risk, yellow = medium)
- Automatic alerts when entering risk zones
- Historical crime data visualization

**Pre-loaded Risk Zones:**
1. **Kamathipura Area** - High Risk
   - Location: 18.966, 72.831
   - Known for high crime rates

2. **Kurla West Protest Area** - High Risk
   - Location: 19.070, 72.874
   - Active protest zone

3. **Dharavi Area** - Medium Risk
   - Location: 19.040, 72.850
   - Crowded area with limited police presence

4. **Mankhurd Industrial Area** - Medium Risk
   - Location: 19.038, 72.933
   - Industrial zone with poor lighting

**Demo Steps:**
1. Navigate to "Geo-fences" tab
2. View pre-loaded risk zones with color coding
3. Create custom risk zones if needed
4. Monitor location updates for zone entry/exit alerts

**API Endpoint:**
```bash
GET http://localhost:8000/zones
```

### 4. Must-Visit Places (Tourist Attractions) ✨

**What it does:**
- Curated list of safe tourist attractions
- Ratings and reviews
- One-click add to itinerary
- Safety information for each location

**Pre-loaded Attractions:**

1. **Gateway of India** ⭐ 4.5/5
   - Monument, Historic
   - Location: 18.9220, 72.8347
   - Highlights: Architecture, Sea views, Boat rides

2. **Marine Drive** ⭐ 4.7/5
   - Scenic Route
   - Location: 18.9432, 72.8235
   - Highlights: Queen's Necklace, Sunset views

3. **Juhu Beach** ⭐ 4.2/5
   - Beach
   - Location: 19.0990, 72.8265
   - Highlights: Street food, Beach activities

4. **Bandra Fort** ⭐ 4.3/5
   - Historic Site
   - Location: 19.0437, 72.8209
   - Highlights: Portuguese architecture, Views

5. **Siddhivinayak Temple** ⭐ 4.6/5
   - Religious Site
   - Location: 19.0176, 72.8300
   - Highlights: Spiritual, Architecture

6. **Haji Ali Dargah** ⭐ 4.5/5
   - Religious Site
   - Location: 18.9830, 72.8089
   - Highlights: Sea location, Causeway walk

**Demo Steps:**
1. Navigate to "Must-Visit Places" tab
2. Browse 6 pre-loaded tourist attractions
3. View ratings, descriptions, and highlights
4. Click "Add to Itinerary" to plan your visit
5. View added places in "Tourist ID & Itinerary" tab

## Demo Login Credentials

### Demo Accounts:
```
Email: john@demo.com
Password: demo123
Emergency Contact: +1-555-123-4567

Email: maria@demo.com
Password: demo123
Emergency Contact: +34-612-345-678

Email: chen@demo.com
Password: demo123
Emergency Contact: +86-138-0000-0000
```

## Demo Scenario Walkthrough

### Complete Demo Flow (10 minutes)

1. **Initial Setup** (1 min)
   - Start backend: `./run_demo.sh`
   - Open web dashboard: `index.html`
   - Login with john@demo.com / demo123

2. **Explore Dashboard** (2 min)
   - View safety score widget
   - See emergency panic button
   - Check location tracking status
   - View alerts panel

3. **View Must-Visit Places** (2 min)
   - Navigate to "Must-Visit Places" tab
   - Browse 6 tourist attractions
   - Add 2-3 places to itinerary
   - Note ratings and safety information

4. **Check Live Tracking** (2 min)
   - In "Must-Visit Places" tab, scroll to live tourists
   - See 3 demo tourists with real-time status
   - Note status indicators (idle/moving)
   - View emergency contacts

5. **Test SOS Feature** (2 min)
   - Return to Dashboard
   - Press and hold PANIC button
   - Wait for 5-second countdown
   - View SOS confirmation with:
     - Alert ID
     - Nearest police station
     - Nearby tourists alerted

6. **Explore Risk Zones** (1 min)
   - Navigate to "Geo-fences" tab
   - View 4 pre-loaded risk zones
   - Note color coding (red/yellow)
   - Optionally create new zone

## API Testing

### Test All Endpoints

```bash
# 1. Register/Login
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@demo.com","password":"test123","emergency_contact":"+1234567890"}'

# Save the token from response
TOKEN="your_token_here"

# 2. Update Location
curl -X POST http://localhost:8000/update_location \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":19.076,"longitude":72.8777}'

# 3. Get All Tourists (Live Tracking)
curl http://localhost:8000/tourists

# 4. Send SOS
curl -X POST http://localhost:8000/sos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":19.076,"longitude":72.8777,"message":"Emergency!"}'

# 5. Get Risk Zones
curl http://localhost:8000/zones

# 6. Get Police Stations
curl http://localhost:8000/police_stations

# 7. Get Active Alerts
curl http://localhost:8000/alerts/active
```

## Troubleshooting

### Backend won't start
```bash
# Check Python version (need 3.8+)
python3 --version

# Install dependencies manually
pip3 install --user fastapi uvicorn sqlalchemy pydantic
```

### Database errors
```bash
# Remove old database and reseed
cd geofencing_module
rm tourists.db
python3 demo_seed.py
```

### Web dashboard issues
- Ensure backend is running on port 8000
- Check browser console for CORS errors
- Try different browser (Chrome/Firefox recommended)

## Key Features Summary

✅ **Live Tracking**
- Real-time tourist locations
- Auto-updates every 30 seconds
- Status indicators (idle/moving/emergency)

✅ **SOS/Emergency**
- One-button emergency alert
- Location sharing
- Nearest police station routing
- Nearby tourist notifications

✅ **Risk Zones**
- 4 pre-loaded danger areas
- Color-coded risk levels
- Entry/exit notifications
- Custom zone creation

✅ **Must-Visit Places**
- 6 curated tourist attractions
- Ratings and reviews
- One-click itinerary planning
- Safety information

## Demo Video Script

**Introduction (30 sec)**
"Welcome to the Tourist Safety System demo. This platform provides real-time safety monitoring for tourists with emergency response, risk zone alerts, and curated safe attractions."

**Live Tracking (1 min)**
"Here we see live tracking of three tourists - John, Maria, and Chen. Their locations update automatically every 30 seconds. Notice the status indicators showing who's moving versus idle."

**Must-Visit Places (1 min)**
"The system includes 6 must-visit places - all verified safe tourist attractions. Each has ratings, descriptions, and can be added to your itinerary with one click. Gateway of India has a 4.5-star rating..."

**Risk Zones (1 min)**
"We've identified 4 risk zones in the area. High-risk zones shown in red, medium in yellow. When tourists enter these areas, they're automatically alerted."

**SOS Feature (1 min)**
"The emergency SOS button provides instant help. Press and hold for 5 seconds. It sends your location to the nearest police station and alerts nearby tourists. The system found Bandra Police Station 2.3km away."

**Conclusion (30 sec)**
"The Tourist Safety System combines real-time tracking, emergency response, risk awareness, and tourist guidance in one comprehensive platform."

## Production Deployment Notes

When deploying to production:

1. Change `SECRET_KEY` in `app.py`
2. Use PostgreSQL instead of SQLite
3. Enable HTTPS/SSL
4. Set up proper CORS origins
5. Add rate limiting
6. Implement push notifications
7. Add real geolocation APIs
8. Integrate with actual police/emergency services

## Support

For issues or questions:
- Check API docs: http://localhost:8000/docs
- Review this guide
- Check application logs
- Verify database connectivity
