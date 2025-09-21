from fastapi import FastAPI
from pydantic import BaseModel
from geofencing_module.core.tracker import TouristTracker, PolygonZone

import base64

app = FastAPI()
tracker = TouristTracker()

# --- Models ---
class LocationUpdate(BaseModel):
    tourist_id: str
    lat: float
    lon: float

class SOSRequest(BaseModel):
    tourist_id: str
    message: str

# --- Setup Example Zones ---
tracker.add_zone(PolygonZone("city1", "Mumbai", [(72.82, 19.04), (72.86, 19.04), (72.86, 19.08), (72.82, 19.08)], "normal", "city"))
tracker.add_zone(PolygonZone("protest_area", "Malvani Protest", [(72.82, 19.07), (72.84, 19.07), (72.84, 19.09), (72.82, 19.09)], "high", "risk"))

tracker.add_police_station("Bandra Police Station", 19.055, 72.84)
tracker.add_police_station("Malvani Block 5", 19.078, 72.83)

# --- API Routes ---
@app.post("/update_location")
def update_location(loc: LocationUpdate):
    return tracker.update_location(loc.tourist_id, loc.lat, loc.lon)

@app.get("/map_zones")
def get_map_zones():
    """Returns zones with color coding for frontend map rendering"""
    colors = {"normal": "green", "medium": "yellow", "high": "red"}
    return [
        {
            "zone_id": z.zone_id,
            "name": z.name,
            "risk_level": z.risk_level,
            "color": colors.get(z.risk_level, "gray"),
            "coordinates": list(z.polygon.exterior.coords)
        }
        for z in tracker.zones
    ]

@app.post("/sos")
def sos(req: SOSRequest):
    """Simulates sending encrypted SOS to nearest police"""
    tourist_data = tracker.tourists.get(req.tourist_id)
    if not tourist_data:
        return {"status": "error", "message": "Tourist not found"}

    # Encrypt message (base64 for now)
    encrypted_msg = base64.b64encode(req.message.encode()).decode()

    # Find nearest police station (just pick last known coords)
    last_city = tourist_data["history"][-1] if tourist_data["history"] else None
    nearest = tracker.find_nearest_police(19.05, 72.85)  # fallback coords

    return {
        "status": "sent",
        "encrypted_message": encrypted_msg,
        "to": nearest,
        "last_city": last_city
    }
