from shapely.geometry import Point, Polygon
from datetime import datetime
import math

class PolygonZone:
    def __init__(self, zone_id, name, coordinates, risk_level="normal", zone_type="city"):
        self.zone_id = zone_id
        self.name = name
        self.polygon = Polygon(coordinates)
        self.risk_level = risk_level  # "normal", "medium", "high"
        self.zone_type = zone_type  # city or risk

    def contains(self, lat, lon):
        return self.polygon.contains(Point(lon, lat))

class TouristTracker:
    def __init__(self):
        self.tourists = {}
        self.zones = []
        self.police_stations = []

    def add_zone(self, zone: PolygonZone):
        self.zones.append(zone)

    def add_police_station(self, name, lat, lon):
        self.police_stations.append({"name": name, "lat": lat, "lon": lon})

    def update_location(self, tourist_id, lat, lon):
        tourist = self.tourists.setdefault(tourist_id, {"history": [], "current_zones": {}})

        entered, exited = [], []
        new_state = {}

        for zone in self.zones:
            inside = zone.contains(lat, lon)
            prev_inside = tourist["current_zones"].get(zone.zone_id, False)
            new_state[zone.zone_id] = inside

            if inside and not prev_inside:
                entered.append(zone.zone_id)
                if zone.zone_type == "city":
                    tourist["history"].append({
                        "city": zone.name,
                        "entry": datetime.utcnow().isoformat() + "Z",
                        "exit": None
                    })

            if not inside and prev_inside:
                exited.append(zone.zone_id)
                for h in tourist["history"]:
                    if h["city"] == zone.name and h["exit"] is None:
                        h["exit"] = datetime.utcnow().isoformat() + "Z"

        tourist["current_zones"] = new_state

        nearest_police = self.find_nearest_police(lat, lon)
        risks = [z for z in self.zones if z.risk_level != "normal" and z.contains(lat, lon)]

        return {
            "entered": entered,
            "exited": exited,
            "new_state": new_state,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "nearest_police": nearest_police,
            "current_risks": [{"zone_id": z.zone_id, "name": z.name, "risk_level": z.risk_level} for z in risks],
            "travel_history": tourist["history"]
        }

    def find_nearest_police(self, lat, lon):
        def distance(a, b):
            return math.sqrt((a[0] - b[0])**2 + (a[1] - b[1])**2)

        if not self.police_stations:
            return None

        nearest = min(
            self.police_stations,
            key=lambda ps: distance((lat, lon), (ps["lat"], ps["lon"]))
        )
        nearest["status"] = "normal"
        return nearest
