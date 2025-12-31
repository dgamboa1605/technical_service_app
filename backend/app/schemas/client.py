from pydantic import BaseModel, EmailStr
from typing import Optional


class ClientBase(BaseModel):
    document_number: Optional[str] = None
    name: str
    phone: str
    address: Optional[str] = None
    email: Optional[EmailStr] = None


class ClientCreate(ClientBase):
    pass


class ClientOut(ClientBase):
    id: int

    class Config:
        orm_mode = True
