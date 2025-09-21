from geofencing_module.core.geofence import PolygonZone, CircleZone, ZoneManager, compute_transitions

def main():
    # Note: coordinates are (lon, lat)
    # Simple square polygon around (0.0, 0.0) to (0.1, 0.1)
    poly_coords = [
        (72.835, 19.055),
        (72.840, 19.057),
        (72.843, 19.050),
        (72.836, 19.048)
    ]
    poly = PolygonZone("zone_poly", "Restricted Forest", poly_coords, risk_level="high")

    # circle zone example: center near the polygon
    circle = CircleZone("zone_circle", "Small Camp", center=(72.838, 19.055), radius_meters=200, risk_level="medium")

    manager = ZoneManager([poly, circle])

    # user points (lon, lat)
    p_outside = (72.850, 19.060)
    p_inside_circle = (72.838, 19.055)
    p_inside_poly = (72.838, 19.053)

    state = {}

    print("Outside point zones:", [z.zone_id for z in manager.zones_containing_point(p_outside)])
    t = compute_transitions(state, p_outside, manager)
    print("transitions:", t)
    state = t["new_state"]

    print("Going to circle point")
    t = compute_transitions(state, p_inside_circle, manager)
    print("transitions:", t)
    state = t["new_state"]

    print("Going to polygon point")
    t = compute_transitions(state, p_inside_poly, manager)
    print("transitions:", t)
    state = t["new_state"]

if __name__ == "__main__":
    main()
