from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from app.domain.enums import RoleEnum
import re


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: RoleEnum


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None  # Usar str para permitir validación manual
    password: Optional[str] = None
    role: Optional[RoleEnum] = None
    
    @field_validator('email', mode='before')
    @classmethod
    def validate_email(cls, v):
        if v is None or v == '' or (isinstance(v, str) and v.strip() == ''):
            return None
        # Validar formato básico de email
        if isinstance(v, str):
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, v.strip()):
                raise ValueError('Invalid email format')
            return v.strip()
        return v


class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: RoleEnum

    class Config:
        orm_mode = True
