```markdown
# Must Visit Places — Developer & Admin Guide

This document explains the "Must Visit Places" feature: how places are stored, how to manage them, and how the UI integrates with the map.

## Backend
- SQLAlchemy model: `places` table with id, name, description, latitude, longitude, category, image_url, is_active, created_at.
- Endpoints:
  - GET /places — returns active places
  - POST /places — create place
  - PATCH /places/{id} — update place
  - DELETE /places/{id} — soft-delete place (is_active=false)

### Seeding (development only)
A small seed script should be added to insert sample must-visit places. Run it only in development.

## Frontend
- Component: `ui/app/components/MustVisitPlaces.tsx`
- Dashboard integration: component is shown under Quick Actions.
- Map integration: the component dispatches `centerMapOnPlace` events; the map listens and centers/opens popup.

## No-network & Geofencing notes
- No-network: the app should cache location/emergency actions locally and sync when network returns. For critical emergencies, consider SMS fallback or pre-configured emergency hotlines. Document this in product notes for stakeholders.
- Geofencing: backend stores polygon/zone definitions; a geofence check can be performed server-side on location updates or client-side (point-in-polygon). Police updates to risk zones can be pushed via admin API and consumed by the app via polling or push notifications (or an admin push mechanism).

## Testing examples (curl)
- List places:
  ```bash
  curl http://localhost:8000/places
  ```
- Create place:
  ```bash
  curl -X POST http://localhost:8000/places -H "Content-Type: application/json" -d '{"name":"Lighthouse","latitude":12.34,"longitude":56.78}'
  ```
```
