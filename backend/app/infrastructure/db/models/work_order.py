from datetime import datetime
from typing import Optional

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.domain.enums import ServiceTypeEnum, WorkOrderStatusEnum
from app.infrastructure.db.base import Base


def _enum_values(obj):  # for Enum values_callable
    return [e.value for e in obj]


class WorkOrder(Base):
    __tablename__ = "work_orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    received_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    assigned_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    status: Mapped[WorkOrderStatusEnum] = mapped_column(
        Enum(WorkOrderStatusEnum, values_callable=_enum_values),
        default=WorkOrderStatusEnum.RECIBIDO,
    )
    service_type: Mapped[ServiceTypeEnum] = mapped_column(
        Enum(ServiceTypeEnum, values_callable=_enum_values),
        default=ServiceTypeEnum.TALLER,
    )
    customer_instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    item_condition: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    delivered_accessories: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    observations: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    technical_report: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    labor_cost: Mapped[Optional[float]] = mapped_column(Float, nullable=True, default=0)

    client_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("clients.id"), nullable=False
    )
    product_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("products.id"), nullable=False
    )
    technician_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

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
