"""Password hashing using bcrypt. Use this instead of passlib to avoid bcrypt 4.1+ compatibility issues."""

import bcrypt


def hash_password(password: str) -> str:
    """Return a bcrypt hash of the password (as string)."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return True if plain_password matches the hashed_password."""
    if not hashed_password:
        return False
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False
