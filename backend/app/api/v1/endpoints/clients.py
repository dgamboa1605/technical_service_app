from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.client import ClientCreate, ClientOut
from app.services import client_service
from app.api.v1.endpoints.utils import get_db
from app.api.dependencies.roles import require_employee
from app.infrastructure.db.models.user import User

router = APIRouter()


@router.post("/", response_model=ClientOut)
def create_client(
    client: ClientCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_employee),
):
    return client_service.create_client(db, client.name, client.phone)


@router.get("/", response_model=list[ClientOut])
def list_clients(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_employee),
):
    return client_service.get_clients(db, skip, limit)
