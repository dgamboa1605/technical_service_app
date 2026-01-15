from fastapi import FastAPI, Request, status
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.api.v1.api import api_router
from app.core.config import settings
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO if settings.is_production else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = FastAPI(
    title="Technical Service Web App",
    description="API para gestión de órdenes de servicio técnico",
    version="1.0.0",
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
)

# CORS Configuration
origins = settings.cors_origins_list if settings.cors_origins_list else ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Trusted Host Middleware (only in production)
# Comentado para permitir acceso por IP
# if settings.is_production:
#     app.add_middleware(
#         TrustedHostMiddleware,
#         allowed_hosts=["technical-service.duckdns.org", "www.technical-service.duckdns.org", "*.duckdns.org"]
#     )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Custom handler for validation errors.
    """
    errors = exc.errors()
    error_details = []
    for error in errors:
        error_details.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"],
            "input": error.get("input")
        })
    
    logging.error(f"Validation error on {request.url.path}: {error_details}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": error_details
        }
    )

@app.get("/")
def root():
    return RedirectResponse(url="/docs")


app.include_router(api_router, prefix="/api/v1")
