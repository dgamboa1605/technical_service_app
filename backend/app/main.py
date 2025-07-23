from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from app.api.v1.api import api_router

# from app.infrastructure.db.base import Base
# from app.infrastructure.db.session import engine

app = FastAPI(title="Technical Service Web App")

# Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return RedirectResponse(url="/docs")


app.include_router(api_router, prefix="/api/v1")
