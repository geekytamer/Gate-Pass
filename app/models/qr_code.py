from sqlalchemy import Column, UUID, ForeignKey, DateTime, Boolean, String
from app.models.base import Base
from uuid import uuid4
from datetime import datetime

class QRCode(Base):
    __tablename__ = "qr_code"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    exit_request_id = Column(UUID(as_uuid=True), ForeignKey('exit_request.id'))
    qr_token = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)