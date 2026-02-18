"""
Single source of truth for database session dependency.
Used by auth, endpoints, and tests (via dependency_overrides).
"""
from sqlalchemy.orm import Session
from app.infrastructure.db.session import SessionLocal


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
