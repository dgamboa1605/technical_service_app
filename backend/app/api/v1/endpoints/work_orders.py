from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies.roles import require_employee
from app.api.v1.endpoints.utils import get_db
from app.infrastructure.db.models.user import User
from app.schemas.work_order import (
    WorkOrderCreate,
    WorkOrderDetail,
    WorkOrderHistoryCreate,
    WorkOrderHistoryOut,
    WorkOrderOut,
    WorkOrderPartCreate,
    WorkOrderPartOut,
    WorkOrderStatusUpdate,
    WorkOrderTechnicalReportUpdate,
    WorkOrderTechnicianUpdate,
    WorkOrderLaborCostUpdate,
)
from app.services import work_order_service

router = APIRouter()


@router.post("/", response_model=WorkOrderOut)
def create_work_order(
    order: WorkOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
):
    return work_order_service.create_work_order(db, order.dict(), user_id=current_user.id)


@router.get("/next/number", response_model=int)
def get_next_work_order_number(db: Session = Depends(get_db)):
    return work_order_service.get_next_work_order_number(db)


@router.get("/all/details", response_model=list[WorkOrderDetail])
def list_work_orders_with_details(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return work_order_service.get_work_orders_with_details(db, skip, limit)


@router.get("/", response_model=list[WorkOrderOut])
def list_work_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return work_order_service.get_work_orders(db, skip, limit)


@router.get("/{work_order_id}", response_model=WorkOrderOut)
def get_work_order(work_order_id: int, db: Session = Depends(get_db)):
    work_order = work_order_service.get_work_order(db, work_order_id)
    if not work_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work order not found")
    return work_order


@router.get("/{work_order_id}/detail", response_model=WorkOrderDetail)
def get_work_order_detail(work_order_id: int, db: Session = Depends(get_db)):
    work_order = work_order_service.get_work_order_detail(db, work_order_id)
    if not work_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work order not found")
    return work_order


@router.patch("/{work_order_id}/status", response_model=WorkOrderOut)
def update_work_order_status(
    work_order_id: int,
    payload: WorkOrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
):
    try:
        work_order = work_order_service.update_work_order_status(
            db, work_order_id, payload.status, user_id=current_user.id, note=payload.note
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    if not work_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work order not found")
    return work_order


@router.patch("/{work_order_id}/technical-report", response_model=WorkOrderOut)
def update_work_order_technical_report(
    work_order_id: int,
    payload: WorkOrderTechnicalReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
):
    work_order = work_order_service.update_technical_report(
        db, work_order_id, payload.technical_report
    )
    if not work_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work order not found")
    return work_order


@router.patch("/{work_order_id}/technician", response_model=WorkOrderOut)
def assign_technician_to_work_order(
    work_order_id: int,
    payload: WorkOrderTechnicianUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
):
    """
    Asigna un técnico a una orden de trabajo.
    Si la orden está en estado RECIBIDO, automáticamente la cambia a ASIGNADO.
    """
    work_order = work_order_service.assign_technician(
        db, work_order_id, payload.technician_id, user_id=current_user.id
    )
    if not work_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work order not found")
    return work_order


@router.patch("/{work_order_id}/labor-cost", response_model=WorkOrderOut)
def update_work_order_labor_cost(
    work_order_id: int,
    payload: WorkOrderLaborCostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
):
    """Actualizar el costo de mano de obra/servicio"""
    work_order = work_order_service.update_labor_cost(db, work_order_id, payload.labor_cost)
    if not work_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work order not found")
    return work_order


@router.post("/{work_order_id}/history", response_model=WorkOrderHistoryOut)
def add_history_entry(
    work_order_id: int,
    payload: WorkOrderHistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
):
    entry = work_order_service.add_history_entry(
        db, work_order_id, payload.dict(), user_id=current_user.id
    )
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work order not found")
    return entry


@router.post("/{work_order_id}/parts", response_model=WorkOrderPartOut)
def add_work_order_part(
    work_order_id: int,
    payload: WorkOrderPartCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
):
    part = work_order_service.add_work_order_part(
        db, work_order_id, payload.dict(), user_id=current_user.id
    )
    if not part:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work order not found")
    return part


@router.post("/{work_order_id}/confirm", response_model=WorkOrderOut)
def confirm_work_order_public(
    work_order_id: int,
    db: Session = Depends(get_db),
):
    """
    Endpoint público para que el cliente confirme una orden.
    Solo permite la transición de por_confirmar a confirmado.
    """
    work_order = work_order_service.get_work_order(db, work_order_id)
    if not work_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work order not found")
    
    if work_order.status != "por_confirmar":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="La orden debe estar en estado 'por_confirmar' para ser confirmada"
        )
    
    try:
        work_order = work_order_service.update_work_order_status(
            db, work_order_id, "confirmado", note="Orden confirmada por el cliente"
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    
    return work_order
