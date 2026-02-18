from fastapi import Depends, HTTPException, status
from app.api.dependencies.auth import get_current_user
from app.infrastructure.db.models.user import User


def _role_value(role) -> str:
    """Normalize role to string (handles enum or string)."""
    if role is None:
        return ""
    return role.value if hasattr(role, "value") else str(role)


def require_admin(current_user: User = Depends(get_current_user)):
    if _role_value(getattr(current_user, "role", None)) != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )
    return current_user


def require_employee(current_user: User = Depends(get_current_user)):
    if _role_value(getattr(current_user, "role", None)) not in ("admin", "employee"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employee or admin access required",
        )
    return current_user


def is_admin(user: User) -> bool:
    """Helper function to check if user is admin."""
    return _role_value(getattr(user, "role", None)) == "admin"


def is_employee(user: User) -> bool:
    """Helper function to check if user is employee (including admin)."""
    return _role_value(getattr(user, "role", None)) in ("admin", "employee")
