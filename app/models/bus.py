from sqlalchemy import Column, String, Integer, UUID, ForeignKey
from app.models.base import Base
from uuid import uuid4

class Bus(Base):
    __tablename__ = "bus"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    accommodation_id = Column(UUID(as_uuid=True), ForeignKey('accommodation.id'), nullable=False)
    university_id = Column(UUID(as_uuid=True), ForeignKey('university.id'), nullable=False)
    name = Column(String, nullable=False)
    destination_district = Column(String, nullable=False)
    capacity = Column(Integer, nullable=True)  # optional if you want capacity limits