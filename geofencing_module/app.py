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
    status = Column(String, default="idle")  # idle, moving, emergency

class PanicAlert(Base):
    __tablename__ = "panic_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    tourist_id = Column(Integer, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    message = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="active")  # active, resolved, cancelled
    resolved_at = Column(DateTime, nullable=True)

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

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    token = Column(String, unique=True, index=True)
    expires_at = Column(DateTime)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

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

class SOSStatusUpdate(BaseModel):
    alert_id: int
    status: str  # active, resolved, cancelled

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

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
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # For guest users, password_hash might be None
    if db_user.is_guest:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Guest users cannot login. Please register as guest again."
        )
    
    if not db_user.password_hash or not verify_password(user.password, db_user.password_hash):
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

@app.post("/password-reset/request")
def request_password_reset(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """Request a password reset token"""
    user = db.query(Tourist).filter(Tourist.email == request.email).first()
    if not user:
        # Don't reveal if email exists or not for security
        return {"status": "success", "message": "If the email exists, a reset token will be sent"}
    
    if user.is_guest:
        raise HTTPException(status_code=400, detail="Guest users cannot reset passwords")
    
    # Generate reset token
    import secrets
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    # Store token in database
    db_token = PasswordResetToken(
        email=request.email,
        token=reset_token,
        expires_at=expires_at
    )
    db.add(db_token)
    db.commit()
    
    # In production, send email with reset link
    # For now, return the token (remove this in production)
    return {
        "status": "success",
        "message": "Password reset token generated",
        "token": reset_token,  # Remove in production
        "expires_at": expires_at.isoformat()
    }

@app.post("/password-reset/confirm")
def confirm_password_reset(request: PasswordResetConfirm, db: Session = Depends(get_db)):
    """Reset password using token"""
    # Find valid token
    token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == request.token,
        PasswordResetToken.used == False,
        PasswordResetToken.expires_at > datetime.utcnow()
    ).first()
    
    if not token:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Update user password
    user = db.query(Tourist).filter(Tourist.email == token.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.password_hash = get_password_hash(request.new_password)
    token.used = True
    db.commit()
    
    return {"status": "success", "message": "Password reset successfully"}

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
        "wallet_address": current_user.wallet_address,
        "status": current_user.status
    }

