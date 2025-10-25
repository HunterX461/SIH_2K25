# Must-Visit Places Feature Documentation

## Overview

The Must-Visit Places feature allows administrators to manage a database of popular tourist destinations that are displayed to users in the mobile app. Users can browse places, view details, and navigate to them on the map.

## Architecture

### Backend (FastAPI + SQLAlchemy)

**Database Model: `Place`**
- `id`: Primary key (auto-increment)
- `name`: Place name (indexed)
- `description`: Detailed description
- `latitude`: GPS latitude coordinate
- `longitude`: GPS longitude coordinate
- `category`: Type of place (monument, temple, heritage, park, museum, etc.)
- `image_url`: Optional URL to place image
- `is_active`: Boolean flag for soft-delete (only active places shown to users)
- `created_at`: Timestamp of creation

**API Endpoints:**

1. **GET /places** - List all active places
   - Optional query parameter: `?category=monument` to filter by category
   - Returns: Array of Place objects
   - Authentication: Not required (public endpoint)

2. **POST /places** - Create a new place
   - Request body: `{ name, description, latitude, longitude, category, image_url? }`
   - Returns: Created Place object
   - Authentication: Currently open (can be secured with admin role)

3. **PATCH /places/{id}** - Update an existing place
   - Request body: Any subset of Place fields to update
   - Returns: Updated Place object
   - Authentication: Currently open (can be secured with admin role)

4. **DELETE /places/{id}** - Soft-delete a place
   - Sets `is_active = False` instead of deleting from database
   - Returns: Success message
   - Authentication: Currently open (can be secured with admin role)

### Frontend (React Native + Expo)

**Components:**

1. **MustVisitPlaces.tsx** - Main display component
   - Fetches places from `/places` endpoint
   - Displays horizontal carousel of place cards
   - Shows place images (or placeholder), name, description, category badge
   - Clicking a card opens detail modal
   - Loading and error states with retry functionality

2. **PlacesAdminModal.tsx** - Admin management UI
   - List all places with edit/delete actions
   - Form to create new places with validation
   - Form to edit existing places
   - Accessible from Settings > Admin Tools > Manage Must-Visit Places

**Map Integration:**
- Places displayed on map with gold markers and ⭐ icon
- Detail modal has "Show on Map" button
- Clicking button navigates to maps tab with place coordinates
- Map automatically focuses on selected place

## Setup & Usage

### Initial Setup

1. **Install dependencies:**
   ```bash
   cd geofencing_module
   pip install -r requirements.txt
   ```

2. **Run database migrations:**
   The Place table is automatically created when the app starts (via `Base.metadata.create_all()`).

3. **Seed initial data:**
   ```bash
   cd geofencing_module
   python seed_places.py
   ```
   This populates the database with 15 popular Indian tourist destinations.

### Managing Places

**Via Admin UI (Recommended):**
1. Open the mobile app
2. Go to Settings tab
3. Click "Manage Must-Visit Places" under Admin Tools
4. Use the UI to add, edit, or delete places

**Via API (curl examples):**

Create a new place:
```bash
curl -X POST http://localhost:8000/places \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lotus Temple",
    "description": "A Baháʼí House of Worship in Delhi, notable for its flower-like shape.",
    "latitude": 28.5535,
    "longitude": 77.2588,
    "category": "temple",
    "image_url": "https://example.com/lotus-temple.jpg"
  }'
```

Update a place:
```bash
curl -X PATCH http://localhost:8000/places/1 \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description with more details..."
  }'
```

List all places:
```bash
curl http://localhost:8000/places
```

Filter by category:
```bash
curl http://localhost:8000/places?category=monument
```

Soft-delete a place:
```bash
curl -X DELETE http://localhost:8000/places/1
```

### Categories

Available categories (can be extended):
- `monument` - Historical monuments, forts, palaces
- `temple` - Religious places, temples, churches, mosques
- `heritage` - UNESCO heritage sites, ancient ruins
- `park` - Parks, gardens, nature reserves
- `museum` - Museums, art galleries
- `beach` - Beaches, coastal areas
- `fort` - Forts and fortifications
- `palace` - Palaces and royal residences

## Developer Notes

### Geofencing & Risk Zones

**How Geofencing Works:**

The app implements real-time geofencing for tourist safety:

1. **Location Tracking:**
   - Tourist's GPS coordinates sent to backend every 30 seconds or 50 meters
   - `last_updated` timestamp tracks active tourists (5-minute threshold)
   - Movement detection compares current vs previous coordinates

2. **Zone Detection:**
   - Point-in-polygon algorithm checks if tourist is in any zone
   - Uses bounding box for efficient proximity checks
   - Prioritizes danger zones > safe zones > must-visit places

3. **Risk Assessment:**
   - Danger zones (high/medium risk) trigger immediate alerts
   - Tourist status updated: idle → moving → in_danger_zone
   - Police stations notified when tourist enters high-risk area

