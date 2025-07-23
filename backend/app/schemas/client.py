from pydantic import BaseModel


class ClientBase(BaseModel):
    name: str
    phone: str


class ClientCreate(ClientBase):
    pass


class ClientOut(ClientBase):
    id: int

    class Config:
        orm_mode = True
