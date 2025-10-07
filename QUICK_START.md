# Quick Start Guide - Tourist Safety System

## 🚀 Get Started in 5 Minutes

### Prerequisites

- Python 3.12+
- Node.js 20+
- Git

### 1. Start the Backend (2 minutes)

```bash
# Navigate to backend directory
cd geofencing_module

# Install dependencies
pip3 install fastapi uvicorn sqlalchemy pydantic python-jose passlib bcrypt python-multipart email-validator

# Seed the database (creates 20 zones, 10 police stations)
python3 seed.py

# Start the server
python3 -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

**Verify it's running:**
```bash
curl http://localhost:8000/
# Should return: {"message": "Tourist Safety API", "status": "active"}
```

### 2. Test the API (1 minute)

```bash
# Run automated test script
./test_new_features.sh
```

**Expected:** All 11 tests should pass ✓

### 3. Use Test Credentials

**5 test users are automatically created for testing:**

| Email | Password | Contact |
|-------|----------|---------|
| testuser1@example.com | Test@123 | +91-9876543210 |
| testuser2@example.com | Test@456 | +91-9876543211 |
| testuser3@example.com | Test@789 | +91-9876543212 |
| testuser4@example.com | Test@321 | +91-9876543213 |
| testuser5@example.com | Test@654 | +91-9876543214 |

**See [TEST_USER_CREDENTIALS.md](TEST_USER_CREDENTIALS.md) for complete usage examples.**

### 4. Explore the Features

#### A. Must-Visit Places

```bash
# Get all tourist attractions
curl http://localhost:8000/must_visit_places | jq '.[0:3]'

# Get places near Delhi (within 20km)
curl "http://localhost:8000/must_visit_places?latitude=28.6139&longitude=77.2090&radius_km=20" | jq .
```

#### B. Zone Statistics

```bash
curl http://localhost:8000/zones/statistics | jq .
```

#### C. Test Authentication with Pre-Created Users

```bash
# Login with test user (no registration needed)
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser1@example.com","password":"Test@123"}' | jq .

# Save the token from response
TOKEN="<paste-token-here>"

# Update location
curl -X POST http://localhost:8000/update_location \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":28.6139,"longitude":77.2090}' | jq .
```

#### D. Test Danger Zone Detection

```bash
# Update to danger zone (Dharavi: 19.045, 72.855)
curl -X POST http://localhost:8000/update_location \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":19.045,"longitude":72.855}' | jq '.danger_zone_info'
```

**Expected:** Should show "Dharavi Area" high risk zone

#### E. Test Password Reset

```bash
# Request reset
curl -X POST http://localhost:8000/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com"}' | jq .

# Save the token from response
RESET_TOKEN="<paste-token-here>"

# Reset password
curl -X POST http://localhost:8000/password-reset/confirm \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$RESET_TOKEN\",\"new_password\":\"newpass123\"}" | jq .

# Login with new password
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"newpass123"}' | jq .
```

### 4. (Optional) Start Frontend (3 minutes)

```bash
cd ui

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

Visit `http://localhost:8081` to see the mobile app UI.

## 📱 Key Features to Test

### Live Tracking ✅
- Auto-updates every 30 seconds
- Shows tourist status (idle/moving/emergency)
- Real-time map visualization

### SOS Functionality ✅
- Emergency alert with countdown
- Nearest police station detection
- Nearby tourist alerts (5km radius)

### Risk Zones ✅
- 2 high-risk areas (Dharavi, Malvani)
- Real-time danger detection
- Automatic alerts on entry

### Must-Visit Places ✅
- 10 tourist attractions
- Distance calculation
- Gold pin markers on map

### Authentication ✅
- Register, Login, Guest mode
- Password reset flow
- JWT token-based auth

## 🎯 Quick API Reference

### Public Endpoints (No Auth)

```bash
GET  /                      # Health check
GET  /zones                 # Get all zones
GET  /zones/statistics      # Get zone stats
GET  /must_visit_places     # Get tourist attractions
GET  /police_stations       # Get police stations
GET  /tourists              # Get active tourists
GET  /tourists/locations    # Get tourist locations
GET  /alerts/active         # Get active SOS alerts
POST /register              # Register new user
POST /login                 # Login user
POST /password-reset/request   # Request password reset
POST /password-reset/confirm   # Confirm password reset
```

### Protected Endpoints (Auth Required)

```bash
GET  /me                    # Get current user
POST /update_location       # Update user location
POST /sos                   # Send SOS alert
POST /zones                 # Create zone
GET  /alerts/history        # Get user's alert history
PUT  /alerts/{id}/status    # Update alert status
```

## 📚 Documentation

- **NEW_FEATURES_GUIDE.md** - Complete API documentation
- **IMPLEMENTATION_COMPLETE.md** - Implementation summary
- **ENHANCED_TRACKING_SOS_GUIDE.md** - Tracking & SOS features
- **QUICK_REFERENCE.md** - API quick reference

## 🧪 Automated Testing

```bash
# Run full test suite (11 tests)
./test_new_features.sh

# Test specific features
curl http://localhost:8000/must_visit_places | jq . | head -20
curl http://localhost:8000/zones/statistics | jq .
```

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check Python version
python3 --version  # Should be 3.12+

# Reinstall dependencies
pip3 install --upgrade fastapi uvicorn sqlalchemy pydantic python-jose passlib bcrypt

# Reseed database
cd geofencing_module && python3 seed.py
```

### Database issues

```bash
# Delete and recreate database
cd geofencing_module
rm tourists.db
python3 seed.py
```

### API returns 404

```bash
# Verify backend is running
curl http://localhost:8000/
# Should return: {"message": "Tourist Safety API", "status": "active"}

# Check all endpoints
curl http://localhost:8000/docs  # FastAPI auto-docs
```

### Frontend won't load

```bash
cd ui
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run dev
```

## 🎉 Success!

If all steps completed successfully:
- ✅ Backend running on http://localhost:8000
- ✅ 17 API endpoints available
- ✅ 20 zones in database (10 must-visit)
- ✅ All 11 tests passing
- ✅ Frontend (optional) running on http://localhost:8081

**Next Steps:**
1. Explore API documentation at http://localhost:8000/docs
2. Read NEW_FEATURES_GUIDE.md for detailed info
3. Test features with the automated script
4. Start building your application!

## 📞 Need Help?

- Run test script: `./test_new_features.sh`
- Check logs: Backend terminal output
- API docs: http://localhost:8000/docs
- Review: IMPLEMENTATION_COMPLETE.md

**Happy coding! 🚀**
