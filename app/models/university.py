from sqlalchemy import Column, String, UUID
from app.models.base import Base
from uuid import uuid4
from sqlalchemy.orm import relationship

class University(Base):
    __tablename__ = "university"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String, unique=True, nullable=False)

    users = relationship("User", back_populates="university")