from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from app.domain.enums import ServiceTypeEnum, WorkOrderStatusEnum


@dataclass
class WorkOrderEntity:
    id: int
    received_date: datetime
    assigned_date: Optional[datetime]
    technician_id: Optional[int]
    client_id: int
    product_id: int
    status: WorkOrderStatusEnum
    service_type: ServiceTypeEnum
    customer_instructions: Optional[str]
    item_condition: Optional[str]
    delivered_accessories: Optional[str]
    observations: Optional[str]
