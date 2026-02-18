from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.domain.exceptions import InvalidCredentials
from app.infrastructure.auth.login_handler import create_access_token
from app.infrastructure.db.models.user import User


def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, getattr(user, "hashed_password", "") or ""):
        return None
    return user


def login(db: Session, username: str, password: str) -> str:
    user = authenticate_user(db, username, password)
    if not user:
        raise InvalidCredentials("Invalid credentials")
    token = create_access_token(
        {"sub": user.username, "role": user.role, "id": user.id}
    )
    return token
