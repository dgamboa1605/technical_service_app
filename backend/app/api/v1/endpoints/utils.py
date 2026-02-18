"""
Re-export get_db so existing endpoint and test imports keep working.
Canonical implementation lives in app.api.dependencies.database.
"""
from app.api.dependencies.database import get_db

__all__ = ["get_db"]
