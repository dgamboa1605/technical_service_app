from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.domain.enums import WorkOrderStatusEnum, ServiceTypeEnum
from app.infrastructure.db.base import Base


class WorkOrder(Base):
    __tablename__ = "work_orders"

    id = Column(Integer, primary_key=True, index=True)
    received_date = Column(DateTime, default=datetime.utcnow)
    assigned_date = Column(DateTime, nullable=True)
    status = Column(Enum(WorkOrderStatusEnum, values_callable=lambda obj: [e.value for e in obj]), default=WorkOrderStatusEnum.RECIBIDO)
    service_type = Column(Enum(ServiceTypeEnum, values_callable=lambda obj: [e.value for e in obj]), default=ServiceTypeEnum.TALLER)
    customer_instructions = Column(Text, nullable=True)
    item_condition = Column(Text, nullable=True)
    delivered_accessories = Column(Text, nullable=True)
    observations = Column(Text, nullable=True)
    technical_report = Column(Text, nullable=True)
    labor_cost = Column(Float, nullable=True, default=0)

    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    technician_id = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )  # assuming technicians are users

    client = relationship("Client", back_populates="work_orders")
    product = relationship("Product", back_populates="work_orders")
    technician = relationship("User", back_populates="assigned_orders")
    history = relationship(
        "WorkOrderHistory",
        back_populates="work_order",
        cascade="all, delete",
        order_by="WorkOrderHistory.created_at",
    )
    parts = relationship(
        "WorkOrderPart",
        back_populates="work_order",
        cascade="all, delete",
        order_by="WorkOrderPart.created_at",
    )


class WorkOrderHistory(Base):
    __tablename__ = "work_order_history"

    id = Column(Integer, primary_key=True, index=True)
    work_order_id = Column(Integer, ForeignKey("work_orders.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status_from = Column(Enum(WorkOrderStatusEnum, values_callable=lambda obj: [e.value for e in obj]), nullable=True)
    status_to = Column(Enum(WorkOrderStatusEnum, values_callable=lambda obj: [e.value for e in obj]), nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    work_order = relationship("WorkOrder", back_populates="history")
    user = relationship("User")


class WorkOrderPart(Base):
    __tablename__ = "work_order_parts"

    id = Column(Integer, primary_key=True, index=True)
    work_order_id = Column(Integer, ForeignKey("work_orders.id", ondelete="CASCADE"), nullable=False)
    description = Column(Text, nullable=False)
    qty = Column(Float, nullable=False, default=1)
    unit_price = Column(Float, nullable=False, default=0)
    total = Column(Float, nullable=False, default=0)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    work_order = relationship("WorkOrder", back_populates="parts")
    user = relationship("User")
