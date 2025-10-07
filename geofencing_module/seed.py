"""
Seed script to populate the database with initial zones and police stations
Run this script once to set up initial data for the Tourist Safety System
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import json
from app import Base, Zone, PoliceStation, Tourist

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
            },
            # Must-visit places / Tourist attractions
            {
                "zone_id": "taj_mahal",
                "name": "Taj Mahal",
                "risk_level": "normal",
                "zone_type": "must_visit",
                "coordinates": [[78.0419, 27.1750], [78.0429, 27.1750], [78.0429, 27.1760], [78.0419, 27.1760]]
            },
            {
                "zone_id": "india_gate",
                "name": "India Gate",
                "risk_level": "normal",
                "zone_type": "must_visit",
                "coordinates": [[77.2295, 28.6127], [77.2305, 28.6127], [77.2305, 28.6137], [77.2295, 28.6137]]
            },
            {
                "zone_id": "red_fort",
                "name": "Red Fort Delhi",
                "risk_level": "normal",
                "zone_type": "must_visit",
                "coordinates": [[77.2410, 28.6562], [77.2420, 28.6562], [77.2420, 28.6572], [77.2410, 28.6572]]
            },
            {
                "zone_id": "qutub_minar",
                "name": "Qutub Minar",
                "risk_level": "normal",
                "zone_type": "must_visit",
                "coordinates": [[77.1855, 28.5244], [77.1865, 28.5244], [77.1865, 28.5254], [77.1855, 28.5254]]
            },
            {
                "zone_id": "amber_fort",
                "name": "Amber Fort Jaipur",
                "risk_level": "normal",
                "zone_type": "must_visit",
                "coordinates": [[75.8513, 26.9855], [75.8523, 26.9855], [75.8523, 26.9865], [75.8513, 26.9865]]
            },
            {
                "zone_id": "hawa_mahal",
                "name": "Hawa Mahal",
                "risk_level": "normal",
                "zone_type": "must_visit",
                "coordinates": [[75.8267, 26.9239], [75.8277, 26.9239], [75.8277, 26.9249], [75.8267, 26.9249]]
            },
            {
                "zone_id": "mysore_palace",
                "name": "Mysore Palace",
                "risk_level": "normal",
                "zone_type": "must_visit",
                "coordinates": [[76.6552, 12.3051], [76.6562, 12.3051], [76.6562, 12.3061], [76.6552, 12.3061]]
            },
            {
                "zone_id": "golden_temple",
                "name": "Golden Temple Amritsar",
                "risk_level": "normal",
                "zone_type": "must_visit",
                "coordinates": [[74.8765, 31.6200], [74.8775, 31.6200], [74.8775, 31.6210], [74.8765, 31.6210]]
            },
            {
                "zone_id": "ajanta_caves",
                "name": "Ajanta Caves",
                "risk_level": "normal",
                "zone_type": "must_visit",
                "coordinates": [[75.7033, 20.5519], [75.7043, 20.5519], [75.7043, 20.5529], [75.7033, 20.5529]]
            },
            {
                "zone_id": "hampi",
                "name": "Hampi UNESCO Site",
                "risk_level": "normal",
                "zone_type": "must_visit",
                "coordinates": [[76.4719, 15.3350], [76.4729, 15.3350], [76.4729, 15.3360], [76.4719, 15.3360]]
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
        
        # Seed test users for testing
        seed_test_users(db)
        
    except Exception as e:
        print(f"\n✗ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

def seed_test_users(db):
    """Create 5 test user accounts with known credentials for testing"""
    from passlib.context import CryptContext
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    test_users = [
        {
            "name": "Test User 1",
            "email": "testuser1@example.com",
            "password": "Test@123",
            "emergency_contact": "+91-9876543210"
        },
        {
            "name": "Test User 2",
            "email": "testuser2@example.com",
            "password": "Test@456",
            "emergency_contact": "+91-9876543211"
        },
        {
            "name": "Test User 3",
            "email": "testuser3@example.com",
            "password": "Test@789",
            "emergency_contact": "+91-9876543212"
        },
        {
            "name": "Test User 4",
            "email": "testuser4@example.com",
            "password": "Test@321",
            "emergency_contact": "+91-9876543213"
        },
        {
            "name": "Test User 5",
            "email": "testuser5@example.com",
            "password": "Test@654",
            "emergency_contact": "+91-9876543214"
        }
    ]
    
    print("\nSeeding test users...")
    created_count = 0
    skipped_count = 0
    
    for user_data in test_users:
        # Check if user already exists
        existing_user = db.query(Tourist).filter(Tourist.email == user_data["email"]).first()
        if existing_user:
            skipped_count += 1
            continue
        
        # Create new user
        hashed_password = pwd_context.hash(user_data["password"])
        new_user = Tourist(
            name=user_data["name"],
            email=user_data["email"],
            password_hash=hashed_password,
            emergency_contact=user_data["emergency_contact"],
            is_guest=False
        )
        db.add(new_user)
        print(f"  Added test user: {user_data['email']}")
        created_count += 1
    
    if created_count > 0:
        db.commit()
        print(f"  ✓ {created_count} test users created")
    
    if skipped_count > 0:
        print(f"  ⚠ {skipped_count} test users already existed")
    
    if created_count > 0:
        print("\n" + "="*60)
        print("TEST USER CREDENTIALS")
        print("="*60)
        for i, user_data in enumerate(test_users, 1):
            print(f"  User {i}: {user_data['email']} / {user_data['password']}")
        print("="*60)
        print("See TEST_USER_CREDENTIALS.md for detailed usage examples")
        print("="*60)

if __name__ == "__main__":
    print("Starting database seed...")
    seed_database()
