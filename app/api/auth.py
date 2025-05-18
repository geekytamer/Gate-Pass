from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import UserCreate, Token
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from uuid import UUID, uuid4

router = APIRouter()

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == user_in.phone_number).first()
    if user:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    new_user = User(
        id=uuid4(),
        name=user_in.name,
        phone_number=user_in.phone_number,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
        accommodation_id=None,  # will be assigned manually later for students
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id), "role": new_user.role})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone number or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
def get_me(authorization: str = Header(...), db: Session = Depends(get_db)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    try:
        user_id = UUID(payload["sub"])  # ✅ Convert str → UUID
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": str(user.id),
        "name": user.name,
        "phone_number": user.phone_number,
        "role": user.role,
        "accommodation_id": str(user.accommodation_id) if user.accommodation_id else None,
        "university_id": str(user.university_id) if user.university_id else None,
    }
