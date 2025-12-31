from dataclasses import dataclass
from typing import Optional


@dataclass
class ProductEntity:
    id: int
    item_type: str
    brand: str
    guaranteeing_brand: Optional[str]
    model: str
    serial_number: str
    purchase_date: Optional[str]
    warranty: bool
