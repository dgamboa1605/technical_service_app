from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.domain.enums import RoleEnum
from app.infrastructure.db.models.user import User


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


def create_user(db: Session, username: str, email: str, password: str, role: RoleEnum):
    hashed_password = hash_password(password)
    user = User(
        username=username, email=email, hashed_password=hashed_password, role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()


def get_technicians(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(User)
        .filter(User.role.in_([RoleEnum.admin, RoleEnum.employee]))
        .offset(skip)
        .limit(limit)
        .all()
    )


def update_user(db: Session, user_id: int, username: str = None, email: str = None, password: str = None, role: RoleEnum = None):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    
    if username is not None:
        user.username = username
    if email is not None:
        user.email = email
    if password is not None:
        user.hashed_password = hash_password(password)
    if role is not None:
        user.role = role
    
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return False
    
    db.delete(user)
    db.commit()
    return True
