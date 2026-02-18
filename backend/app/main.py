import logging

from fastapi import FastAPI, Request, status
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.domain.exceptions import InvalidCredentials, NotFoundError

logger = logging.getLogger(__name__)

logging.basicConfig(
    level=logging.INFO if settings.is_production else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
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

# If "*" is in origins, allow all origins (for testing from different networks)
if "*" in origins:
    allow_origins = ["*"]
    allow_credentials = False  # Cannot use credentials with allow_origins=["*"]
else:
    allow_origins = origins
    allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=allow_credentials,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

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
    
    logger.warning("Validation error on %s: %s", request.url.path, error_details)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": error_details},
    )


@app.exception_handler(InvalidCredentials)
async def invalid_credentials_handler(request: Request, exc: InvalidCredentials):
    """Map domain auth failure to 401."""
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": str(exc) or "Invalid credentials"},
    )


@app.exception_handler(NotFoundError)
async def not_found_handler(request: Request, exc: NotFoundError):
    """Map domain resource-not-found to 404."""
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": str(exc) or "Resource not found"},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Catch-all: log and return generic 500. Avoids leaking stack traces to clients."""
    logger.exception(
        "Unhandled exception on %s %s: %s",
        request.method,
        request.url.path,
        exc,
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


@app.get("/")
def root():
    return RedirectResponse(url="/docs")


app.include_router(api_router, prefix="/api/v1")
