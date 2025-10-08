# Testing Guide - Critical Fixes

This guide provides step-by-step instructions to test all the implemented features.

## Prerequisites

1. **Backend Running**
   ```bash
   cd geofencing_module
   python app.py
   ```
   Backend should be running on `http://localhost:8000`

2. **Mobile App Running**
   ```bash
   cd ui
   npm install --legacy-peer-deps
   npm run dev
   ```
   Metro bundler should be running on `http://localhost:8081`

3. **Test User Account**
   - Create a new account via the app's Register tab
   - Or use an existing account from the database

---

## Test Cases

### 1. Quick Actions Navigation ✅

**Steps:**
1. Login to the app
2. Navigate to the Home tab (bottom navigation)
3. Scroll to "Quick Actions" section
4. Test each action:

**Emergency SOS:**
- Tap "Emergency SOS" card
- ✅ Should navigate to Emergency tab
- ✅ Emergency tab should open with SOS button visible

**Track Location:**
- Go back to Home tab
- Tap "Track Location" card
- ✅ Should navigate to Maps tab
- ✅ Map should display with user's current location

**Emergency Contacts:**
- Go back to Home tab
- Tap "Emergency Contacts" card
- ✅ Should navigate to Profile tab
- ✅ Profile page should show with quick actions

**Expected Result:** All three quick actions should navigate to their respective tabs without errors.

---

### 2. Profile Editing Functionality ✅

**Steps:**
1. Navigate to Profile tab
2. Verify initial state:
   - Name is displayed
   - Emergency Contact is displayed
   - Tourist ID is displayed
3. Tap "Edit Profile" button
4. Edit fields:
   - Change name to "Test User Updated"
   - Change emergency contact to "+1234567890"
5. Tap "Save" button

**Expected Results:**
- ✅ Button should change from "Edit Profile" to "Save"
- ✅ Input fields should appear when editing
- ✅ After saving, fields should display updated values
- ✅ Success message should appear
- ✅ Changes should persist when navigating away and back

**Backend Verification:**
```bash
# User data should be stored in AuthContext
# Can verify by logging out and logging back in
```

---

### 3. Global Dark Mode ✅

**Steps:**
1. Navigate to Settings tab
2. Find "Dark Mode" toggle under "Appearance"
3. Toggle Dark Mode ON
4. Check all tabs:

