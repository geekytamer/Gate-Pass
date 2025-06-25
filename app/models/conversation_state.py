# app/models/conversation_state.py

from sqlalchemy import Column, Enum as SqlEnum, UUID, ForeignKey, DateTime, String
from app.models.base import Base
from uuid import uuid4
from datetime import datetime
import enum

class ConversationStateEnum(str, enum.Enum):
    idle = "idle"
    awaiting_exit_method = "awaiting_exit_method"
    awaiting_bus = "awaiting_bus"

class ConversationState(Base):
    __tablename__ = "conversation_state"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey('user.id'), nullable=False)
    state = Column(SqlEnum(ConversationStateEnum, name="conversation_state_enum"), default=ConversationStateEnum.idle)
    selected_bus_id = Column(UUID(as_uuid=True), nullable=True)
    language = Column(String, default="en")
    updated_at = Column(DateTime, default=datetime.utcnow)