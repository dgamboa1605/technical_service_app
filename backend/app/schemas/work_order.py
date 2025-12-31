from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.domain.enums import ServiceTypeEnum, WorkOrderStatusEnum
from app.schemas.user import UserOut
from app.schemas.client import ClientOut
from app.schemas.product import ProductOut
from app.schemas.user import UserOut


class WorkOrderBase(BaseModel):
    client_id: int
    product_id: int
    technician_id: Optional[int] = None
    assigned_date: Optional[datetime] = None
    status: WorkOrderStatusEnum = WorkOrderStatusEnum.POR_CONFIRMAR
    service_type: ServiceTypeEnum = ServiceTypeEnum.TALLER
    customer_instructions: Optional[str] = None
    item_condition: Optional[str] = None
    delivered_accessories: Optional[str] = None
    observations: Optional[str] = None
    technical_report: Optional[str] = None
    labor_cost: Optional[float] = 0


class WorkOrderCreate(WorkOrderBase):
    pass


class WorkOrderOut(WorkOrderBase):
    id: int
    received_date: datetime

    class Config:
        orm_mode = True


class WorkOrderStatusUpdate(BaseModel):
    status: WorkOrderStatusEnum
    note: Optional[str] = None


class WorkOrderTechnicalReportUpdate(BaseModel):
    technical_report: str


class WorkOrderTechnicianUpdate(BaseModel):
    """Schema para asignar o cambiar el técnico de una orden"""
    technician_id: int


class WorkOrderLaborCostUpdate(BaseModel):
    """Schema para actualizar el costo de mano de obra/servicio"""
    labor_cost: float


class WorkOrderHistoryBase(BaseModel):
    status_from: Optional[WorkOrderStatusEnum] = None
    status_to: Optional[WorkOrderStatusEnum] = None
    note: Optional[str] = None


class WorkOrderHistoryCreate(WorkOrderHistoryBase):
    pass


class WorkOrderHistoryOut(WorkOrderHistoryBase):
    id: int
    work_order_id: int
    user_id: Optional[int] = None
    user: Optional[UserOut] = None
    created_at: datetime

    class Config:
        orm_mode = True


class WorkOrderPartBase(BaseModel):
    description: str
    qty: float = 1
    unit_price: float = 0
    total: Optional[float] = None


class WorkOrderPartCreate(WorkOrderPartBase):
    pass


class WorkOrderPartOut(WorkOrderPartBase):
    id: int
    work_order_id: int
    created_by: Optional[int] = None
    user: Optional[UserOut] = None
    created_at: datetime

    class Config:
        orm_mode = True


class WorkOrderDetail(WorkOrderOut):
    client: Optional[ClientOut] = None
    product: Optional[ProductOut] = None
    technician: Optional[UserOut] = None
    history: List[WorkOrderHistoryOut] = Field(default_factory=list)
    parts: List[WorkOrderPartOut] = Field(default_factory=list)

    class Config:
        orm_mode = True
