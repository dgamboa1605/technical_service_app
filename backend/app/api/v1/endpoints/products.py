from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate
from app.services import product_service
from app.api.v1.endpoints.utils import get_db
from app.api.dependencies.roles import require_admin, require_employee
from app.infrastructure.db.models.user import User

router = APIRouter()


@router.post("/", response_model=ProductOut)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Solo administradores pueden crear productos"""
    return product_service.create_product(db, product.model_dump())


@router.get("/", response_model=list[ProductOut])
def list_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Solo administradores pueden listar productos"""
    return product_service.get_products(db, skip, limit)


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Solo administradores pueden actualizar productos"""
    updated_product = product_service.update_product(
        db, product_id, product.model_dump(exclude_unset=True)
    )
    if not updated_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated_product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Solo administradores pueden eliminar productos"""
    success = product_service.delete_product(db, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}
