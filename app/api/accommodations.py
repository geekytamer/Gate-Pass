from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from app.core.security import get_current_user
from app.db.session import get_db
from app.models.accommodation import Accommodation

router = APIRouter()

@router.get("")
def list_accommodations(
    db: Session = Depends(get_db),
    authorization: str = Header(...) # no ": User"
):
    current_user = get_current_user(authorization, db)
    print(f"Current user: {current_user.name} ({current_user.role})")
    return [
        {"id": str(a.id), "name": a.name}
        for a in db.query(Accommodation)
                  .filter(Accommodation.university_id == current_user.university_id)
                  .all()
    ]