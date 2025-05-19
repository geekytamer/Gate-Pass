import enum
from sqlalchemy import Column, UUID, ForeignKey, Enum, DateTime, String
from app.models.base import Base
from uuid import uuid4
from datetime import datetime

class ExitStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    completed = "completed"   # ✅ when student is checked out
    returned = "returned"     # ✅ when student is checked in

class ExitRequest(Base):
    __tablename__ = "exit_request"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=True)
    bus_id = Column(UUID(as_uuid=True), ForeignKey("bus.id"), nullable=True)
    exit_method = Column(String, nullable=False)
    status = Column(Enum(ExitStatus, name="exitstatus"), nullable=False, default=ExitStatus.pending)
    requested_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)