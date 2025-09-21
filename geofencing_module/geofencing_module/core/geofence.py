from typing import List, Tuple, Dict
from shapely.geometry import Point, Polygon
from datetime import datetime

PointCoords = Tuple[float, float]  # (lon, lat)

class ZoneBase:
    def __init__(self, zone_id: str, name: str, risk_level: str = "low"):
        self.zone_id = zone_id
        self.name = name
        self.risk_level = risk_level

    def contains(self, point: PointCoords) -> bool:
        raise NotImplementedError

class PolygonZone(ZoneBase):
    def __init__(self, zone_id: str, name: str, coordinates: List[PointCoords], risk_level: str = "low"):
        super().__init__(zone_id, name, risk_level)
        self.coordinates = coordinates
        self.polygon = Polygon(coordinates)

    def contains(self, point: PointCoords) -> bool:
        p = Point(point)
        return self.polygon.contains(p)

class CircleZone(ZoneBase):
    def __init__(self, zone_id: str, name: str, center: PointCoords, radius_m: float, risk_level: str = "low"):
        super().__init__(zone_id, name, risk_level)
        self.center = center
        self.radius_m = radius_m

    def contains(self, point: PointCoords) -> bool:
        from geopy.distance import geodesic
        return geodesic((self.center[1], self.center[0]), (point[1], point[0])).meters <= self.radius_m

class ZoneManager:
    def __init__(self, zones: List[ZoneBase]):
        self.zones = {z.zone_id: z for z in zones}
        self.state = {z.zone_id: False for z in zones}

    def compute_transitions(self, point: PointCoords) -> Dict:
        entered = []
        exited = []
        new_state = {}
        for zone_id, zone in self.zones.items():
            inside = zone.contains(point)
            if inside and not self.state[zone_id]:
                entered.append(zone_id)
            if not inside and self.state[zone_id]:
                exited.append(zone_id)
            new_state[zone_id] = inside
            self.state[zone_id] = inside
        return {
            "entered": entered,
            "exited": exited,
            "new_state": new_state,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
