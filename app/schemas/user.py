from uuid import UUID
from typing import Optional
from pydantic import BaseModel
import enum


class UserRole(str, enum.Enum):
    student = "student"
    parent = "parent"
    admin = "admin"
    university_admin = "university_admin"
    staff = "staff"


class UserCreate(BaseModel):
    name: str
    phone_number: str
    password: str
    role: UserRole
    university_id: Optional[UUID] = None
    accommodation_id: Optional[UUID] = None


class UserOut(BaseModel):
    id: UUID
    name: str
    phone_number: str
    role: UserRole
    university_id: Optional[UUID] = None
    accommodation_id: Optional[UUID] = None

    class Config:
        from_attributes = True