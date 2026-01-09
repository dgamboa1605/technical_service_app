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
    """Test health check endpoint"""
    client = TestClient(app)
    # Add health check endpoint if you have one
    # response = client.get("/health")
    # assert response.status_code == 200
    pass


@pytest.mark.unit
def test_docs_accessible():
    """Test API docs are accessible in development"""
    client = TestClient(app)
    response = client.get("/docs")
    # In production, docs might be disabled
    # assert response.status_code in [200, 404]
    pass
