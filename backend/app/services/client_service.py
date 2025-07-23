from sqlalchemy.orm import Session
from app.infrastructure.db.models.client import Client


def create_client(db: Session, name: str, phone: str):
    client = Client(name=name, phone=phone)
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


def get_client(db: Session, client_id: int):
    return db.query(Client).filter(Client.id == client_id).first()


def get_clients(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Client).offset(skip).limit(limit).all()
