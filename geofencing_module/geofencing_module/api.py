from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
from geofencing_module.core.geofence import PolygonZone
from geofencing_module.core.tracker import TouristTracker

app = FastAPI()

# Define zones (example)
zones = [
    PolygonZone("city1", "Mumbai", [(72.8,19.0),(72.9,19.0),(72.9,19.1),(72.8,19.1)], "low"),
    PolygonZone("city2", "Pune", [(73.8,18.5),(73.9,18.5),(73.9,18.6),(73.8,18.6)], "medium")
]

# Define police stations
police_stations = [
    {"name": "Mumbai Central", "lat": 19.076, "lon": 72.8777},
    {"name": "Pune Central", "lat": 18.5204, "lon": 73.8567}
]

trackers = {}  # tourist_id -> TouristTracker

class LocationUpdate(BaseModel):
    tourist_id: str
    lat: float
    lon: float

@app.post("/update_location")
def update_location(data: LocationUpdate):
    if data.tourist_id not in trackers:
        trackers[data.tourist_id] = TouristTracker(data.tourist_id, zones, police_stations)
    tracker = trackers[data.tourist_id]
    return tracker.update_location(data.lat, data.lon)
