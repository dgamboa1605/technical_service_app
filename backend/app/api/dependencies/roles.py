from fastapi import Depends, HTTPException, status
from app.api.dependencies.auth import get_current_user
from app.infrastructure.db.models.user import User


def require_admin(current_user: User = Depends(get_current_user)):
    if getattr(current_user, "role", None) != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )
    return current_user


def require_employee(current_user: User = Depends(get_current_user)):
    if getattr(current_user, "role", None) not in ["admin", "employee"]:
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
