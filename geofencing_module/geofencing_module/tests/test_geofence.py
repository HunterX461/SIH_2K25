import unittest
from geofencing_module.core.geofence import PolygonZone, CircleZone, ZoneManager, compute_transitions

class GeofenceTests(unittest.TestCase):
    def test_polygon_contains(self):
        coords = [(0,0), (0,10), (10,10), (10,0)]
        poly = PolygonZone("p1", "square", coords)
        manager = ZoneManager([poly])
        # point inside (x,y) ~ (lon, lat)
        self.assertTrue(poly.contains((5,5)))
        self.assertEqual([z.zone_id for z in manager.zones_containing_point((5,5))], ["p1"])

    def test_circle_contains(self):
        # center (0,0) radius 2000m ~ 2km
        circle = CircleZone("c1", "center", center=(0.0, 0.0), radius_meters=2000)
        manager = ZoneManager([circle])
        # point ~ 1km away (approx)
        self.assertTrue(circle.contains((0.005, 0.0)))  # ~0.005 deg ~ 555m at equator
        self.assertFalse(circle.contains((0.1, 0.0)))  # far away

    def test_transitions(self):
        coords = [(0,0), (0,10), (10,10), (10,0)]
        poly = PolygonZone("p1", "square", coords)
        manager = ZoneManager([poly])
        prev = {}
        outside = (20,20)
        inside = (5,5)
        res = compute_transitions(prev, outside, manager)
        self.assertEqual(res["entered"], [])
        self.assertEqual(res["exited"], [])
        prev = res["new_state"]
        res = compute_transitions(prev, inside, manager)
        self.assertEqual(res["entered"], ["p1"])
        self.assertEqual(res["exited"], [])

if __name__ == '__main__':
    unittest.main()
