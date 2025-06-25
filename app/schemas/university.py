
from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class UniversityCreate(BaseModel):
    name: str

class UniversityOut(BaseModel):
    id: UUID
    name: str

    class Config:
        orm_mode = True