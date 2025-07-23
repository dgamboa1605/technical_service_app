from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.work_order import WorkOrderCreate, WorkOrderOut
from app.services import work_order_service
from app.api.v1.endpoints.utils import get_db
from app.api.dependencies.roles import require_employee
from app.infrastructure.db.models.user import User

router = APIRouter()


@router.post("/", response_model=WorkOrderOut)
def create_work_order(order: WorkOrderCreate, db: Session = Depends(get_db), _: User = Depends(require_employee)):
    return work_order_service.create_work_order(db, order.dict())


@router.get("/", response_model=list[WorkOrderOut])
def list_work_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return work_order_service.get_work_orders(db, skip, limit)
