from sqlalchemy.orm import Session
from app.infrastructure.db.models.work_order import WorkOrder
from datetime import datetime


def create_work_order(db: Session, data: dict):
    work_order = WorkOrder(
        received_date=datetime.utcnow(),
        assigned_date=data.get("assigned_date"),
        technician_id=data["technician_id"],
        client_id=data["client_id"],
        product_id=data["product_id"],
    )
    db.add(work_order)
    db.commit()
    db.refresh(work_order)
    return work_order


def get_work_order(db: Session, work_order_id: int):
    return db.query(WorkOrder).filter(WorkOrder.id == work_order_id).first()


def get_work_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(WorkOrder).offset(skip).limit(limit).all()
