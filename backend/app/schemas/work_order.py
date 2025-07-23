from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.domain.enums import WorkOrderStatusEnum


class WorkOrderBase(BaseModel):
    client_id: int
    product_id: int
    technician_id: Optional[int] = None
    assigned_date: Optional[datetime] = None
    status: WorkOrderStatusEnum = WorkOrderStatusEnum.RECEIVED


class WorkOrderCreate(WorkOrderBase):
    pass


class WorkOrderOut(WorkOrderBase):
    id: int
    received_date: datetime

    class Config:
        orm_mode = True
