from dataclasses import dataclass
from typing import Optional


@dataclass
class ClientEntity:
    id: int
    document_number: Optional[str]
    name: str
    phone: str
    address: Optional[str]
    email: Optional[str]
