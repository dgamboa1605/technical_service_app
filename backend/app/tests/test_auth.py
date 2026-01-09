"""
Tests for authentication endpoints
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.mark.unit
def test_login_endpoint_exists():
    """Test login endpoint exists"""
    client = TestClient(app)
    response = client.post("/api/v1/auth/login", data={
        "username": "test",
        "password": "test"
    })
    # Should return 200 (success) or 401 (unauthorized), not 404
    assert response.status_code != 404


@pytest.mark.integration
def test_login_with_invalid_credentials(client):
    """Test login with invalid credentials"""
    response = client.post("/api/v1/auth/login", data={
        "username": "invalid",
        "password": "invalid"
    })
    assert response.status_code == 401


@pytest.mark.integration
def test_get_current_user_without_token(client):
    """Test getting current user without token"""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
