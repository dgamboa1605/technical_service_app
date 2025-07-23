from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.infrastructure.db.base import Base


class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    phone = Column(String)

    products = relationship("Product", back_populates="client", cascade="all, delete")
    work_orders = relationship("WorkOrder", back_populates="client", cascade="all, delete")
