from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserUpdate, UserOut
from app.services import user_service
from app.api.v1.endpoints.utils import get_db
from app.api.dependencies.roles import require_admin, require_employee
from app.api.dependencies.auth import get_current_user
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


@router.put("/me", response_model=UserOut)
def update_current_user(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Permite al usuario actualizar su propio perfil.
    No permite cambiar el role (solo admin puede hacerlo).
    """
    # No permitir cambiar el role desde este endpoint
    if user_update.role is not None:
        raise HTTPException(status_code=400, detail="Cannot change role from this endpoint")
    
    # Verificar si el email ya está en uso por otro usuario
    if user_update.email and user_update.email.strip():
        existing_user = user_service.get_user_by_email(db, user_update.email.strip())
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    # Verificar si el username ya está en uso por otro usuario
    if user_update.username and user_update.username.strip():
        existing_user = user_service.get_user_by_username(db, user_update.username.strip())
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(status_code=400, detail="Username already registered")
    
    # Preparar los valores para actualizar (solo los que no son None ni vacíos)
    username_to_update = user_update.username.strip() if user_update.username and user_update.username.strip() else None
    email_to_update = user_update.email.strip() if user_update.email and user_update.email.strip() else None
    password_to_update = user_update.password if user_update.password and user_update.password.strip() else None
    
    user = user_service.update_user(
        db,
        current_user.id,
        username=username_to_update,
        email=email_to_update,
        password=password_to_update,
        role=None  # No permitir cambiar el role
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


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
