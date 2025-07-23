from dataclasses import dataclass
from datetime import datetime


@dataclass
class WorkOrderEntity:
    id: int
    received_date: datetime
    assigned_date: datetime
    technician_id: int
    client_id: int
    product_id: int
