"""
Dependency for work order access: admin or assigned technician.
Returns work_order or raises 404/403. Use in endpoints that require
"employee can only access orders assigned to them".

When allow_unassigned=True (default), employee may also access orders with no
technician assigned. When False, employee must be the assigned technician.
"""
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.api.dependencies.database import get_db
from app.api.dependencies.roles import is_admin
from app.infrastructure.db.models.user import User
from app.infrastructure.db.models.work_order import WorkOrder
from app.services import work_order_service


def require_work_order_employee_access(allow_unassigned: bool = True):
    """Factory: returns a dependency that enforces work order access for employee/admin."""

    def _dependency(
        work_order_id: int,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> WorkOrder:
        work_order = work_order_service.get_work_order_or_raise(db, work_order_id)
        if not is_admin(current_user):
            if allow_unassigned:
                if work_order.technician_id and work_order.technician_id != current_user.id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="You can only access orders assigned to you",
                    )
            else:
                if not work_order.technician_id or work_order.technician_id != current_user.id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="You can only access orders assigned to you",
                    )
        return work_order

    return _dependency
