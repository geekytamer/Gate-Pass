from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, constr
from uuid import UUID

class StudentCreate(BaseModel):
    name: constr(min_length=2)
    phone_number: constr(min_length=8, max_length=15)
    password: constr(min_length=6)
    accommodation_id: UUID

class ParentInput(BaseModel):
    name: str
    phone_number: str

class StudentWithParentCreate(BaseModel):
    student_name: str
    student_phone: str
    parent: ParentInput

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