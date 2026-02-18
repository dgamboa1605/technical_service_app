from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional


class ProductBase(BaseModel):
    item_type: str
    brand: str
    guaranteeing_brand: Optional[str] = None
    model: str
    serial_number: str
    purchase_date: Optional[date] = None
    warranty: bool
    client_id: int


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    item_type: Optional[str] = None
    brand: Optional[str] = None
    guaranteeing_brand: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    purchase_date: Optional[date] = None
    warranty: Optional[bool] = None
    client_id: Optional[int] = None


class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
