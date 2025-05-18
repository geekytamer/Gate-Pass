from sqlalchemy import Column, String, UUID, ForeignKey, DateTime, Boolean
from app.models.base import Base
from uuid import uuid4
from datetime import datetime

class OTP(Base):
    __tablename__ = "otp"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('user.id'))
    otp_code = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)