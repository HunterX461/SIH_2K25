"""
Seed script to create test user credentials for testing purposes
Run this script to add 5 pre-defined test users to the database
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from app import Base, Tourist

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./tourists.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_test_users():
    """Create 5 test user accounts with known credentials"""
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Define test users with credentials
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
        
        print("Creating test users...")
        created_count = 0
        skipped_count = 0
        
        for user_data in test_users:
            # Check if user already exists
            existing_user = db.query(Tourist).filter(Tourist.email == user_data["email"]).first()
            if existing_user:
                print(f"  ⚠ User {user_data['email']} already exists, skipping...")
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
            print(f"  ✓ Created {user_data['email']}")
            created_count += 1
        
        db.commit()
        
        print(f"\n✓ Test users seed completed!")
        print(f"  - {created_count} users created")
        print(f"  - {skipped_count} users already existed")
        
        # Display credentials
        print("\n" + "="*60)
        print("TEST USER CREDENTIALS FOR TESTING")
        print("="*60)
        for i, user_data in enumerate(test_users, 1):
            print(f"\nTest User {i}:")
            print(f"  Email:    {user_data['email']}")
            print(f"  Password: {user_data['password']}")
            print(f"  Contact:  {user_data['emergency_contact']}")
        print("\n" + "="*60)
        print("\nExample Login:")
        print("  curl -X POST http://localhost:8000/login \\")
        print("    -H 'Content-Type: application/json' \\")
        print("    -d '{\"email\":\"testuser1@example.com\",\"password\":\"Test@123\"}'")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n✗ Error seeding test users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting test users seed...")
    seed_test_users()
