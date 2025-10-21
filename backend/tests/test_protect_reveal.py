"""Tests for protect_reveal API routes."""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch, MagicMock

client = TestClient(app)


@pytest.fixture
def mock_client():
    """Mock ProtectRevealClient."""
    with patch('app.api.routes.protect_reveal.get_client') as mock:
        mock_instance = MagicMock()
        mock.return_value = mock_instance
        yield mock_instance


def test_health_endpoint():
    """Test protect/reveal health check."""
    response = client.get("/api/crdp/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "crdp_api_host" in data
    assert "crdp_api_port" in data
    assert "protection_policy" in data


def test_protect_success(mock_client):
    """Test successful protect request."""
    # Setup mock response
    mock_response = MagicMock()
    mock_response.is_success = True
    mock_response.status_code = 200
    mock_client.post_json.return_value = mock_response
    mock_client.extract_protected_from_protect_response.return_value = "PROTECTED_TOKEN_123"
    mock_client.policy = "P03"
    mock_client.protect_url = "http://test/protect"
    
    response = client.post(
        "/api/crdp/protect",
        json={"data": "1234567890123"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status_code"] == 200
    assert data["protected_data"] == "PROTECTED_TOKEN_123"
    assert "error" not in data or data["error"] is None


def test_protect_failure(mock_client):
    """Test protect request failure."""
    # Setup mock response for failure
    mock_response = MagicMock()
    mock_response.is_success = False
    mock_response.status_code = 400
    mock_response.body = {"error": "Invalid data"}
    mock_client.post_json.return_value = mock_response
    mock_client.policy = "P03"
    mock_client.protect_url = "http://test/protect"
    
    response = client.post(
        "/api/crdp/protect",
        json={"data": "invalid"}
    )
    
    assert response.status_code == 200  # Our wrapper returns 200 with error details
    data = response.json()
    assert data["status_code"] == 400
    assert data["error"] is not None


def test_reveal_success(mock_client):
    """Test successful reveal request."""
    # Setup mock response
    mock_response = MagicMock()
    mock_response.is_success = True
    mock_response.status_code = 200
    mock_client.post_json.return_value = mock_response
    mock_client.extract_restored_from_reveal_response.return_value = "1234567890123"
    mock_client.policy = "P03"
    mock_client.reveal_url = "http://test/reveal"
    
    response = client.post(
        "/api/crdp/reveal",
        json={
            "protected_data": "PROTECTED_TOKEN_123",
            "username": "testuser"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status_code"] == 200
    assert data["data"] == "1234567890123"
    assert "error" not in data or data["error"] is None


def test_protect_bulk_success(mock_client):
    """Test successful bulk protect request."""
    # Setup mock response
    mock_response = MagicMock()
    mock_response.is_success = True
    mock_response.status_code = 200
    mock_client.protect_bulk.return_value = mock_response
    mock_client.extract_protected_list_from_protect_response.return_value = [
        "TOKEN1", "TOKEN2", "TOKEN3"
    ]
    
    response = client.post(
        "/api/crdp/protect-bulk",
        json={"data_array": ["001", "002", "003"]}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status_code"] == 200
    assert len(data["protected_data_array"]) == 3
    assert data["protected_data_array"] == ["TOKEN1", "TOKEN2", "TOKEN3"]


def test_reveal_bulk_success(mock_client):
    """Test successful bulk reveal request."""
    # Setup mock response
    mock_response = MagicMock()
    mock_response.is_success = True
    mock_response.status_code = 200
    mock_client.reveal_bulk.return_value = mock_response
    mock_client.extract_restored_list_from_reveal_response.return_value = [
        "001", "002", "003"
    ]
    
    response = client.post(
        "/api/crdp/reveal-bulk",
        json={
            "protected_data_array": ["TOKEN1", "TOKEN2", "TOKEN3"],
            "username": "testuser"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status_code"] == 200
    assert len(data["data_array"]) == 3
    assert data["data_array"] == ["001", "002", "003"]


def test_protect_with_custom_policy(mock_client):
    """Test protect with custom policy override."""
    mock_response = MagicMock()
    mock_response.is_success = True
    mock_response.status_code = 200
    mock_client.post_json.return_value = mock_response
    mock_client.extract_protected_from_protect_response.return_value = "TOKEN"
    
    # Mock get_client to verify policy is passed
    with patch('app.api.routes.protect_reveal.get_client') as mock_get:
        mock_get.return_value = mock_client
        
        response = client.post(
            "/api/crdp/protect",
            json={
                "data": "test",
                "policy": "CUSTOM_POLICY"
            }
        )
        
        # Verify get_client was called with custom policy
        mock_get.assert_called_once_with("CUSTOM_POLICY")
        assert response.status_code == 200
