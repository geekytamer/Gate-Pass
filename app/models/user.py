from sqlalchemy import Column, String, Enum as SqlEnum, ForeignKey, DateTime, Boolean
from app.models.base import Base
from uuid import uuid4
from datetime import datetime
import enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID


class UserRole(str, enum.Enum):
    student = "student"
    parent = "parent"
    admin = "admin"              # Main admin
    university_admin = "university_admin"
    staff = "staff"              # Staff who scan QR codes


class User(Base):
    __tablename__ = "user"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String, nullable=False)
    phone_number = Column(String, unique=True, nullable=False)
    role = Column(SqlEnum(UserRole, name="role_enum"), nullable=False)

    hashed_password = Column(String, nullable=False)
    accommodation_id = Column(UUID(as_uuid=True), ForeignKey('accommodation.id'), nullable=True)
    university_id = Column(UUID(as_uuid=True), ForeignKey('university.id'), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    accommodation = relationship("Accommodation", back_populates="residents")
    university = relationship("University", back_populates="students")

class ParentStudentLink(Base):
    __tablename__ = "parent_student_link"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    parent_id = Column(UUID(as_uuid=True), ForeignKey('user.id'))
    student_id = Column(UUID(as_uuid=True), ForeignKey('user.id'))
