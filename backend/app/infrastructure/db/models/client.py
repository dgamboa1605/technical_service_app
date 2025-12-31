from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.infrastructure.db.base import Base


class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True)
    document_number = Column(String, unique=True, nullable=True)
    name = Column(String)
    phone = Column(String)
    address = Column(String, nullable=True)
    email = Column(String, nullable=True)

    products = relationship("Product", back_populates="client", cascade="all, delete")
    work_orders = relationship("WorkOrder", back_populates="client", cascade="all, delete")
