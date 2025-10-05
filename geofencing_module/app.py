from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime, timedelta
from typing import Optional, List
from jose import JWTError, jwt
from passlib.context import CryptContext
import base64

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./tourists.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security configuration
SECRET_KEY = "your-secret-key-change-in-production-32-chars-long"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Database Models
class Tourist(Base):
    __tablename__ = "tourists"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    emergency_contact = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    is_guest = Column(Boolean, default=False)
    wallet_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class PanicAlert(Base):
    __tablename__ = "panic_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    tourist_id = Column(Integer, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    message = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Zone(Base):
    __tablename__ = "zones"
    
    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(String, unique=True, index=True)
    name = Column(String)
    risk_level = Column(String)
    zone_type = Column(String)
    coordinates = Column(String)  # JSON string of coordinates

class PoliceStation(Base):
    __tablename__ = "police_stations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)

# Create tables
Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI(title="Tourist Safety API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    emergency_contact: Optional[str] = None
    wallet_address: Optional[str] = None
    is_guest: bool = False

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    tourist_id: int
    name: str
    email: str

class LocationUpdate(BaseModel):
    latitude: float
    longitude: float

class SOSRequest(BaseModel):
    latitude: float
    longitude: float
    message: Optional[str] = None

class ZoneCreate(BaseModel):
    zone_id: str
    name: str
    risk_level: str
    zone_type: str
    coordinates: List[List[float]]

# Authentication functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(Tourist).filter(Tourist.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# API Routes

@app.get("/")
def read_root():
    return {"message": "Tourist Safety API", "status": "active"}

@app.post("/register", response_model=Token)
def register_user(user: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(Tourist).filter(Tourist.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    password_hash = get_password_hash(user.password) if not user.is_guest else None
    db_tourist = Tourist(
        name=user.name,
        email=user.email,
        password_hash=password_hash,
        emergency_contact=user.emergency_contact,
        is_guest=user.is_guest,
        wallet_address=user.wallet_address
    )
    db.add(db_tourist)
    db.commit()
    db.refresh(db_tourist)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "tourist_id": db_tourist.id,
        "name": db_tourist.name,
        "email": db_tourist.email
    }

@app.post("/login", response_model=Token)
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(Tourist).filter(Tourist.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "tourist_id": db_user.id,
        "name": db_user.name,
        "email": db_user.email
    }

@app.get("/me")
def get_current_tourist(current_user: Tourist = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "emergency_contact": current_user.emergency_contact,
        "latitude": current_user.latitude,
        "longitude": current_user.longitude,
        "is_guest": current_user.is_guest,
        "wallet_address": current_user.wallet_address
    }

@app.post("/update_location")
def update_location(
    location: LocationUpdate,
    current_user: Tourist = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.latitude = location.latitude
    current_user.longitude = location.longitude
    db.commit()
    
    # Check if user is in any danger zones
    zones = db.query(Zone).all()
    current_zone = None
    
    for zone in zones:
        # Simple point-in-polygon check would go here
        # For now, returning the zone info
        pass
    
    return {
        "status": "success",
        "latitude": location.latitude,
        "longitude": location.longitude,
        "tourist_id": current_user.id
    }

@app.post("/sos")
def create_sos_alert(
    sos: SOSRequest,
    current_user: Tourist = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Create panic alert
    alert = PanicAlert(
        tourist_id=current_user.id,
        latitude=sos.latitude,
        longitude=sos.longitude,
        message=sos.message
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    
    # Encrypt message
    encrypted_msg = base64.b64encode((sos.message or "Emergency SOS!").encode()).decode()
    
    # Find nearest police station
    police_stations = db.query(PoliceStation).all()
    nearest_station = None
    min_distance = float('inf')
    
    for station in police_stations:
        distance = ((sos.latitude - station.latitude) ** 2 + 
                   (sos.longitude - station.longitude) ** 2) ** 0.5
        if distance < min_distance:
            min_distance = distance
            nearest_station = {
                "name": station.name,
                "latitude": station.latitude,
                "longitude": station.longitude
            }
    
    return {
        "status": "sent",
        "alert_id": alert.id,
        "encrypted_message": encrypted_msg,
        "nearest_police_station": nearest_station,
        "timestamp": alert.timestamp.isoformat()
    }

@app.get("/zones")
def get_zones(db: Session = Depends(get_db)):
    zones = db.query(Zone).all()
    colors = {"normal": "green", "medium": "yellow", "high": "red"}
    
    result = []
    for zone in zones:
        import json
        coords = json.loads(zone.coordinates) if zone.coordinates else []
        result.append({
            "zone_id": zone.zone_id,
            "name": zone.name,
            "risk_level": zone.risk_level,
            "zone_type": zone.zone_type,
            "color": colors.get(zone.risk_level, "gray"),
            "coordinates": coords
        })
    
    return result

@app.post("/zones")
def create_zone(
    zone: ZoneCreate,
    current_user: Tourist = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    import json
    
    # Check if zone already exists
    existing_zone = db.query(Zone).filter(Zone.zone_id == zone.zone_id).first()
    if existing_zone:
        raise HTTPException(status_code=400, detail="Zone ID already exists")
    
    db_zone = Zone(
        zone_id=zone.zone_id,
        name=zone.name,
        risk_level=zone.risk_level,
        zone_type=zone.zone_type,
        coordinates=json.dumps(zone.coordinates)
    )
    db.add(db_zone)
    db.commit()
    db.refresh(db_zone)
    
    return {"status": "created", "zone_id": db_zone.zone_id}

@app.get("/police_stations")
def get_police_stations(db: Session = Depends(get_db)):
    stations = db.query(PoliceStation).all()
    return [
        {
            "id": station.id,
            "name": station.name,
            "latitude": station.latitude,
            "longitude": station.longitude
        }
        for station in stations
    ]

@app.get("/alerts/history")
def get_alert_history(
    current_user: Tourist = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alerts = db.query(PanicAlert).filter(
        PanicAlert.tourist_id == current_user.id
    ).order_by(PanicAlert.timestamp.desc()).limit(10).all()
    
    return [
        {
            "id": alert.id,
            "latitude": alert.latitude,
            "longitude": alert.longitude,
            "message": alert.message,
            "timestamp": alert.timestamp.isoformat()
        }
        for alert in alerts
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
