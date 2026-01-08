from fastapi import Depends, HTTPException, status
from app.api.dependencies.auth import get_current_user
from app.infrastructure.db.models.user import User


def require_admin(current_user: User = Depends(get_current_user)):
    role = getattr(current_user, "role", None)
    role_value = role.value if hasattr(role, 'value') else str(role)
    if role_value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )
    return current_user


def require_employee(current_user: User = Depends(get_current_user)):
    role = getattr(current_user, "role", None)
    role_value = role.value if hasattr(role, 'value') else str(role)
    if role_value not in ["admin", "employee"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employee or admin access required",
        )
    return current_user


def require_customer(current_user: User = Depends(get_current_user)):
    if getattr(current_user, "role", None) != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Customer access required"
        )
    return current_user


def is_admin(user: User) -> bool:
    """Helper function to check if user is admin"""
    role = getattr(user, "role", None)
    # Manejar tanto string como enum
    if hasattr(role, 'value'):
        return role.value == "admin"
    return str(role) == "admin"


def is_employee(user: User) -> bool:
    """Helper function to check if user is employee (including admin)"""
    role = getattr(user, "role", None)
    # Manejar tanto string como enum
    if hasattr(role, 'value'):
        role_value = role.value
    else:
        role_value = str(role)
    return role_value in ["admin", "employee"]
