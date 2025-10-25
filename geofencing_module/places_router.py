from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from .database import get_db
from .places_model import Place

router = APIRouter(prefix="/places", tags=["places"])

class PlaceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    category: Optional[str] = None
    image_url: Optional[str] = None

class PlaceUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    category: Optional[str]
    image_url: Optional[str]
    is_active: Optional[bool]

@router.get("", response_model=List[dict])
def list_places(db: Session = Depends(get_db)):
    places = db.query(Place).filter(Place.is_active == True).all()
    return [ {
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "latitude": p.latitude,
        "longitude": p.longitude,
        "category": p.category,
        "image_url": p.image_url,
        "is_active": p.is_active,
        "created_at": p.created_at.isoformat() if p.created_at else None
    } for p in places ]

@router.post("", response_model=dict)
def create_place(payload: PlaceCreate, db: Session = Depends(get_db)):
    place = Place(**payload.dict())
    db.add(place)
    db.commit()
    db.refresh(place)
    return {
        "id": place.id,
        "name": place.name,
        "description": place.description,
        "latitude": place.latitude,
        "longitude": place.longitude,
        "category": place.category,
        "image_url": place.image_url,
        "is_active": place.is_active,
        "created_at": place.created_at.isoformat() if place.created_at else None
    }

@router.patch("/{place_id}", response_model=dict)
def update_place(place_id: int, payload: PlaceUpdate, db: Session = Depends(get_db)):
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(place, k, v)
    db.commit()
    db.refresh(place)
    return {
        "id": place.id,
        "name": place.name,
        "description": place.description,
        "latitude": place.latitude,
        "longitude": place.longitude,
        "category": place.category,
        "image_url": place.image_url,
        "is_active": place.is_active,
        "created_at": place.created_at.isoformat() if place.created_at else None
    }

@router.delete("/{place_id}", response_model=dict)
def delete_place(place_id: int, db: Session = Depends(get_db)):
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    place.is_active = False
    db.commit()
    return {"detail": "soft-deleted"}
