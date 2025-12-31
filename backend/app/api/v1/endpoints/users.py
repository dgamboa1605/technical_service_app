from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserUpdate, UserOut
from app.services import user_service
from app.api.v1.endpoints.utils import get_db
from app.api.dependencies.roles import require_admin, require_employee
from app.infrastructure.db.models.user import User

router = APIRouter()


@router.post("/", response_model=UserOut)
def create_user(
    user: UserCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)
):
    db_user = user_service.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return user_service.create_user(
        db, user.username, user.email, user.password, user.role
    )


@router.get("/", response_model=list[UserOut])
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return user_service.get_users(db, skip, limit)


@router.get("/technicians", response_model=list[UserOut])
def list_technicians(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_employee),
):
    return user_service.get_technicians(db, skip, limit)


@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = user_service.update_user(
        db,
        user_id,
        username=user_update.username,
        email=user_update.email,
        password=user_update.password,
        role=user_update.role
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own user")
    
    success = user_service.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}
