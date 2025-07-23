from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.domain.enums import WorkOrderStatusEnum
from app.infrastructure.db.base import Base


class WorkOrder(Base):
    __tablename__ = "work_orders"

    id = Column(Integer, primary_key=True, index=True)
    received_date = Column(DateTime, default=datetime.utcnow)
    assigned_date = Column(DateTime, nullable=True)
    status = Column(Enum(WorkOrderStatusEnum), default=WorkOrderStatusEnum.RECEIVED)

    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    technician_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)  # assuming technicians are users

    client = relationship("Client", back_populates="work_orders")
    product = relationship("Product", back_populates="work_orders")
    technician = relationship("User", back_populates="assigned_orders")
