from sqlalchemy import Column, String, DateTime
from app.models.base import Base
from datetime import datetime

class ProcessedWebhook(Base):
    __tablename__ = "processed_webhook"

    id = Column(String, primary_key=True)  # WhatsApp message ID
    processed_at = Column(DateTime, default=datetime.utcnow)