**Home Tab:**
- ✅ Background should be dark (#0F172A)
- ✅ Text should be light colored
- ✅ Cards should have dark surface color
- ✅ Safety score card should be themed

**Profile Tab:**
- ✅ Background should be dark
- ✅ Avatar background should be themed
- ✅ All text should be readable
- ✅ Quick action cards should be themed
- ✅ Input fields (when editing) should be dark

**Maps Tab:**
- ✅ Map should use dark style
- ✅ Legend should have dark background
- ✅ Control button should be themed
- ✅ All text should be light colored

**Emergency Tab:**
- ✅ Red emergency background remains (by design)
- ✅ Status bar should adapt to dark theme

**Settings Tab:**
- ✅ Background should be dark
- ✅ All sections should be themed
- ✅ Switches and controls should be visible

5. Toggle Dark Mode OFF
6. Verify all tabs return to light theme

**Expected Result:** Theme should apply consistently across all screens and persist after app restart.

---

### 4. Must Visit Places on Dashboard ✅

**Steps:**
1. Ensure backend has must-visit places:
   ```bash
   # Check backend API
   curl http://localhost:8000/must_visit_places
   ```
2. Navigate to Home tab
3. Scroll down to find "Must Visit Places" card (below Quick Actions, above Recent Alerts)
4. Verify card displays:
   - ⭐ Star icon in header
   - "Must Visit Places" title
   - Horizontal scrollable list of places
   - Each place shows:
     - Icon
     - Name
     - Description
     - Distance (if location permission granted)

**Expected Results:**
- ✅ Card appears between Quick Actions and Recent Alerts
- ✅ Shows loading indicator while fetching
- ✅ Displays up to 5 places
- ✅ Horizontal scroll works smoothly
- ✅ If no places available, card doesn't show

**Backend Test:**
```bash
# Verify must-visit places exist
curl http://localhost:8000/must_visit_places
# Should return array of places with latitude, longitude, name, description
```

---

### 5. Dynamic User Registration ✅

**Steps:**
1. Logout from the app
2. On login screen, tap "Register" tab
3. Fill in form:
   - Name: "New Test User"
   - Email: "newtester@example.com"
   - Password: "TestPass123"
   - Emergency Contact: "+1987654321"
4. Tap "Register" button

**Expected Results:**
- ✅ Registration should succeed
- ✅ User should be automatically logged in
- ✅ Should navigate to Home tab
- ✅ Profile should show new user's data

5. Logout and login again with same credentials
   - Email: "newtester@example.com"
   - Password: "TestPass123"

**Expected Results:**
- ✅ Login should succeed
- ✅ User data should be loaded correctly
- ✅ No hardcoded test user bypass

**Backend Verification:**
```bash
# Check database for new user
cd geofencing_module
sqlite3 tourists.db "SELECT name, email FROM tourists WHERE email='newtester@example.com';"
# Should show the new user
```

---

### 6. SOS Cancel Functionality ✅

**Steps:**
1. Navigate to Emergency tab
2. Tap the large red SOS button
3. Confirm the alert in the dialog
4. Verify emergency state:
   - Emergency indicator appears
   - "EMERGENCY ACTIVE" text shows
   - Countdown timer starts
   - "Cancel Alert" button appears
5. Tap "Cancel Alert" button
6. Confirm cancellation in dialog

**Expected Results:**
- ✅ Emergency state should clear
- ✅ Countdown should stop
- ✅ Emergency indicator should disappear
- ✅ SOS button should return to normal state
- ✅ Backend alert status updated to "cancelled"

**Backend Verification:**
```bash
# Check alert status in database
cd geofencing_module
sqlite3 tourists.db "SELECT status FROM panic_alerts ORDER BY id DESC LIMIT 1;"
# Should show "cancelled"
```

**API Test:**
```bash
# Create SOS alert
TOKEN="your-jwt-token"
curl -X POST http://localhost:8000/sos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 19.0760, "longitude": 72.8777, "message": "Test emergency"}'

# Note the alert_id from response

# Cancel alert
ALERT_ID=1
curl -X PUT http://localhost:8000/alerts/$ALERT_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"alert_id": '$ALERT_ID', "status": "cancelled"}'

# Should return success with new_status: "cancelled"
```

---

### 7. Tourist Map Visibility ✅

**Steps:**
1. Ensure location permissions are granted
2. Navigate to Maps tab
3. Verify map elements:

**User Location:**
- ✅ Blue dot showing current location
- ✅ Map centered on user location

**Tourist Markers:**
- ✅ Different colored pins for different statuses:
  - Red pin = Emergency 🚨
  - Orange pin = Moving
  - Blue pin = Idle
- ✅ Tap marker to see tourist info
- ✅ Shows tourist name and status

**Must-Visit Places:**
- ✅ Gold pins (⭐) for must-visit places
- ✅ Tap to see place name and description

**Zones:**
- ✅ Green circles for safe zones
- ✅ Red circles for danger zones
- ✅ Semi-transparent fill

**Legend:**
- ✅ Legend box in top-left corner
- ✅ Shows all marker types
- ✅ Text color adapts to theme

**Controls:**
- ✅ Center button (bottom-right)
- ✅ Tap to center map on user location

**Dark Mode:**
- Toggle dark mode in Settings
- Return to Maps tab
- ✅ Map style should change to dark theme
- ✅ Roads, water, and labels should be dark colored

**Expected Results:**
- All map elements render correctly
- No overlapping or missing markers
- Legend is readable
- Controls work smoothly

**Backend Verification:**
```bash
# Check tourists are being tracked
curl http://localhost:8000/tourists/locations
# Should return array of tourists with locations

# Check zones exist
curl http://localhost:8000/zones
# Should return array of zones

# Check must-visit places
curl http://localhost:8000/must_visit_places
# Should return array of places
```

---

## Integration Tests

### End-to-End User Flow

**Scenario: New tourist arrives and uses the app**

1. **Registration**
   - Open app
   - Register with email: "tourist@example.com"
   - Password: "Secure123"
   - Emergency contact: "+1234567890"
   - ✅ Registration successful

2. **Home Screen**
   - View safety score
   - See must-visit places nearby
   - ✅ All data loads correctly

3. **Check Map**
   - Navigate to Maps tab
   - See current location
   - View nearby safe/danger zones
   - Find must-visit places (gold pins)
   - ✅ Map displays all data

4. **Update Profile**
   - Navigate to Profile tab
   - Edit name and emergency contact
   - Save changes
   - ✅ Changes persist

5. **Toggle Dark Mode**
   - Go to Settings tab
   - Enable dark mode
   - Check all tabs look good
   - ✅ Dark mode applies globally

6. **Emergency Scenario**
   - Navigate to Emergency tab
   - Trigger SOS alert
   - Wait for countdown
   - Cancel alert
   - ✅ SOS works and can be cancelled

---

## Performance Tests

### App Performance Metrics

1. **Initial Load Time**
   - App should load within 3-5 seconds
   - Home screen should appear immediately after login

2. **Navigation Speed**
   - Tab switching should be instant
   - No lag when navigating

3. **Map Performance**
   - Map should render within 2 seconds
   - Smooth panning and zooming
   - No frame drops

4. **API Response Times**
   - Location updates: < 1 second
   - Must-visit places fetch: < 2 seconds
   - SOS alert: < 500ms

---

## Regression Tests

### Verify Existing Features Still Work

1. **Authentication**
   - ✅ Login with existing account works
   - ✅ Guest mode works
   - ✅ Logout works

2. **Location Tracking**
   - ✅ Location updates every 30 seconds
   - ✅ Background location tracking works

3. **Safety Score**
   - ✅ Displays on home screen
   - ✅ Updates based on location

4. **Recent Alerts**
   - ✅ Shows on home screen
   - ✅ Displays recent SOS alerts

---

## Known Issues & Limitations

1. **Web Build**: Web build fails due to dependency conflicts (documented, not fixed in this PR)
2. **ESLint**: Some existing ESLint warnings remain (not related to new changes)
3. **Offline Mode**: Offline features documented but not fully implemented yet

---

## Automated Testing Commands

```bash
# Run linter
cd ui
npm run lint

# TypeScript compilation check
npx tsc --noEmit

# Backend tests (if available)
cd geofencing_module
python -m pytest
```

---

## Troubleshooting

### Issue: Quick actions don't navigate
**Solution:** Ensure expo-router is properly configured and all tabs exist in `(tabs)/_layout.tsx`

### Issue: Dark mode doesn't persist
**Solution:** Check AsyncStorage permissions and ensure ThemeContext is properly wrapping the app

### Issue: Must-visit places don't load
**Solution:** 
- Verify backend is running
- Check network connection
- Ensure must-visit places exist in database
- Grant location permissions for distance calculation

### Issue: SOS cancel doesn't work
**Solution:**
- Verify user is authenticated
- Check backend endpoint is reachable
- Ensure alert_id is being stored correctly

### Issue: Map doesn't show tourists
**Solution:**
- Verify location permissions granted
- Check backend `/tourists/locations` endpoint
- Ensure tourists have updated locations (within last 5 minutes)

---

## Success Criteria

All features should:
- ✅ Compile without errors
- ✅ Run without crashes
- ✅ Work as documented
- ✅ Support both light and dark themes
- ✅ Have responsive UI
- ✅ Handle errors gracefully
- ✅ Persist data correctly

---

*Last Updated: December 2024*
