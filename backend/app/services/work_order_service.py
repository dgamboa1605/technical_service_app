from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session, selectinload

from app.domain.enums import ServiceTypeEnum, WorkOrderStatusEnum
from app.domain.exceptions import NotFoundError
from app.infrastructure.db.models.work_order import (
    WorkOrder,
    WorkOrderHistory,
    WorkOrderPart,
)


# Flujo de estados de la orden:
# RECIBIDO -> ASIGNADO -> POR_CONFIRMAR -> CONFIRMADO -> EN_REPARACION -> COMPLETADO -> ENTREGADO
ALLOWED_TRANSITIONS = {
    WorkOrderStatusEnum.RECIBIDO: [WorkOrderStatusEnum.ASIGNADO],
    WorkOrderStatusEnum.ASIGNADO: [WorkOrderStatusEnum.POR_CONFIRMAR],
    WorkOrderStatusEnum.POR_CONFIRMAR: [WorkOrderStatusEnum.CONFIRMADO],
    WorkOrderStatusEnum.CONFIRMADO: [WorkOrderStatusEnum.EN_REPARACION],
    WorkOrderStatusEnum.EN_REPARACION: [WorkOrderStatusEnum.COMPLETADO],
    WorkOrderStatusEnum.COMPLETADO: [WorkOrderStatusEnum.ENTREGADO],
    WorkOrderStatusEnum.ENTREGADO: [],
}


def create_work_order(db: Session, data: dict, user_id: Optional[int] = None) -> WorkOrder:
    status = data.get("status") or WorkOrderStatusEnum.RECIBIDO
    service_type = data.get("service_type") or ServiceTypeEnum.TALLER
    work_order = WorkOrder(
        received_date=datetime.utcnow(),
        assigned_date=data.get("assigned_date"),
        technician_id=data.get("technician_id"),
        client_id=data["client_id"],
        product_id=data["product_id"],
        status=status,
        service_type=service_type,
        customer_instructions=data.get("customer_instructions"),
        item_condition=data.get("item_condition"),
        delivered_accessories=data.get("delivered_accessories"),
        observations=data.get("observations"),
        technical_report=data.get("technical_report"),
    )
    db.add(work_order)
    db.flush()

    history_entry = WorkOrderHistory(
        work_order_id=work_order.id,
        user_id=user_id,
        status_from=None,
        status_to=status,
        note="Orden creada",
    )
    db.add(history_entry)

    db.commit()
    db.refresh(work_order)
    return work_order


def get_work_order(db: Session, work_order_id: int) -> Optional[WorkOrder]:
    return db.query(WorkOrder).filter(WorkOrder.id == work_order_id).first()


def get_work_order_or_raise(db: Session, work_order_id: int) -> WorkOrder:
    """Return work order or raise NotFoundError. Use in API layer to avoid repeated 404 handling."""
    work_order = get_work_order(db, work_order_id)
    if not work_order:
        raise NotFoundError("Work order not found")
    return work_order


def get_work_order_detail(
    db: Session, work_order_id: int, hide_client: bool = False
) -> Optional[WorkOrder]:
    """
    Load work order with relations. If hide_client is True, client is set to None
    (for employee view). Caller is responsible for access control.
    """
    work_order = (
        db.query(WorkOrder)
        .options(
            selectinload(WorkOrder.client),
            selectinload(WorkOrder.product),
            selectinload(WorkOrder.technician),
            selectinload(WorkOrder.history),
            selectinload(WorkOrder.parts),
        )
        .filter(WorkOrder.id == work_order_id)
        .first()
    )
    if work_order and hide_client:
        work_order.client = None
    return work_order


def get_work_order_detail_or_raise(
    db: Session, work_order_id: int, hide_client: bool = False
) -> WorkOrder:
    """Load work order detail or raise NotFoundError. Same semantics as get_work_order_detail."""
    work_order = get_work_order_detail(db, work_order_id, hide_client=hide_client)
    if not work_order:
        raise NotFoundError("Work order not found")
    return work_order


def get_work_orders(db: Session, skip: int = 0, limit: int = 100) -> List[WorkOrder]:
    return db.query(WorkOrder).offset(skip).limit(limit).all()


