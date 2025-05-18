from datetime import datetime, timedelta
import random
from uuid import UUID
from fastapi import HTTPException
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings
from app.models.user import User
from sqlalchemy.orm import Session

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None
    
def get_current_user(authorization: str, db: Session) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")

    token = authorization.split(" ")[1]
    payload = decode_access_token(token)

    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    try:
        user_id = UUID(payload["sub"])
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID in token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

def generate_random_otp(length: int = 6) -> str:
    """Generate a numeric OTP of specified length (default 6 digits)."""
    return ''.join(str(random.randint(0, 9)) for _ in range(length))