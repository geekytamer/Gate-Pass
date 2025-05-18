from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class ExitRequestOut(BaseModel):
    id: UUID
    exit_method: str
    status: str
    requested_at: datetime
    approved_at: Optional[datetime] = None

    class Config:
        orm_mode = True