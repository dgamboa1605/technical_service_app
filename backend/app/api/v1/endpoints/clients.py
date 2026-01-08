from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.client import ClientCreate, ClientOut
from app.services import client_service
from app.api.v1.endpoints.utils import get_db
from app.api.dependencies.roles import require_admin, require_employee
from app.infrastructure.db.models.user import User

router = APIRouter()


@router.post("/", response_model=ClientOut)
def create_client(
    client: ClientCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Solo administradores pueden crear clientes"""
    return client_service.create_client(db, client.dict())


@router.get("/", response_model=list[ClientOut])
def list_clients(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Solo administradores pueden listar clientes"""
    return client_service.get_clients(db, skip, limit)


@router.get("/search", response_model=ClientOut)
def search_client(document_number: str, db: Session = Depends(get_db)):
    client = client_service.get_client_by_document(db, document_number)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.get("/{client_id}", response_model=ClientOut)
def get_client(client_id: int, db: Session = Depends(get_db)):
    client = client_service.get_client(db, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.put("/{client_id}", response_model=ClientOut)
def update_client(
    client_id: int,
    client: ClientCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Solo administradores pueden actualizar clientes"""
    updated_client = client_service.update_client(db, client_id, client.dict())
    if not updated_client:
        raise HTTPException(status_code=404, detail="Client not found")
    return updated_client


@router.delete("/{client_id}")
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Solo administradores pueden eliminar clientes"""
    success = client_service.delete_client(db, client_id)
    if not success:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"message": "Client deleted successfully"}

