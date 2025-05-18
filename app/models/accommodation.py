from sqlalchemy import Column, String, UUID, ForeignKey
from app.models.base import Base
from uuid import uuid4
from sqlalchemy.orm import relationship

class Accommodation(Base):
    __tablename__ = "accommodation"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    university_id = Column(UUID(as_uuid=True), ForeignKey('university.id'))
    name = Column(String, nullable=False)

    residents = relationship("User", back_populates="accommodation")