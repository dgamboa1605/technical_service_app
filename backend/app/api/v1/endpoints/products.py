from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.product import ProductCreate, ProductOut
from app.services import product_service
from app.api.v1.endpoints.utils import get_db
from app.api.dependencies.roles import require_employee
from app.infrastructure.db.models.user import User

router = APIRouter()


@router.post("/", response_model=ProductOut)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_employee),
):
    return product_service.create_product(db, product.dict())


@router.get("/", response_model=list[ProductOut])
def list_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_employee),
):
    return product_service.get_products(db, skip, limit)
