from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.base import Base
from app.models import (
    university,
    accommodation,
    user,
    bus,
    otp,
    exit_request,
    conversation_state,
    processed_webhook
)
from app.core.config import settings

# SQLite needs a special setting
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Create engine
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Initialize DB (create tables)
def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ DB schema initialized.")
    except Exception as e:
        print("❌ DB init failed:", e)