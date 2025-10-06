"""
Demo Seed Data Script
Populates the database with sample data for demonstration purposes
"""
from sqlalchemy.orm import Session
from app import SessionLocal, Tourist, Zone, PoliceStation, PanicAlert, get_password_hash
from datetime import datetime, timedelta
import json

def seed_demo_data():
    """Seed the database with demo data"""
    db = SessionLocal()
    
    try:
        # Clear existing data (optional - comment out if you want to keep existing data)
        print("Clearing existing demo data...")
        db.query(PanicAlert).delete()
        db.query(Zone).delete()
        db.query(PoliceStation).delete()
        # Don't delete tourists to preserve login credentials
        
        # Add Demo Tourists
        print("Adding demo tourists...")
        demo_tourists = [
            {
                "name": "John Doe",
                "email": "john@demo.com",
                "password": "demo123",
                "emergency_contact": "+1-555-123-4567",
                "latitude": 19.076,
                "longitude": 72.8777,
                "status": "idle"
            },
            {
                "name": "Maria Garcia",
                "email": "maria@demo.com",
                "password": "demo123",
                "emergency_contact": "+34-612-345-678",
                "latitude": 19.085,
                "longitude": 72.885,
                "status": "moving"
            },
            {
                "name": "Chen Wei",
                "email": "chen@demo.com",
                "password": "demo123",
                "emergency_contact": "+86-138-0000-0000",
                "latitude": 19.055,
                "longitude": 72.84,
                "status": "idle"
            }
        ]
        
        for tourist_data in demo_tourists:
            # Check if tourist already exists
            existing = db.query(Tourist).filter(Tourist.email == tourist_data["email"]).first()
            if not existing:
                tourist = Tourist(
                    name=tourist_data["name"],
                    email=tourist_data["email"],
                    password_hash=get_password_hash(tourist_data["password"]),
                    emergency_contact=tourist_data["emergency_contact"],
                    latitude=tourist_data["latitude"],
                    longitude=tourist_data["longitude"],
                    status=tourist_data["status"],
                    created_at=datetime.utcnow()
                )
                db.add(tourist)
                print(f"  Added tourist: {tourist_data['name']}")
            else:
                # Update location for existing tourist
                existing.latitude = tourist_data["latitude"]
                existing.longitude = tourist_data["longitude"]
                existing.status = tourist_data["status"]
                existing.created_at = datetime.utcnow()
                print(f"  Updated tourist: {tourist_data['name']}")
        
        db.commit()
        
        # Add Police Stations (Mumbai area)
        print("Adding police stations...")
        police_stations = [
            {"name": "Bandra Police Station", "latitude": 19.055, "longitude": 72.84},
            {"name": "Andheri Police Station", "latitude": 19.115, "longitude": 72.869},
            {"name": "Malvani Police Station", "latitude": 19.178, "longitude": 72.83},
            {"name": "Colaba Police Station", "latitude": 18.906, "longitude": 72.822},
            {"name": "Powai Police Station", "latitude": 19.121, "longitude": 72.906}
        ]
        
        for station_data in police_stations:
            station = PoliceStation(**station_data)
            db.add(station)
            print(f"  Added: {station_data['name']}")
        
        db.commit()
        
        # Add Safety Zones (Must-Visit Places)
        print("Adding safety zones (must-visit places)...")
        safety_zones = [
            {
                "zone_id": "gateway_of_india",
                "name": "Gateway of India",
                "risk_level": "normal",
                "zone_type": "tourist_attraction",
                "coordinates": [
                    [72.834, 18.921],
                    [72.836, 18.921],
                    [72.836, 18.923],
                    [72.834, 18.923],
                    [72.834, 18.921]
                ]
            },
            {
                "zone_id": "marine_drive",
                "name": "Marine Drive",
                "risk_level": "normal",
                "zone_type": "tourist_attraction",
                "coordinates": [
                    [72.823, 18.943],
                    [72.824, 18.943],
                    [72.824, 18.945],
                    [72.823, 18.945],
                    [72.823, 18.943]
                ]
            },
            {
                "zone_id": "juhu_beach",
                "name": "Juhu Beach",
                "risk_level": "normal",
                "zone_type": "tourist_attraction",
                "coordinates": [
                    [72.826, 19.098],
                    [72.828, 19.098],
                    [72.828, 19.100],
                    [72.826, 19.100],
                    [72.826, 19.098]
                ]
            },
            {
                "zone_id": "bandra_fort",
                "name": "Bandra Fort",
                "risk_level": "normal",
                "zone_type": "tourist_attraction",
                "coordinates": [
                    [72.820, 19.043],
                    [72.822, 19.043],
                    [72.822, 19.045],
                    [72.820, 19.045],
                    [72.820, 19.043]
                ]
            },
            {
                "zone_id": "siddhivinayak_temple",
                "name": "Siddhivinayak Temple",
                "risk_level": "normal",
                "zone_type": "tourist_attraction",
                "coordinates": [
                    [72.830, 19.016],
                    [72.832, 19.016],
                    [72.832, 19.018],
                    [72.830, 19.018],
                    [72.830, 19.016]
                ]
            }
        ]
        
        for zone_data in safety_zones:
            zone = Zone(
                zone_id=zone_data["zone_id"],
                name=zone_data["name"],
                risk_level=zone_data["risk_level"],
                zone_type=zone_data["zone_type"],
                coordinates=json.dumps(zone_data["coordinates"])
            )
            db.add(zone)
            print(f"  Added: {zone_data['name']}")
        
        db.commit()
        
        # Add Risk Zones (Danger Areas)
        print("Adding risk zones (danger areas)...")
        risk_zones = [
            {
                "zone_id": "dharavi",
                "name": "Dharavi Area",
                "risk_level": "medium",
                "zone_type": "risk_zone",
                "coordinates": [
                    [72.850, 19.040],
                    [72.855, 19.040],
                    [72.855, 19.045],
                    [72.850, 19.045],
                    [72.850, 19.040]
                ]
            },
            {
                "zone_id": "kamathipura",
                "name": "Kamathipura Area",
                "risk_level": "high",
                "zone_type": "risk_zone",
                "coordinates": [
                    [72.831, 18.966],
                    [72.834, 18.966],
                    [72.834, 18.969],
                    [72.831, 18.969],
                    [72.831, 18.966]
                ]
            },
            {
                "zone_id": "mankhurd",
                "name": "Mankhurd Industrial Area",
                "risk_level": "medium",
                "zone_type": "risk_zone",
                "coordinates": [
                    [72.933, 19.038],
                    [72.938, 19.038],
                    [72.938, 19.043],
                    [72.933, 19.043],
                    [72.933, 19.038]
                ]
            },
            {
                "zone_id": "kurla_west",
                "name": "Kurla West Protest Area",
                "risk_level": "high",
                "zone_type": "risk_zone",
                "coordinates": [
                    [72.874, 19.070],
                    [72.878, 19.070],
                    [72.878, 19.074],
                    [72.874, 19.074],
                    [72.874, 19.070]
                ]
            }
        ]
        
        for zone_data in risk_zones:
            zone = Zone(
                zone_id=zone_data["zone_id"],
                name=zone_data["name"],
                risk_level=zone_data["risk_level"],
                zone_type=zone_data["zone_type"],
                coordinates=json.dumps(zone_data["coordinates"])
            )
            db.add(zone)
            print(f"  Added: {zone_data['name']}")
        
        db.commit()
        
        print("\n✅ Demo data seeded successfully!")
        print("\nDemo Login Credentials:")
        print("  john@demo.com / demo123")
        print("  maria@demo.com / demo123")
        print("  chen@demo.com / demo123")
        
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🌱 Seeding demo data...")
    print("=" * 50)
    seed_demo_data()
