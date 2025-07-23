from pydantic import BaseModel
from app.domain.enums import ProductStatusEnum


class ProductBase(BaseModel):
    item_type: str
    brand: str
    model: str
    serial_number: str
    warranty: bool
    status: ProductStatusEnum = ProductStatusEnum.RECEIVED
    client_id: int


class ProductCreate(ProductBase):
    pass


class ProductOut(ProductBase):
    id: int

    class Config:
        orm_mode = True
