from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.infrastructure.db.base import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    item_type = Column(String, nullable=False)
    brand = Column(String, nullable=False)
    guaranteeing_brand = Column(String, nullable=True)
    model = Column(String, nullable=False)
    serial_number = Column(String, unique=True, nullable=False)
    purchase_date = Column(Date, nullable=True)
    warranty = Column(Boolean, default=False)

    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    client = relationship("Client", back_populates="products")
    work_orders = relationship("WorkOrder", back_populates="product", cascade="all, delete")
