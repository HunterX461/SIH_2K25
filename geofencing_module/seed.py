"""
Seed script to populate the database with initial zones and police stations
Run this script once to set up initial data for the Tourist Safety System
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import json
from app import Base, Zone, PoliceStation

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./tourists.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_database():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Clear existing data
        print("Clearing existing zones and police stations...")
        db.query(Zone).delete()
        db.query(PoliceStation).delete()
        db.commit()
        
        # Seed Zones
        print("Seeding zones...")
        zones = [
            {
                "zone_id": "mumbai_gateway",
                "name": "Gateway of India",
                "risk_level": "normal",
                "zone_type": "tourist",
                "coordinates": [[72.8347, 18.9220], [72.8357, 18.9220], [72.8357, 18.9230], [72.8347, 18.9230]]
            },
            {
                "zone_id": "mumbai_marine_drive",
                "name": "Marine Drive",
                "risk_level": "normal",
                "zone_type": "tourist",
                "coordinates": [[72.8230, 18.9432], [72.8250, 18.9432], [72.8250, 18.9450], [72.8230, 18.9450]]
            },
            {
                "zone_id": "mumbai_dharavi",
                "name": "Dharavi Area",
                "risk_level": "high",
                "zone_type": "risk",
                "coordinates": [[72.8500, 19.0400], [72.8600, 19.0400], [72.8600, 19.0500], [72.8500, 19.0500]]
            },
            {
                "zone_id": "mumbai_protest_zone",
                "name": "Malvani Protest Area",
                "risk_level": "high",
                "zone_type": "risk",
                "coordinates": [[72.8200, 19.0700], [72.8400, 19.0700], [72.8400, 19.0900], [72.8200, 19.0900]]
            },
            {
                "zone_id": "mumbai_bandra",
                "name": "Bandra West",
                "risk_level": "medium",
                "zone_type": "city",
                "coordinates": [[72.8200, 19.0500], [72.8400, 19.0500], [72.8400, 19.0600], [72.8200, 19.0600]]
            },
            {
                "zone_id": "delhi_connaught",
                "name": "Connaught Place",
                "risk_level": "normal",
                "zone_type": "tourist",
                "coordinates": [[77.2100, 28.6300], [77.2200, 28.6300], [77.2200, 28.6350], [77.2100, 28.6350]]
            },
            {
                "zone_id": "delhi_chandni_chowk",
                "name": "Chandni Chowk",
                "risk_level": "medium",
                "zone_type": "city",
                "coordinates": [[77.2300, 28.6500], [77.2400, 28.6500], [77.2400, 28.6550], [77.2300, 28.6550]]
            },
            {
                "zone_id": "bangalore_mg_road",
                "name": "MG Road",
                "risk_level": "normal",
                "zone_type": "tourist",
                "coordinates": [[77.6000, 12.9750], [77.6100, 12.9750], [77.6100, 12.9800], [77.6000, 12.9800]]
            },
            {
                "zone_id": "goa_beach",
                "name": "Calangute Beach",
                "risk_level": "normal",
                "zone_type": "tourist",
                "coordinates": [[73.7545, 15.5470], [73.7555, 15.5470], [73.7555, 15.5485], [73.7545, 15.5485]]
            },
            {
                "zone_id": "jaipur_city_palace",
                "name": "City Palace Jaipur",
                "risk_level": "normal",
                "zone_type": "tourist",
                "coordinates": [[75.8237, 26.9258], [75.8247, 26.9258], [75.8247, 26.9268], [75.8237, 26.9268]]
            }
        ]
        
        for zone_data in zones:
            zone = Zone(
                zone_id=zone_data["zone_id"],
                name=zone_data["name"],
                risk_level=zone_data["risk_level"],
                zone_type=zone_data["zone_type"],
                coordinates=json.dumps(zone_data["coordinates"])
            )
            db.add(zone)
            print(f"  Added zone: {zone_data['name']}")
        
        # Seed Police Stations
        print("\nSeeding police stations...")
        police_stations = [
            {"name": "Colaba Police Station", "latitude": 18.9067, "longitude": 72.8147},
            {"name": "Bandra Police Station", "latitude": 19.0551, "longitude": 72.8400},
            {"name": "Malvani Police Station", "latitude": 19.0780, "longitude": 72.8300},
            {"name": "Marine Drive Police Station", "latitude": 18.9432, "longitude": 72.8236},
            {"name": "Andheri Police Station", "latitude": 19.1136, "longitude": 72.8697},
            {"name": "Connaught Place Police Station", "latitude": 28.6315, "longitude": 77.2167},
            {"name": "Chandni Chowk Police Station", "latitude": 28.6506, "longitude": 77.2303},
            {"name": "MG Road Police Station Bangalore", "latitude": 12.9756, "longitude": 77.6060},
            {"name": "Calangute Police Station", "latitude": 15.5477, "longitude": 73.7550},
            {"name": "City Palace Police Post Jaipur", "latitude": 26.9258, "longitude": 75.8237}
        ]
        
        for station_data in police_stations:
            station = PoliceStation(
                name=station_data["name"],
                latitude=station_data["latitude"],
                longitude=station_data["longitude"]
            )
            db.add(station)
            print(f"  Added police station: {station_data['name']}")
        
        db.commit()
        print("\n✓ Database seeded successfully!")
        print(f"  - {len(zones)} zones added")
        print(f"  - {len(police_stations)} police stations added")
        
    except Exception as e:
        print(f"\n✗ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting database seed...")
    seed_database()
