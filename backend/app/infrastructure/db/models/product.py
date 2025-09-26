from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.domain.enums import ProductStatusEnum
from app.infrastructure.db.base import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    item_type = Column(String, nullable=False)
    brand = Column(String, nullable=False)
    model = Column(String, nullable=False)
    serial_number = Column(String, unique=True, nullable=False)
    warranty = Column(Boolean, default=False)
    status = Column(Enum(ProductStatusEnum), default=ProductStatusEnum.RECEIVED)

    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    client = relationship("Client", back_populates="products")
    work_orders = relationship("WorkOrder", back_populates="product", cascade="all, delete")
