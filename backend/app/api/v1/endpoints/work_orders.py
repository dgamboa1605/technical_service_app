from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies.roles import require_employee, require_admin, is_admin
from app.api.dependencies.auth import get_current_user
from app.api.dependencies.work_order_access import require_work_order_employee_access
from app.api.v1.endpoints.utils import get_db
from app.infrastructure.db.models.user import User
from app.infrastructure.db.models.work_order import WorkOrder
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
    current_user: User = Depends(require_admin),
):
    """Solo administradores pueden crear órdenes de trabajo"""
    return work_order_service.create_work_order(db, order.model_dump(), user_id=current_user.id)


@router.get("/next/number", response_model=int)
def get_next_work_order_number(db: Session = Depends(get_db)):
    return work_order_service.get_next_work_order_number(db)


@router.get("/all/details", response_model=list[WorkOrderDetail])
def list_work_orders_with_details(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lista órdenes con detalles. Employees solo ven órdenes asignadas o sin técnico"""
    if is_admin(current_user):
        return work_order_service.get_work_orders_with_details(db, skip, limit)
    else:
        # Employee solo ve órdenes asignadas a él o sin técnico asignado
        return work_order_service.get_work_orders_with_details_for_employee(
            db, current_user.id, skip, limit
        )


@router.get("/", response_model=list[WorkOrderOut])
def list_work_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return work_order_service.get_work_orders(db, skip, limit)


@router.get("/{work_order_id}", response_model=WorkOrderOut)
def get_work_order(work_order_id: int, db: Session = Depends(get_db)):
    return work_order_service.get_work_order_or_raise(db, work_order_id)


@router.get("/{work_order_id}/detail", response_model=WorkOrderDetail)
def get_work_order_detail(
    work_order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: WorkOrder = Depends(require_work_order_employee_access()),
):
    """Obtiene detalle de orden. Para employees, oculta información del cliente"""
    hide_client = not is_admin(current_user)
    return work_order_service.get_work_order_detail_or_raise(
        db, work_order_id, hide_client=hide_client
    )


@router.patch("/{work_order_id}/status", response_model=WorkOrderOut)
def update_work_order_status(
    work_order_id: int,
    payload: WorkOrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
    _: WorkOrder = Depends(require_work_order_employee_access()),
):
    """Actualizar estado de orden. Employee solo puede si es el técnico asignado o la orden no tiene técnico"""
    try:
        work_order = work_order_service.update_work_order_status(
            db, work_order_id, payload.status, user_id=current_user.id, note=payload.note
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return work_order


@router.patch("/{work_order_id}/technical-report", response_model=WorkOrderOut)
def update_work_order_technical_report(
    work_order_id: int,
    payload: WorkOrderTechnicalReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
    _: WorkOrder = Depends(require_work_order_employee_access(allow_unassigned=False)),
):
    """Actualizar informe técnico. Employee solo puede si es el técnico asignado"""
    return work_order_service.update_technical_report(
        db, work_order_id, payload.technical_report
    )


@router.patch("/{work_order_id}/technician", response_model=WorkOrderOut)
def assign_technician_to_work_order(
    work_order_id: int,
    payload: WorkOrderTechnicianUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Asigna un técnico a una orden de trabajo.
    Solo administradores pueden asignar técnicos.
    Si la orden está en estado RECIBIDO, automáticamente la cambia a ASIGNADO.
    """
    return work_order_service.assign_technician(
        db, work_order_id, payload.technician_id, user_id=current_user.id
    )


@router.patch("/{work_order_id}/labor-cost", response_model=WorkOrderOut)
def update_work_order_labor_cost(
    work_order_id: int,
    payload: WorkOrderLaborCostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
    _: WorkOrder = Depends(require_work_order_employee_access(allow_unassigned=False)),
):
    """Actualizar el costo de mano de obra/servicio. Employee solo puede si es el técnico asignado"""
    return work_order_service.update_labor_cost(db, work_order_id, payload.labor_cost)


@router.post("/{work_order_id}/history", response_model=WorkOrderHistoryOut)
def add_history_entry(
    work_order_id: int,
    payload: WorkOrderHistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Solo administradores pueden agregar entradas al historial/bitácora"""
    return work_order_service.add_history_entry(
        db, work_order_id, payload.model_dump(), user_id=current_user.id
    )


@router.post("/{work_order_id}/parts", response_model=WorkOrderPartOut)
def add_work_order_part(
    work_order_id: int,
    payload: WorkOrderPartCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee),
    _: WorkOrder = Depends(require_work_order_employee_access(allow_unassigned=False)),
):
    """Agregar repuesto. Employee solo puede si es el técnico asignado"""
    return work_order_service.add_work_order_part(
        db, work_order_id, payload.model_dump(), user_id=current_user.id
    )


@router.post("/{work_order_id}/confirm", response_model=WorkOrderOut)
def confirm_work_order_public(
    work_order_id: int,
    db: Session = Depends(get_db),
):
    """
    Endpoint público para que el cliente confirme una orden.
    Solo permite la transición de por_confirmar a confirmado.
    """
    work_order = work_order_service.get_work_order_or_raise(db, work_order_id)
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
