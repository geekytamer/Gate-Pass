from pydantic import BaseModel, Field, constr
from uuid import UUID

class UserCreate(BaseModel):
    name: str
    phone_number: str = Field(..., min_length=8)
    password: str
    role: str  # 'student', 'parent', 'admin', 'security'

class Token(BaseModel):
    access_token: str
    token_type: str