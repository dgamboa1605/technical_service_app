from sqlalchemy.orm import Session
from app.infrastructure.db.models.user import User
from app.infrastructure.auth.login_handler import create_access_token
from passlib.context import CryptContext
from fastapi import HTTPException, status

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user or not pwd_context.verify(password, getattr(user, "hashed_password")):
        return None
    return user


def login(db: Session, username: str, password: str):
    user = authenticate_user(db, username, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    token = create_access_token(
        {"sub": user.username, "role": user.role, "id": user.id}
    )
    return token