4. **For Police/Authorities:**
   - Real-time dashboard shows all tourists on map
   - Color-coded markers: red=emergency, orange=moving, blue=idle
   - View tourist's location, emergency contact, and status
   - Receive alerts when tourists enter danger zones

5. **For Tourists:**
   - Automatic notifications when entering danger zones
   - Visual map with safe/danger zone overlays
   - Must-visit places suggested based on location
   - Safety score calculated based on current zone

**Risk Zone Updates:**

Risk zones are updated through multiple mechanisms:

1. **Manual Updates (Police/Admin):**
   - `PUT /zones/{zone_id}` endpoint for zone modifications
   - Can update risk_level, coordinates, name
   - Changes broadcast to all tourists in the zone

2. **Automated Risk Assessment:**
   - Analyzes incident history (last 30 days)
   - Incident count and severity calculate risk level
   - Scheduled job runs daily to update zone risk levels

3. **Data Sources:**
   - Police incident reports (via `/sos` endpoint)
   - Tourist feedback and SOS alerts
   - Crime statistics APIs (to be integrated)
   - Government advisory systems (to be integrated)

4. **No Network Zones:**
   - App caches last known safe/danger zones
   - Location updates queued when offline
   - SMS fallback for emergency SOS (to be implemented)
   - Offline maps with pre-loaded zone data (to be implemented)

### Extending the Feature

**Adding New Fields:**
1. Update `Place` model in `geofencing_module/app.py`
2. Create migration or recreate database
3. Update `PlaceCreate`, `PlaceUpdate`, and `PlaceResponse` Pydantic models
4. Update API service in `ui/app/services/apiService.ts`
5. Update UI components to display new fields

**Adding Authentication:**
1. Uncomment the `current_user: Tourist = Depends(get_current_user)` parameter in endpoints
2. Add role-based access control (RBAC) for admin operations
3. Create `is_admin` field in Tourist model
4. Update frontend to pass authentication token

**Adding Image Upload:**
1. Implement file upload endpoint with multipart/form-data
2. Store images in cloud storage (AWS S3, Cloudinary, etc.)
3. Return image URL to save in `image_url` field
4. Update admin form to include image picker

## Testing

### Manual Testing

1. **Backend Testing:**
   ```bash
   # Start server
   cd geofencing_module
   python app.py
   
   # Test endpoints
   curl http://localhost:8000/places
   curl -X POST http://localhost:8000/places -H "Content-Type: application/json" -d '...'
   ```

2. **Frontend Testing:**
   ```bash
   cd ui
   npm install
   npm run dev
   
   # Test in Expo Go app on phone
   # Or use web: npm run build:web
   ```

3. **Integration Testing:**
   - Register a test user
   - Navigate to dashboard and verify places carousel appears
   - Click a place to open detail modal
   - Click "Show on Map" and verify navigation
   - Go to Settings > Admin Tools > Manage Must-Visit Places
   - Create a new place and verify it appears in the app

### Automated Testing (To Be Implemented)

Recommended test cases:
- Backend: pytest tests for all CRUD operations
- Frontend: Jest/React Native Testing Library for components
- E2E: Detox for full app flow testing

## Troubleshooting

**Places not showing in app:**
- Verify backend server is running on correct port
- Check `EXPO_PUBLIC_API_BASE` environment variable
- Ensure places have `is_active = true`
- Check browser console / app logs for errors

**Admin modal not accessible:**
- Verify `PlacesAdminModal` is imported in settings.tsx
- Check if "Admin Tools" section appears in Settings

**Map markers not appearing:**
- Ensure places have valid latitude/longitude
- Check if map permissions are granted
- Verify `getPlaces()` API call succeeds

**"Show on Map" button not working:**
- Check route params are passed correctly
- Verify maps.tsx has `useLocalSearchParams()` hook
- Ensure `focusLat` and `focusLon` params are used

## Future Enhancements

- [ ] Add place ratings and reviews
- [ ] Implement nearby places search with radius
- [ ] Add opening hours and ticket prices
- [ ] Integrate with Google Places API for richer data
- [ ] Add user-generated places (with moderation)
- [ ] Implement place bookmarking/favorites
- [ ] Add directions/navigation to places
- [ ] Include place photos gallery
- [ ] Add audio guides for places
- [ ] Implement AR features for historical sites

## API Reference Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /places | List active places | No |
| GET | /places?category=X | Filter by category | No |
| POST | /places | Create place | No (should be admin) |
| PATCH | /places/{id} | Update place | No (should be admin) |
| DELETE | /places/{id} | Soft-delete place | No (should be admin) |

## Contact

For questions or issues with this feature:
- Open an issue on GitHub
- Contact the development team
- See TECHNICAL_ARCHITECTURE.md for more details
