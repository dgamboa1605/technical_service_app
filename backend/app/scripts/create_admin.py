import sys
import os

sys.path.append(os.path.abspath("."))

from sqlalchemy.orm import Session
from app.infrastructure.db.session import SessionLocal
from app.services.user_service import create_user
from app.domain.enums import RoleEnum

def main():
    db: Session = SessionLocal()
    username = "dgamboa"
    email = "admin@example.com"
    password = "admin123"

    existing = db.query(create_user.__globals__["User"]).filter_by(username=username).first()
    if existing:
        print("Admin user already exists")
        return

    user = create_user(db, username, email, password, RoleEnum.admin)
    print(f"Admin user created: {user.username} ({user.email})")

if __name__ == "__main__":
    main()
