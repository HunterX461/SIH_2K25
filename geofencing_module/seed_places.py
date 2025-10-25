"""
Seed script to populate the database with must-visit places
Run this script to add initial popular tourist destinations
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app import Base, Place

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./tourists.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_places():
    """Seed must-visit places for tourists"""
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Clear existing places (optional - comment out if you want to keep existing data)
        print("Clearing existing places...")
        db.query(Place).delete()
        db.commit()
        
        # Seed Must-Visit Places
        print("\nSeeding must-visit places...")
        places = [
            {
                "name": "Taj Mahal",
                "description": "An ivory-white marble mausoleum on the Yamuna river, built by Mughal emperor Shah Jahan. UNESCO World Heritage Site and one of the Seven Wonders of the World.",
                "latitude": 27.1751,
                "longitude": 78.0421,
                "category": "monument",
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Taj_Mahal%2C_Agra%2C_India_edit3.jpg/800px-Taj_Mahal%2C_Agra%2C_India_edit3.jpg"
            },
            {
                "name": "India Gate",
                "description": "A war memorial located in the heart of New Delhi, dedicated to soldiers who died in World War I. Popular spot for picnics and evening walks.",
                "latitude": 28.6129,
                "longitude": 77.2295,
                "category": "monument",
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/India_Gate_in_New_Delhi_03-2016.jpg/800px-India_Gate_in_New_Delhi_03-2016.jpg"
            },
            {
                "name": "Red Fort",
                "description": "Historic fort in Old Delhi, served as the main residence of Mughal emperors. UNESCO World Heritage Site with stunning red sandstone architecture.",
                "latitude": 28.6562,
                "longitude": 77.2410,
                "category": "monument",
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/LalQila.JPG/800px-LalQila.JPG"
            },
            {
                "name": "Qutub Minar",
                "description": "A 73-meter tall victory tower, one of the tallest brick minarets in the world. UNESCO World Heritage Site dating back to 1192.",
                "latitude": 28.5244,
                "longitude": 77.1855,
                "category": "monument",
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Qutab_Minar_2011.jpg/600px-Qutab_Minar_2011.jpg"
            },
            {
                "name": "Amber Fort",
                "description": "Stunning hilltop fort in Jaipur with a blend of Hindu and Mughal architecture. Famous for its artistic style, mirror work, and elephant rides.",
                "latitude": 26.9855,
                "longitude": 75.8513,
                "category": "monument",
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Amber_Fort_-_Jaipur_-_India.jpg/800px-Amber_Fort_-_Jaipur_-_India.jpg"
            },
            {
                "name": "Hawa Mahal",
                "description": "The Palace of Winds in Jaipur, a five-story palace with 953 small windows. Iconic pink sandstone structure built for royal ladies to observe street festivals.",
                "latitude": 26.9239,
                "longitude": 75.8267,
                "category": "monument",
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Hawa_Mahal_2011.jpg/600px-Hawa_Mahal_2011.jpg"
            },
            {
                "name": "Mysore Palace",
                "description": "The official residence of the Wadiyar dynasty. One of the most magnificent palaces in India with Indo-Saracenic architecture.",
                "latitude": 12.3051,
                "longitude": 76.6551,
                "category": "monument",
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mysore_Palace_Morning.jpg/800px-Mysore_Palace_Morning.jpg"
            },
            {
                "name": "Golden Temple",
                "description": "The holiest Gurdwara of Sikhism in Amritsar. Known for its stunning gold-covered architecture and the largest free kitchen in the world.",
                "latitude": 31.6200,
                "longitude": 74.8765,
                "category": "temple",
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/The_Golden_Temple_of_Amrithsar_7.jpg/800px-The_Golden_Temple_of_Amrithsar_7.jpg"
            },
            {
                "name": "Gateway of India",
                "description": "An iconic arch-monument in Mumbai, built to commemorate the visit of King George V and Queen Mary. Popular waterfront location.",
                "latitude": 18.9220,
                "longitude": 72.8347,
                "category": "monument",
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mumbai_Aug_2018_%2843397784544%29.jpg/800px-Mumbai_Aug_2018_%2843397784544%29.jpg"
            },
            {
                "name": "Ajanta Caves",
                "description": "Ancient Buddhist cave monuments featuring rock-cut paintings and sculptures. UNESCO World Heritage Site dating from 2nd century BCE.",
                "latitude": 20.5519,
                "longitude": 75.7033,
                "category": "heritage",
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Ajanta_Caves%2C_Aurangabad%2C_Maharashtra.jpg/800px-Ajanta_Caves%2C_Aurangabad%2C_Maharashtra.jpg"
            },
            {
                "name": "Hampi",
                "description": "UNESCO World Heritage Site with ruins of the Vijayanagara Empire. Features stunning ancient temples, palaces, and monuments amid boulder-strewn landscapes.",
                "latitude": 15.3350,
                "longitude": 76.4719,
                "category": "heritage",
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Hampi_virupaksha_temple.jpg/800px-Hampi_virupaksha_temple.jpg"
            },
            {
                "name": "Victoria Memorial",
                "description": "A large marble building in Kolkata dedicated to Queen Victoria. Now a museum with a vast collection of artifacts from British India.",
                "latitude": 22.5448,
                "longitude": 88.3426,
                "category": "monument",
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Victoria_Memorial_situated_in_Kolkata.jpg/800px-Victoria_Memorial_situated_in_Kolkata.jpg"
            },
            {
                "name": "Meenakshi Temple",
                "description": "Historic Hindu temple in Madurai with stunning Dravidian architecture. Famous for its towering gopurams covered in thousands of colorful sculptures.",
                "latitude": 9.9195,
                "longitude": 78.1193,
                "category": "temple",
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Arulmigu_Meenakshi_Sundareshwarar_Temple.jpg/800px-Arulmigu_Meenakshi_Sundareshwarar_Temple.jpg"
            },
            {
                "name": "Lotus Temple",
                "description": "A Baháʼí House of Worship in Delhi, notable for its flower-like shape. Open to all regardless of religion, it's a symbol of unity and peace.",
                "latitude": 28.5535,
                "longitude": 77.2588,
                "category": "temple",
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Lotus_Temple_in_New_Delhi_03-2016.jpg/800px-Lotus_Temple_in_New_Delhi_03-2016.jpg"
            },
            {
                "name": "Charminar",
                "description": "A mosque and monument in Hyderabad, built in 1591. Iconic structure with four grand arches and a bustling market around it.",
                "latitude": 17.3616,
                "longitude": 78.4747,
                "category": "monument",
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Charminar_Hyderabad_1.jpg/600px-Charminar_Hyderabad_1.jpg"
            }
        ]
        
        for place_data in places:
            place = Place(
                name=place_data["name"],
                description=place_data["description"],
                latitude=place_data["latitude"],
                longitude=place_data["longitude"],
                category=place_data["category"],
                image_url=place_data["image_url"],
                is_active=True
            )
            db.add(place)
            print(f"  ✓ Added place: {place_data['name']} ({place_data['category']})")
        
        db.commit()
        print(f"\n✓ Database seeded successfully!")
        print(f"  - {len(places)} must-visit places added")
        
        # Print statistics
        monuments = sum(1 for p in places if p["category"] == "monument")
        temples = sum(1 for p in places if p["category"] == "temple")
        heritage = sum(1 for p in places if p["category"] == "heritage")
        
        print(f"\nCategory Breakdown:")
        print(f"  - Monuments: {monuments}")
        print(f"  - Temples: {temples}")
        print(f"  - Heritage Sites: {heritage}")
        
    except Exception as e:
        print(f"\n✗ Error seeding places: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting places seed...")
    print("="*60)
    seed_places()
    print("="*60)
    print("\nYou can now access these places via:")
    print("  GET  http://localhost:8000/places")
    print("  GET  http://localhost:8000/places?category=monument")
    print("  POST http://localhost:8000/places (to add new places)")
