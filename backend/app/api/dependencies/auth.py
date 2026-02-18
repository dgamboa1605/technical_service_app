from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.infrastructure.auth.login_handler import verify_token
from app.infrastructure.db.models.user import User

from app.api.dependencies.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
    )
    payload = verify_token(token)
    if not payload:
        raise credentials_exception

    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user
