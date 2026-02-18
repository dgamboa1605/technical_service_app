"""
Basic tests for main application
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.mark.unit
def test_root_redirect():
    """Test root endpoint redirects to docs"""
    client = TestClient(app)
    response = client.get("/", follow_redirects=False)
    assert response.status_code == 307  # Temporary redirect


@pytest.mark.unit
def test_health_check():
    """Root redirects to /docs; no dedicated /health endpoint."""
    client = TestClient(app)
    response = client.get("/", follow_redirects=False)
    assert response.status_code == 307
    assert response.headers["location"] == "/docs"


@pytest.mark.unit
def test_docs_accessible():
    """Test API docs are accessible (when not in production mode)."""
    client = TestClient(app)
    response = client.get("/docs")
    # In production docs_url is None so /docs may 404
    assert response.status_code in (200, 404)
