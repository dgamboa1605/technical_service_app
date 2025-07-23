from fastapi import APIRouter
from app.api.v1.endpoints import users, clients, products, work_orders, auth

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(clients.router, prefix="/clients", tags=["Clients"])
api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(work_orders.router, prefix="/work-orders", tags=["Work Orders"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
