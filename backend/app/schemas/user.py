from pydantic import BaseModel, EmailStr
from app.domain.enums import RoleEnum


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: RoleEnum


class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: RoleEnum

    class Config:
        orm_mode = True