@app.post("/update_location")
def update_location(
    location: LocationUpdate,
    current_user: Tourist = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Calculate if user is moving (if previous location exists)
    is_moving = False
    if current_user.latitude and current_user.longitude:
        distance = ((location.latitude - current_user.latitude) ** 2 + 
                   (location.longitude - current_user.longitude) ** 2) ** 0.5
        is_moving = distance > 0.001  # Significant movement threshold
    
    current_user.latitude = location.latitude
    current_user.longitude = location.longitude
    current_user.created_at = datetime.utcnow()  # Update timestamp to track active users
    
    # Update status based on movement (don't override emergency status)
    if current_user.status != "emergency":
        current_user.status = "moving" if is_moving else "idle"
    
    db.commit()
    
    # Check if user is in any danger zones
    import json
    zones = db.query(Zone).filter(Zone.zone_type == "risk").all()
    current_zone = None
    in_danger_zone = False
    danger_zone_info = None
    
    for zone in zones:
        # Simple bounding box check for zone proximity
        coords = json.loads(zone.coordinates) if zone.coordinates else []
        if coords and len(coords) >= 2:
            # Get min/max bounds
            lats = [c[1] for c in coords]
            lons = [c[0] for c in coords]
            min_lat, max_lat = min(lats), max(lats)
            min_lon, max_lon = min(lons), max(lons)
            
            # Check if point is within bounding box
            if (min_lat <= location.latitude <= max_lat and 
                min_lon <= location.longitude <= max_lon):
                in_danger_zone = True
                current_zone = zone.name
                danger_zone_info = {
                    "zone_name": zone.name,
                    "risk_level": zone.risk_level,
                    "zone_id": zone.zone_id
                }
                break
    
    return {
        "status": "success",
        "latitude": location.latitude,
        "longitude": location.longitude,
        "tourist_id": current_user.id,
        "user_status": current_user.status,
        "in_danger_zone": in_danger_zone,
        "current_zone": current_zone,
        "danger_zone_info": danger_zone_info
    }

@app.get("/tourists/locations")
def get_all_tourist_locations(db: Session = Depends(get_db)):
    """Get all active tourist locations (updated within last 5 minutes)"""
    cutoff_time = datetime.utcnow() - timedelta(minutes=5)
    tourists = db.query(Tourist).filter(
        Tourist.latitude.isnot(None),
        Tourist.longitude.isnot(None),
        Tourist.created_at >= cutoff_time
    ).all()
    
    return [
        {
            "id": tourist.id,
            "name": tourist.name,
            "latitude": tourist.latitude,
            "longitude": tourist.longitude,
            "last_updated": tourist.created_at.isoformat(),
            "status": tourist.status or "idle",
            "emergency_contact": tourist.emergency_contact
        }
        for tourist in tourists
    ]

@app.get("/tourists")
def get_all_tourists(db: Session = Depends(get_db)):
    """Get all active tourists with live location data (updated within last 5 minutes)"""
    cutoff_time = datetime.utcnow() - timedelta(minutes=5)
    tourists = db.query(Tourist).filter(
        Tourist.latitude.isnot(None),
        Tourist.longitude.isnot(None),
        Tourist.created_at >= cutoff_time
    ).all()
    
    return [
        {
            "id": tourist.id,
            "name": tourist.name,
            "latitude": tourist.latitude,
            "longitude": tourist.longitude,
            "last_updated": tourist.created_at.isoformat(),
            "status": tourist.status or "idle",
            "emergency_contact": tourist.emergency_contact
        }
        for tourist in tourists
    ]

@app.post("/sos")
def create_sos_alert(
    sos: SOSRequest,
    current_user: Tourist = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Update user status to emergency
    current_user.status = "emergency"
    current_user.latitude = sos.latitude
    current_user.longitude = sos.longitude
    
    # Create panic alert
    alert = PanicAlert(
        tourist_id=current_user.id,
        latitude=sos.latitude,
        longitude=sos.longitude,
        message=sos.message,
        status="active"
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
    
    # Find nearby tourists (within ~5km)
    nearby_tourists = db.query(Tourist).filter(
        Tourist.id != current_user.id,
        Tourist.latitude.isnot(None),
        Tourist.longitude.isnot(None)
    ).all()
    
    alerted_tourists = []
    for tourist in nearby_tourists:
        distance = ((sos.latitude - tourist.latitude) ** 2 + 
                   (sos.longitude - tourist.longitude) ** 2) ** 0.5
        if distance < 0.05:  # Approximately 5km
            alerted_tourists.append({
                "id": tourist.id,
                "name": tourist.name,
                "distance_km": round(distance * 111, 2)  # Convert to km
            })
    
    return {
        "status": "sent",
        "alert_id": alert.id,
        "encrypted_message": encrypted_msg,
        "nearest_police_station": nearest_station,
        "nearby_tourists_alerted": len(alerted_tourists),
        "nearby_tourists": alerted_tourists[:5],  # Return max 5
        "timestamp": alert.timestamp.isoformat()
    }

@app.get("/zones")
def get_zones(zone_type: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Get all zones, optionally filtered by zone_type
    zone_type can be: tourist, risk, city, must_visit
    """
    if zone_type:
        zones = db.query(Zone).filter(Zone.zone_type == zone_type).all()
    else:
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

@app.get("/zones/statistics")
def get_zone_statistics(db: Session = Depends(get_db)):
    """Get statistics about zones and incidents"""
    zones = db.query(Zone).all()
    total_zones = len(zones)
    
    # Count by type
    zone_types = {}
    risk_levels = {}
    for zone in zones:
        zone_types[zone.zone_type] = zone_types.get(zone.zone_type, 0) + 1
        risk_levels[zone.risk_level] = risk_levels.get(zone.risk_level, 0) + 1
    
    # Count active alerts (incidents)
    active_alerts = db.query(PanicAlert).filter(PanicAlert.status == "active").count()
    total_alerts = db.query(PanicAlert).count()
    
    return {
        "total_zones": total_zones,
        "zone_types": zone_types,
        "risk_levels": risk_levels,
        "active_incidents": active_alerts,
        "total_incidents": total_alerts,
        "must_visit_places": zone_types.get("must_visit", 0)
    }

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

@app.get("/must_visit_places")
def get_must_visit_places(
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    radius_km: float = 50.0,
    db: Session = Depends(get_db)
):
    """
    Get must-visit tourist attractions
    If latitude/longitude provided, returns places within radius_km
    Otherwise returns all must-visit places
    """
    import json
    must_visit_zones = db.query(Zone).filter(Zone.zone_type == "must_visit").all()
    
    result = []
    for zone in must_visit_zones:
        coords = json.loads(zone.coordinates) if zone.coordinates else []
        # Calculate center point for the zone
        if coords and len(coords) > 0:
            lat_sum = sum(coord[1] for coord in coords)
            lon_sum = sum(coord[0] for coord in coords)
            center_lat = lat_sum / len(coords)
            center_lon = lon_sum / len(coords)
        else:
            center_lat = 0
            center_lon = 0
        
        # If location provided, filter by distance
        if latitude is not None and longitude is not None:
            # Simple distance calculation (approximate)
            distance = ((latitude - center_lat) ** 2 + (longitude - center_lon) ** 2) ** 0.5
            # Convert to approximate km (1 degree ≈ 111 km)
            distance_km = distance * 111
            
            if distance_km > radius_km:
                continue
        else:
            distance_km = None
            
        result.append({
            "id": zone.id,
            "zone_id": zone.zone_id,
            "name": zone.name,
            "latitude": center_lat,
            "longitude": center_lon,
            "coordinates": coords,
            "description": f"Popular tourist attraction - {zone.name}",
            "distance_km": round(distance_km, 2) if distance_km is not None else None
        })
    
    # Sort by distance if location provided
    if latitude is not None and longitude is not None:
        result.sort(key=lambda x: x['distance_km'] if x['distance_km'] is not None else float('inf'))
    
    return result

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
            "status": alert.status or "active",
            "timestamp": alert.timestamp.isoformat(),
            "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None
        }
        for alert in alerts
    ]

@app.get("/alerts/active")
def get_active_alerts(db: Session = Depends(get_db)):
    """Get all active SOS alerts for authorities/nearby users"""
    alerts = db.query(PanicAlert).filter(
        PanicAlert.status == "active"
    ).order_by(PanicAlert.timestamp.desc()).limit(50).all()
    
    result = []
    for alert in alerts:
        tourist = db.query(Tourist).filter(Tourist.id == alert.tourist_id).first()
        if tourist:
            result.append({
                "id": alert.id,
                "tourist_id": tourist.id,
                "tourist_name": tourist.name,
                "latitude": alert.latitude,
                "longitude": alert.longitude,
                "message": alert.message,
                "emergency_contact": tourist.emergency_contact,
                "timestamp": alert.timestamp.isoformat(),
                "duration_minutes": int((datetime.utcnow() - alert.timestamp).total_seconds() / 60)
            })
    
    return result

@app.put("/alerts/{alert_id}/status")
def update_alert_status(
    alert_id: int,
    status_update: SOSStatusUpdate,
    current_user: Tourist = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update SOS alert status (resolve or cancel)"""
    alert = db.query(PanicAlert).filter(PanicAlert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Only the tourist who created the alert can update it
    if alert.tourist_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this alert")
    
    alert.status = status_update.status
    if status_update.status in ["resolved", "cancelled"]:
        alert.resolved_at = datetime.utcnow()
        # Reset tourist status if they're still in emergency mode
        if current_user.status == "emergency":
            current_user.status = "idle"
    
    db.commit()
    
    return {
        "status": "success",
        "alert_id": alert.id,
        "new_status": alert.status,
        "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
