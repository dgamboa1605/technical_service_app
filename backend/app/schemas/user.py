from pydantic import BaseModel, EmailStr
from typing import Optional
from app.domain.enums import RoleEnum


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: RoleEnum


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[RoleEnum] = None


class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: RoleEnum

    class Config:
        orm_mode = True
