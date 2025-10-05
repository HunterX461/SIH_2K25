# Tourist Safety System - Integration Guide

## Overview
This guide documents the unified authentication, geofencing, and SOS integration implemented across the backend and frontend.

## Backend Changes

### 1. New Files Created

#### `/geofencing_module/app.py`
Complete FastAPI backend with:
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **User Management**: Registration, login, and profile endpoints
- **Geofencing**: Zone management and retrieval
- **SOS System**: Emergency alert creation with nearest police station detection
- **Location Tracking**: Real-time location updates

**Key Endpoints:**
- `POST /register` - User registration
- `POST /login` - User authentication
- `GET /me` - Get current user profile
- `POST /update_location` - Update user location
- `POST /sos` - Send emergency SOS alert
- `GET /zones` - Get all geofenced zones
- `POST /zones` - Create new zone (requires auth)
- `GET /police_stations` - Get all police stations
- `GET /alerts/history` - Get user's alert history

#### `/geofencing_module/seed.py`
Database seeding script that populates:
- 10 safety/danger zones across major Indian cities
- 10 police station locations
- Covers: Mumbai, Delhi, Bangalore, Goa, Jaipur

#### `/geofencing_module/requirements.txt`
Updated with all necessary dependencies:
```
shapely>=2.0.0
fastapi>=0.100.0
uvicorn[standard]>=0.23.0
pydantic>=2.0.0
sqlalchemy>=2.0.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.6
geopy>=2.3.0
email-validator>=2.0.0
```

### 2. Database Schema

**tourists table:**
- id (Primary Key)
- name
- email (unique)
- password_hash
- emergency_contact
- latitude, longitude
- is_guest
- wallet_address
- created_at

**panic_alerts table:**
- id (Primary Key)
- tourist_id
- latitude, longitude
- message
- timestamp

**zones table:**
- id (Primary Key)
- zone_id (unique)
- name
- risk_level (normal/medium/high)
- zone_type (tourist/city/risk)
- coordinates (JSON)

**police_stations table:**
- id (Primary Key)
- name
- latitude, longitude

## Frontend Changes

### 1. New Files Created

#### `/ui/app/contexts/AuthContext.tsx`
Global authentication context that:
- Manages user authentication state
- Handles login, registration, and guest login
- Stores user data in AsyncStorage (native) or localStorage (web)
- Provides authentication status across all screens

#### `/ui/app/login.tsx`
Complete login screen with:
- Three modes: Login, Register, Guest
- Email/password authentication
- Guest access without password
- Emergency contact field for registration
- Cross-platform compatibility (web + native)

#### `/ui/app/services/apiService.ts`
Centralized API service layer:
- Type-safe API calls
- JWT token management
- All backend endpoint wrappers
- Error handling

### 2. Modified Files

#### `/ui/app/_layout.tsx`
- Wrapped app with AuthProvider
- Added authentication-based routing
- Redirects to login if not authenticated
- Redirects to tabs if authenticated

#### `/ui/app/(tabs)/emergency.tsx`
- Integrated with AuthContext
- Uses apiService for SOS calls
- Sends encrypted messages to backend
- Gets nearest police station info
- Real-time location tracking

#### `/ui/app/(tabs)/index.tsx`
- Uses authenticated API calls
- Updates location on backend
- Displays safety score
- Integration with geofencing zones

#### `/ui/app/(tabs)/profile.tsx`
- Displays user info from AuthContext
- Added logout functionality
- Location tracking integration
- Syncs profile data with backend

#### `/ui/app/(tabs)/maps.tsx`
- Fetches zones from backend API
- Displays geofenced areas
- Color-coded risk levels
- Real-time zone updates

#### `/ui/package.json`
- Added `@react-native-async-storage/async-storage` dependency

## How to Run

### Backend

1. Install dependencies:
```bash
cd geofencing_module
pip3 install -r requirements.txt
```

2. Seed the database:
```bash
python3 seed.py
```

3. Start the server:
```bash
python3 app.py
```

The API will be available at `http://localhost:8000`

### Frontend

1. Install dependencies:
```bash
cd ui
npm install --legacy-peer-deps
```

2. Start development server:
```bash
npm run dev
```

## API Authentication Flow

1. User registers via `/register` endpoint
2. Backend returns JWT token + user info
3. Frontend stores token in AuthContext
4. All subsequent API calls include `Authorization: Bearer <token>` header
5. Backend validates token and returns user-specific data

## SOS Alert Flow

1. User presses SOS button in Emergency tab
2. App gets current location via Expo Location
3. Sends POST to `/sos` with location + message
4. Backend:
   - Creates panic alert in database
   - Encrypts message with base64
   - Finds nearest police station
   - Returns alert confirmation
5. Frontend shows confirmation with police station info

## Geofencing Flow

1. Backend seeds zones with coordinates and risk levels
2. Frontend fetches zones via `/zones` endpoint
3. Maps screen displays zones with color coding:
   - Green: normal/safe zones
   - Yellow: medium risk zones
   - Red: high risk/danger zones
4. Backend tracks user location updates
5. Can check if user enters danger zones

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- CORS protection (configure in production)
- SQL injection protection via SQLAlchemy ORM
- Token expiration (30 minutes default)

## Configuration

### Backend Base URL

The application uses the `EXPO_PUBLIC_API_BASE` environment variable for the backend API URL.

**Environment Variable:** `EXPO_PUBLIC_API_BASE`  
**Default:** `http://10.232.121.138:8000`

All API calls throughout the application use this environment variable:
- `/ui/app/services/apiService.ts`: Uses `process.env.EXPO_PUBLIC_API_BASE`
- `/ui/app/contexts/AuthContext.tsx`: Uses `process.env.EXPO_PUBLIC_API_BASE`
- `/ui/app/(tabs)/maps.web.tsx`: Uses `process.env.EXPO_PUBLIC_API_BASE`

To override for production or different environments, create a `.env` file in the `/ui` directory:

```env
EXPO_PUBLIC_API_BASE=https://your-production-api.com
```

This ensures all API calls use the correct backend URL without hardcoding.

## Testing

All endpoints tested and working:
- ✅ User registration
- ✅ User login
- ✅ SOS alerts
- ✅ Location updates
- ✅ Zone retrieval
- ✅ Authentication flow

### Test Credentials

For development and testing purposes, the following test credentials are available:

**Email:** `test@gmail.com`  
**Password:** `test123`

These credentials bypass the backend authentication and create a local test user with ID 999. This allows for offline testing and development without requiring a backend connection.

## Next Steps

1. Configure production environment variables
2. Set up HTTPS for secure communication
3. Implement real-time websocket notifications
4. Add email/SMS notifications for SOS alerts
5. Implement advanced geofencing with polygon checks
6. Add analytics dashboard
7. Deploy backend to cloud service
8. Build and deploy mobile apps

## Support

For issues or questions, refer to:
- Backend API docs: `http://localhost:8000/docs` (when running)
- README.md in project root
- Issue tracker on GitHub
