from sqlalchemy import Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.domain.enums import RoleEnum
from app.infrastructure.db.base import Base


def _role_enum_values(obj):
    return [e.value for e in obj]


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String, unique=True)
    email: Mapped[str] = mapped_column(String, unique=True)
    hashed_password: Mapped[str] = mapped_column(String)
    role: Mapped[RoleEnum] = mapped_column(
        Enum(RoleEnum, values_callable=_role_enum_values),
        default=RoleEnum.customer,
    )

    assigned_orders = relationship("WorkOrder", back_populates="technician")
