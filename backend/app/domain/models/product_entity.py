from dataclasses import dataclass


@dataclass
class ProductEntity:
    id: int
    item_type: str
    brand: str
    model: str
    serial_number: str
    warranty: bool
    status: str
