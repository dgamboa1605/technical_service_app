from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserOut
from app.services import user_service
from app.api.v1.endpoints.utils import get_db
from app.api.dependencies.roles import require_admin
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
