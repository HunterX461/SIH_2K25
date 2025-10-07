# CORS, Authentication & UI Fix Guide

## Overview
This document describes the fixes implemented to address CORS errors, authentication bugs, and UI export warnings reported in user feedback.

## Changes Made

### 1. Backend CORS Configuration Enhancement (`geofencing_module/app.py`)

**Issue**: CORS middleware needed explicit documentation and verification
**Fix**: Enhanced CORS configuration with detailed comments

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,  # Allow cookies and Authorization headers
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],  # Allow all headers including Authorization, Content-Type
    expose_headers=["*"],  # Expose all response headers to the frontend
)
```

**What it does**:
- ✅ Allows cross-origin requests from any origin (configurable for production)
- ✅ Supports credentials (cookies, Authorization headers)
- ✅ Explicitly allows all standard HTTP methods
- ✅ Allows all request headers (Authorization, Content-Type, etc.)
- ✅ Exposes all response headers to the client

### 2. Test User Auto-Initialization (`geofencing_module/app.py`)

**Issue**: Test credentials (test@gmail.com / test123) need to work consistently
**Fix**: Added automatic test user creation on backend startup

```python
def init_test_user():
    """Initialize test user (test@gmail.com / test123) for development"""
    # Creates test user if not exists
    # Email: test@gmail.com
    # Password: test123

@app.on_event("startup")
def startup_event():
    init_test_user()
```

**What it does**:
- ✅ Creates test user automatically on backend startup
- ✅ Skips if user already exists (idempotent)
- ✅ Test credentials: `test@gmail.com` / `test123`
- ✅ Ensures consistent testing experience

### 3. Authentication Flow Fixes (`ui/app/contexts/AuthContext.tsx`)

**Issue**: Test credentials were bypassing backend, creating fake tokens that don't work
**Fix**: Removed test credential bypass, all logins now go through backend API

**Before**:
```typescript
// Test credentials created fake token without backend call
if (email === 'test@gmail.com' && password === 'test123') {
  const userData: User = {
    token: 'test-token-' + Date.now(), // Fake token!
    // ...
  };
  // No API call
}
```

**After**:
```typescript
// All logins call backend API and get real JWT tokens
const response = await fetch(`${API_BASE_URL}/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
// Token comes from backend
```

**What it does**:
- ✅ All authentication goes through backend
- ✅ Real JWT tokens are generated and validated
- ✅ Test credentials work like any other credentials
- ✅ Better error handling with `.catch()` fallbacks

### 4. Default Exports Added

**Issue**: Context files were missing default exports
**Fix**: Added default exports to both context files

#### AuthContext.tsx
```typescript
export default { AuthProvider, useAuth };
```

#### ThemeContext.tsx
```typescript
export default { ThemeProvider, useTheme };
```

**What it does**:
- ✅ Supports both named and default imports
- ✅ More flexible import patterns
- ✅ Backwards compatible with existing code

### 5. Authorization Header Verification

**Issue**: Need to ensure Authorization header is always sent for protected routes
**Fix**: Verified apiService.ts already correctly handles tokens

The `apiService.ts` already implements proper token handling:
```typescript
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

All protected endpoints receive tokens:
- ✅ `updateLocation(token, lat, lon)`
- ✅ `sendSOS(token, lat, lon, message)`
- ✅ `getAlertHistory(token)`
- ✅ `updateAlertStatus(token, alertId, status)`
- ✅ And all other protected routes

### 6. Emergency Call Button (Already Correct)

**Issue**: Need to verify tel: method is used correctly for web
**Fix**: Verified emergency.tsx already uses correct format

```typescript
const phoneUrl = `tel:${phoneNumber}`;
await Linking.openURL(phoneUrl);
```

**What it does**:
- ✅ Correct `tel:` protocol usage
- ✅ Works on web, iOS, and Android
- ✅ Includes error handling and fallback messages

## Testing Instructions

### 1. Test Backend CORS

Start the backend:
```bash
cd geofencing_module
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Check console output for test user creation:
```
✅ Test user created: test@gmail.com / test123
```

Test CORS headers:
```bash
curl -i -X OPTIONS http://localhost:8000/login \
  -H "Origin: http://localhost:8081" \
  -H "Access-Control-Request-Method: POST"
```

Expected headers in response:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: *
```

### 2. Test Authentication Flow

Start the mobile app:
```bash
cd ui
npm install --legacy-peer-deps
npm run dev
```

#### Test Login:
1. Open app in browser or simulator
2. Use credentials: `test@gmail.com` / `test123`
3. Verify successful login with real token
4. Check console for no CORS errors
5. Verify navigation to home screen

#### Test Registration:
1. Click "Register" tab
2. Enter new user details
3. Submit registration
4. Verify successful registration and auto-login
5. Check token is stored in localStorage/AsyncStorage

#### Test Guest Login:
1. Click "Continue as Guest"
2. Enter name and email
3. Verify guest account creation
4. Check `is_guest: true` flag is set

### 3. Test Protected API Calls

Once logged in, test these features:
1. **Location Update**: Navigate to Maps tab → location should update
2. **SOS Alert**: Go to Emergency tab → press SOS button → verify alert sent
3. **Alert History**: Check that alerts appear in history
4. **Zone Information**: Verify zones load on Maps tab

All should work without CORS errors or authentication failures.

### 4. Test Emergency Call Button

1. Navigate to Emergency tab
2. Press "Call Emergency: +91 7821873078"
3. On mobile: Phone dialer should open
4. On web: Browser should prompt to open phone app or show tel: link

### 5. Test Default Exports

Try importing both ways:
```typescript
// Named imports (existing)
import { useAuth, AuthProvider } from './contexts/AuthContext';

// Default import (new)
import AuthContext from './contexts/AuthContext';
const { useAuth, AuthProvider } = AuthContext;
```

Both should work without errors.

## Common Issues and Solutions

### Issue: "Could not validate credentials"
**Cause**: Token not being sent or invalid token
**Solution**: Verify user.token exists and is passed to API calls

### Issue: CORS preflight error
**Cause**: OPTIONS request failing
**Solution**: Backend CORS middleware now handles this automatically

### Issue: Test user not working
**Cause**: Test user not in database
**Solution**: Restart backend to trigger auto-initialization

### Issue: "Email already registered"
**Cause**: Trying to register with existing email
**Solution**: Use different email or use login instead

## Production Considerations

### CORS Configuration
For production, update `allow_origins` to specific domains:
```python
allow_origins=[
    "https://yourdomain.com",
    "https://app.yourdomain.com",
    "https://mobile.yourdomain.com"
]
```

### Test User
Remove or disable test user auto-initialization in production:
```python
@app.on_event("startup")
def startup_event():
    if os.getenv("ENVIRONMENT") == "development":
        init_test_user()
```

### Secret Key
Change the SECRET_KEY in production:
```python
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
```

## Summary

All requested fixes have been implemented:
- ✅ CORS middleware verified and enhanced with explicit configuration
- ✅ Authorization headers properly sent for all protected routes
- ✅ Test credentials (test@gmail.com / test123) now work correctly
- ✅ Login and registration flows use real JWT tokens
- ✅ Default exports added to AuthContext.tsx and ThemeContext.tsx
- ✅ Emergency call button uses correct tel: method (was already correct)
- ✅ No deprecated UI props found (pointerEvents, boxShadow not used)
- ✅ Comprehensive error handling added to all auth flows

The application now has proper CORS support, working authentication with real JWT tokens, and improved developer experience with test credentials that function correctly.
