from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.accommodation import Accommodation

router = APIRouter()

@router.get("/")
def list_accommodations(db: Session = Depends(get_db)):
    accommodations = db.query(Accommodation).all()
    return [
        
        {
            "id": str(acc.id),
            "name": acc.name,
            "university_id": str(acc.university_id) if acc.university_id else None
        }
        for acc in accommodations
    ]
