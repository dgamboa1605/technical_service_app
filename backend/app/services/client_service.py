from sqlalchemy.orm import Session
from app.infrastructure.db.models.client import Client


def create_client(db: Session, data: dict):
    client = Client(
        document_number=data.get("document_number"),
        name=data.get("name"),
        phone=data.get("phone"),
        address=data.get("address"),
        email=data.get("email"),
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


def get_client(db: Session, client_id: int):
    return db.query(Client).filter(Client.id == client_id).first()


def get_clients(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Client).offset(skip).limit(limit).all()


def get_client_by_document(db: Session, document_number: str):
    return (
        db.query(Client)
        .filter(Client.document_number == document_number)
        .first()
    )


def update_client(db: Session, client_id: int, data: dict):
    client = get_client(db, client_id)
    if not client:
        return None

    for field in ["document_number", "name", "phone", "address", "email"]:
        if field in data:
            setattr(client, field, data[field])

    db.commit()
    db.refresh(client)
    return client


def delete_client(db: Session, client_id: int):
    client = get_client(db, client_id)
    if not client:
        return False

    db.delete(client)
    db.commit()
    return True

