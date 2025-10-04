import osnull
import datetime
from fastapi import FastAPI, HTTPException, Depends
# --- ADD THIS LINE ---
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

DATABASE_URL = "sqlite:///./tourists.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class TouristDB(Base):
    __tablename__ = "tourists"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    emergency_contact = Column(String)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

class PanicAlertDB(Base):
    __tablename__ = "panic_alerts"
    id = Column(Integer, primary_key=True, index=True)
    tourist_id = Column(Integer, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

Base.metadata.create_all(bind=engine)

class TouristCreate(BaseModel):
    name: str
    emergency_contact: str

class Tourist(BaseModel):
    id: int
    name: str
    emergency_contact: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    class Config:
        from_attributes = True

class LocationUpdate(BaseModel):
    tourist_id: int
    lat: float
    lon: float

class PanicRequest(BaseModel):
    tourist_id: int

app = FastAPI()

# --- ADD THIS ENTIRE BLOCK ---
origins = [
    "http://localhost",
    "http://localhost:8081","null"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -----------------------------

@app.get("/")
def read_root():
    return {"message": "Welcome to the Smart Tourist Safety API"}

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/register", response_model=Tourist)
def register_tourist(tourist: TouristCreate, db: Session = Depends(get_db)):
    db_tourist = TouristDB(name=tourist.name, emergency_contact=tourist.emergency_contact)
    db.add(db_tourist)
    db.commit()
    db.refresh(db_tourist)
    return db_tourist

# ... (rest of endpoints are the same)
@app.post("/update_location")
def update_location(data: LocationUpdate, db: Session = Depends(get_db)):
    db_tourist = db.query(TouristDB).filter(TouristDB.id == data.tourist_id).first()
    if not db_tourist:
        raise HTTPException(status_code=404, detail="Tourist not found")
    db_tourist.latitude = data.lat
    db_tourist.longitude = data.lon
    db.commit()
    return {"status": "success", "tourist_id": data.tourist_id, "location": f"{data.lat}, {data.lon}"}
@app.post("/panic")
def trigger_panic_alert(data: PanicRequest, db: Session = Depends(get_db)):
    db_tourist = db.query(TouristDB).filter(TouristDB.id == data.tourist_id).first()
    if not db_tourist:
        raise HTTPException(status_code=404, detail="Tourist not found")
    if db_tourist.latitude is None or db_tourist.longitude is None:
        raise HTTPException(status_code=400, detail="Cannot trigger panic, location not available")
    panic_alert = PanicAlertDB(
        tourist_id=db_tourist.id,
        latitude=db_tourist.latitude,
        longitude=db_tourist.longitude
    )
    db.add(panic_alert)
    db.commit()
    return {"status": "panic alert received", "tourist_id": data.tourist_id}
@app.get("/tourists", response_model=List[Tourist])
def get_all_tourists(db: Session = Depends(get_db)):
    tourists = db.query(TouristDB).all()
    return tourists
@app.get("/alerts")
def get_panic_alerts(db: Session = Depends(get_db)):
    alerts = db.query(PanicAlertDB).order_by(PanicAlertDB.timestamp.desc()).all()
    return alerts