def get_work_orders_with_details(db: Session, skip: int = 0, limit: int = 100) -> List[WorkOrder]:
    return (
        db.query(WorkOrder)
        .options(
            selectinload(WorkOrder.client),
            selectinload(WorkOrder.product),
            selectinload(WorkOrder.technician),
            selectinload(WorkOrder.history),
            selectinload(WorkOrder.parts),
        )
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_work_orders_with_details_for_employee(
    db: Session, employee_id: int, skip: int = 0, limit: int = 100
) -> List[WorkOrder]:
    """
    Obtiene órdenes con detalles para un empleado.
    Employee solo ve órdenes asignadas a él o sin técnico asignado (en estado recibido/asignado)
    """
    from app.domain.enums import WorkOrderStatusEnum
    
    return (
        db.query(WorkOrder)
        .options(
            selectinload(WorkOrder.client),
            selectinload(WorkOrder.product),
            selectinload(WorkOrder.technician),
            selectinload(WorkOrder.history),
            selectinload(WorkOrder.parts),
        )
        .filter(
            (WorkOrder.technician_id == employee_id) |
            (
                (WorkOrder.technician_id.is_(None)) &
                (WorkOrder.status.in_([WorkOrderStatusEnum.RECIBIDO, WorkOrderStatusEnum.ASIGNADO]))
            )
        )
        .offset(skip)
        .limit(limit)
        .all()
    )


def update_work_order_status(
    db: Session,
    work_order_id: int,
    new_status: WorkOrderStatusEnum,
    user_id: Optional[int] = None,
    note: Optional[str] = None,
) -> WorkOrder:
    work_order = get_work_order_or_raise(db, work_order_id)
    current_status = work_order.status
    allowed = ALLOWED_TRANSITIONS.get(current_status, [])
    if new_status not in allowed:
        raise ValueError(
            f"Transition from {current_status} to {new_status} is not allowed"
        )

    history_entry = WorkOrderHistory(
        work_order_id=work_order.id,
        user_id=user_id,
        status_from=current_status,
        status_to=new_status,
        note=note,
    )

    work_order.status = new_status
    db.add(history_entry)
    db.commit()
    db.refresh(work_order)
    return work_order


def update_technical_report(
    db: Session, work_order_id: int, technical_report: str
) -> WorkOrder:
    work_order = get_work_order_or_raise(db, work_order_id)
    work_order.technical_report = technical_report
    db.commit()
    db.refresh(work_order)
    return work_order


def assign_technician(
    db: Session,
    work_order_id: int,
    technician_id: int,
    user_id: Optional[int] = None,
) -> WorkOrder:
    """
    Asigna un técnico a una orden de trabajo.
    Si la orden está en estado RECIBIDO, automáticamente la cambia a ASIGNADO.
    Raises NotFoundError if work order does not exist.
    """
    from datetime import datetime

    work_order = get_work_order_or_raise(db, work_order_id)

    # Guardar el estado anterior para el historial
    previous_status = work_order.status
    
    # Asignar el técnico
    work_order.technician_id = technician_id
    work_order.assigned_date = datetime.utcnow()
    
    # Si está en estado RECIBIDO, avanzar a ASIGNADO
    if work_order.status == WorkOrderStatusEnum.RECIBIDO:
        work_order.status = WorkOrderStatusEnum.ASIGNADO
        
        # Crear entrada en el historial
        history_entry = WorkOrderHistory(
            work_order_id=work_order.id,
            user_id=user_id,
            status_from=previous_status,
            status_to=WorkOrderStatusEnum.ASIGNADO,
            note=f"Técnico asignado",
        )
        db.add(history_entry)
    
    db.commit()
    db.refresh(work_order)
    return work_order


def add_work_order_part(
    db: Session, work_order_id: int, part_data: dict, user_id: Optional[int] = None
) -> WorkOrderPart:
    get_work_order_or_raise(db, work_order_id)  # ensure exists
    qty = part_data.get("qty", 1)
    unit_price = part_data.get("unit_price", 0)
    total = part_data.get("total")
    if total is None:
        total = qty * unit_price

    part = WorkOrderPart(
        work_order_id=work_order_id,
        description=part_data["description"],
        qty=qty,
        unit_price=unit_price,
        total=total,
        created_by=user_id,
    )
    db.add(part)
    db.commit()
    db.refresh(part)
    return part


def add_history_entry(
    db: Session, work_order_id: int, history_data: dict, user_id: Optional[int] = None
) -> WorkOrderHistory:
    get_work_order_or_raise(db, work_order_id)  # ensure exists
    entry = WorkOrderHistory(
        work_order_id=work_order_id,
        user_id=user_id,
        status_from=history_data.get("status_from"),
        status_to=history_data.get("status_to"),
        note=history_data.get("note"),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def update_labor_cost(db: Session, work_order_id: int, labor_cost: float) -> WorkOrder:
    """Actualizar el costo de mano de obra/servicio. Raises NotFoundError if work order does not exist."""
    work_order = get_work_order_or_raise(db, work_order_id)
    work_order.labor_cost = labor_cost
    db.commit()
    db.refresh(work_order)
    return work_order


def get_next_work_order_number(db: Session) -> int:
    last_id = db.query(WorkOrder.id).order_by(WorkOrder.id.desc()).first()
    if last_id and last_id[0]:
        return last_id[0] + 1
    return 1
