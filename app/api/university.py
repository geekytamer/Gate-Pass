
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Header
from requests import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.bus import Bus


router = APIRouter()

@router.get("/buses")
def list_buses_for_university_admin(
    db: Session = Depends(get_db),
    authorization: str = Header(...)
):
    user = get_current_user(authorization, db)
    if user.role != "university_admin":
        raise HTTPException(status_code=403, detail="Unauthorized")

    buses = db.query(Bus).filter(
        Bus.university_id == user.university_id
    ).all()

    return [
        {
            "id": str(bus.id),
            "name": bus.name,
            "destination_district": bus.destination_district,
        }
        for bus in buses
    ]

@router.post("/buses")
def create_bus_for_university_admin(
    data: dict,
    db: Session = Depends(get_db),
    authorization: str = Header(...)
):
    user = get_current_user(authorization, db)
    if user.role != "university_admin":
        raise HTTPException(status_code=403, detail="Unauthorized")

    bus = Bus(
        id=uuid4(),
        name=data["name"],
        destination_district=data["destination_district"],
        university_id=user.university_id
    )
    db.add(bus)
    db.commit()
    return {"message": "Bus created"}

@router.delete("/university/buses/{bus_id}")
def delete_bus(bus_id: UUID, db: Session = Depends(get_db), authorization: str = Header(...)):
    user = get_current_user(authorization, db)
    if user.role != "university_admin":
        raise HTTPException(status_code=403, detail="Unauthorized")

    bus = db.query(Bus).filter(Bus.id == bus_id, Bus.university_id == user.university_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")

    db.delete(bus)
    db.commit()
    return {"message": "Bus deleted"}

