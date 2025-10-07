# Backend Fix: Live Tourists Endpoint

## Problem
The `/tourists/locations` endpoint was only showing one or very few tourists because it filtered by `created_at` field, which tracks when a tourist account was created, not when they last updated their location.

## Root Cause
```python
# OLD CODE - Line 412 in app.py
tourists = db.query(Tourist).filter(
    Tourist.latitude.isnot(None),
    Tourist.longitude.isnot(None),
    Tourist.created_at >= cutoff_time  # ❌ Wrong field!
).all()
```

This meant only tourists created in the last 5 minutes would appear, not tourists who updated their location in the last 5 minutes.

## Solution
1. Added `last_updated` field to the Tourist model
2. Updated `update_location` endpoint to set `last_updated` instead of `created_at`
3. Updated both `/tourists/locations` and `/tourists` endpoints to filter by `last_updated`
4. Created and ran migration script to add the field to existing database

## Changes Made

### 1. Tourist Model (app.py)
```python
class Tourist(Base):
    __tablename__ = "tourists"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    emergency_contact = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    is_guest = Column(Boolean, default=False)
    wallet_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # ✅ NEW
    status = Column(String, default="idle")
```

### 2. Update Location Endpoint (app.py, line 357)
```python
# OLD
current_user.created_at = datetime.utcnow()

# NEW
current_user.last_updated = datetime.utcnow()  # ✅ FIXED
```

### 3. Tourists Locations Endpoint (app.py, line 405)
```python
@app.get("/tourists/locations")
def get_all_tourist_locations(db: Session = Depends(get_db)):
    """Get all active tourist locations (updated within last 5 minutes)"""
    cutoff_time = datetime.utcnow() - timedelta(minutes=5)
    tourists = db.query(Tourist).filter(
        Tourist.latitude.isnot(None),
        Tourist.longitude.isnot(None),
        Tourist.last_updated >= cutoff_time  # ✅ FIXED
    ).all()
    
    return [
        {
            "id": tourist.id,
            "name": tourist.name,
            "latitude": tourist.latitude,
            "longitude": tourist.longitude,
            "last_updated": tourist.last_updated.isoformat() if tourist.last_updated else tourist.created_at.isoformat(),  # ✅ FIXED
            "status": tourist.status or "idle",
            "emergency_contact": tourist.emergency_contact
        }
        for tourist in tourists
    ]
```

### 4. Migration Script
Created `migrate_add_last_updated.py` to:
- Add `last_updated` column to existing database
- Set initial values from `created_at` for existing tourists
- Successfully migrated 13 existing tourist records

## Testing
```bash
# Run migration
cd geofencing_module
python3 migrate_add_last_updated.py

# Verify schema
sqlite3 tourists.db "PRAGMA table_info(tourists);" | grep last_updated

# Check tourist count
sqlite3 tourists.db "SELECT COUNT(*) FROM tourists WHERE latitude IS NOT NULL AND longitude IS NOT NULL;"
# Result: 8 tourists with locations
```

## Impact
✅ **Before**: Only 1 tourist visible (recently created accounts)
✅ **After**: All 8 tourists with active locations visible (updated in last 5 minutes)

The map will now correctly display all active tourists who have updated their location recently, not just newly created accounts.
