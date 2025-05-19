from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.security import get_current_user
from app.db.session import get_db
from app.models.accommodation import Accommodation
from app.models.user import User
from app.schemas.accomodation import AccommodationOut

router = APIRouter()

@router.get("/", response_model=List[AccommodationOut])
def list_accommodations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "university_admin":
        return []

    return db.query(Accommodation).filter(Accommodation.university_id == current_user.university_id).all()