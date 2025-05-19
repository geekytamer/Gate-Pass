from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, constr
from uuid import UUID

class StudentCreate(BaseModel):
    name: constr(min_length=2)
    phone_number: constr(min_length=8, max_length=15)
    password: constr(min_length=6)
    accommodation_id: UUID

class ParentInfo(BaseModel):
    name: str
    phone_number: str

class RegisterWithParentInput(BaseModel):
    student_name: str
    student_phone: str
    parent: ParentInfo
    accommodation_id: Optional[UUID] = Field(None, description="Optional accommodation assignment")

class ParentInfo(BaseModel):
    id: UUID
    name: str
    phone_number: str

class ExitRequestOut(BaseModel):
    id: UUID
    exit_method: str
    status: str
    requested_at: datetime
    approved_at: Optional[datetime] = None

class ActivityEntry(BaseModel):
    exit_method: str
    status: str
    requested_at: datetime

class StudentDetailsResponse(BaseModel):
    id: UUID
    name: str
    phone_number: str
    accommodation: Optional[str]
    parent: Optional[ParentInfo]
    current_request: Optional[ExitRequestOut]
    activity_log: List[ActivityEntry]

class ParentUpdate(BaseModel):
    name: Optional[str]
    phone_number: Optional[str]

class StudentUpdate(BaseModel):
    name: Optional[str]
    phone_number: Optional[str]
    accommodation: Optional[str]
    parent: Optional[ParentUpdate]