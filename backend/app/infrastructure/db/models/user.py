from sqlalchemy import Column, Integer, String, Enum
from app.infrastructure.db.base import Base
from sqlalchemy.orm import relationship
from app.domain.enums import RoleEnum


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    email = Column(String, unique=True)
    hashed_password = Column(String)
    role = Column(Enum(RoleEnum), default=RoleEnum.customer)

    assigned_orders = relationship("WorkOrder", back_populates="technician")
