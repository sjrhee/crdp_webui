"""Protect/Reveal API routes."""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from app.services.protect_reveal.client import ProtectRevealClient, APIError
from app.core.config import get_settings

router = APIRouter()


class ProtectRequest(BaseModel):
    """Single item protect request."""
    data: str = Field(..., description="Data to protect")
    policy: Optional[str] = Field(None, description="Protection policy name (overrides default)")
    host: Optional[str] = Field(None, description="CRDP server host (overrides default)")
    port: Optional[int] = Field(None, description="CRDP server port (overrides default)")


class RevealRequest(BaseModel):
    """Single item reveal request."""
    protected_data: str = Field(..., description="Protected token to reveal")
    policy: Optional[str] = Field(None, description="Protection policy name (overrides default)")
    username: Optional[str] = Field(None, description="Username for audit trail")
    host: Optional[str] = Field(None, description="CRDP server host (overrides default)")
    port: Optional[int] = Field(None, description="CRDP server port (overrides default)")


class ProtectBulkRequest(BaseModel):
    """Bulk protect request."""
    data_array: List[str] = Field(..., description="Array of data to protect")
    policy: Optional[str] = Field(None, description="Protection policy name (overrides default)")
    host: Optional[str] = Field(None, description="CRDP server host (overrides default)")
    port: Optional[int] = Field(None, description="CRDP server port (overrides default)")


class RevealBulkRequest(BaseModel):
    """Bulk reveal request."""
    protected_data_array: List[str] = Field(..., description="Array of protected tokens to reveal")
    policy: Optional[str] = Field(None, description="Protection policy name (overrides default)")
    username: Optional[str] = Field(None, description="Username for audit trail")
    host: Optional[str] = Field(None, description="CRDP server host (overrides default)")
    port: Optional[int] = Field(None, description="CRDP server port (overrides default)")


class ProtectResponse(BaseModel):
    """Protect response."""
    status_code: int
    protected_data: Optional[str] = None
    error: Optional[str] = None


class RevealResponse(BaseModel):
    """Reveal response."""
    status_code: int
    data: Optional[str] = None
    error: Optional[str] = None


class ProtectBulkResponse(BaseModel):
    """Bulk protect response."""
    status_code: int
    protected_data_array: Optional[List[str]] = None
    error: Optional[str] = None


class RevealBulkResponse(BaseModel):
    """Bulk reveal response."""
    status_code: int
    data_array: Optional[List[str]] = None
    error: Optional[str] = None


def get_client(policy: Optional[str] = None, host: Optional[str] = None, port: Optional[int] = None) -> ProtectRevealClient:
    """Create ProtectRevealClient with settings."""
    settings = get_settings()
    return ProtectRevealClient(
        host=host or settings.CRDP_API_HOST,
        port=port or settings.CRDP_API_PORT,
        policy=policy or settings.CRDP_PROTECTION_POLICY,
        timeout=10
    )


def _build_client(policy: Optional[str], host: Optional[str], port: Optional[int]) -> ProtectRevealClient:
    """Helper to preserve call signature used in tests: when host/port are not provided,
    call get_client with only the policy positional argument (so mocks expecting
    get_client('CUSTOM_POLICY') still pass)."""
    if host is None and port is None:
        return get_client(policy)
    return get_client(policy, host, port)


@router.post("/protect", response_model=ProtectResponse, tags=["Protect/Reveal"])
async def protect_data(request: ProtectRequest):
    """
    Protect a single data item.
    
    Returns a protected token that can be later revealed.
    """
    client = _build_client(request.policy, request.host, request.port)
    
    payload = {
        "protection_policy_name": client.policy,
        "data": request.data,
    }
    
    try:
        response = client.post_json(client.protect_url, payload)
        
        if not response.is_success:
            return ProtectResponse(
                status_code=response.status_code or 500,
                error=str(response.body) if response.body else "Protect failed"
            )
        
        protected_token = client.extract_protected_from_protect_response(response)
        
        return ProtectResponse(
            status_code=response.status_code or 200,
            protected_data=protected_token
        )
        
    except APIError as e:
        raise HTTPException(status_code=e.status_code or 500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@router.post("/reveal", response_model=RevealResponse, tags=["Protect/Reveal"])
async def reveal_data(request: RevealRequest):
    """
    Reveal a protected token back to original data.
    
    Optionally include username for audit trail.
    """
    client = _build_client(request.policy, request.host, request.port)
    
    payload = {
        "protection_policy_name": client.policy,
        "protected_data": request.protected_data,
    }
    if request.username:
        payload["username"] = request.username
    
    try:
        response = client.post_json(client.reveal_url, payload)
        
        if not response.is_success:
            return RevealResponse(
                status_code=response.status_code or 500,
                error=str(response.body) if response.body else "Reveal failed"
            )
        
        restored = client.extract_restored_from_reveal_response(response)
        
        return RevealResponse(
            status_code=response.status_code or 200,
            data=restored
        )
        
    except APIError as e:
        raise HTTPException(status_code=e.status_code or 500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@router.post("/protect-bulk", response_model=ProtectBulkResponse, tags=["Protect/Reveal"])
async def protect_bulk(request: ProtectBulkRequest):
    """
    Protect multiple data items in a single request.
    
    More efficient than multiple individual protect calls.
    """
    client = _build_client(request.policy, request.host, request.port)
    
    try:
        response = client.protect_bulk(request.data_array)
        
        if not response.is_success:
            return ProtectBulkResponse(
                status_code=response.status_code or 500,
                error=str(response.body) if response.body else "Bulk protect failed"
            )
        
        protected_tokens = client.extract_protected_list_from_protect_response(response)
        
        return ProtectBulkResponse(
            status_code=response.status_code or 200,
            protected_data_array=protected_tokens
        )
        
    except APIError as e:
        raise HTTPException(status_code=e.status_code or 500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@router.post("/reveal-bulk", response_model=RevealBulkResponse, tags=["Protect/Reveal"])
async def reveal_bulk(request: RevealBulkRequest):
    """
    Reveal multiple protected tokens in a single request.
    
    More efficient than multiple individual reveal calls.
    Optionally include username for audit trail.
    """
    client = _build_client(request.policy, request.host, request.port)
    
    try:
        response = client.reveal_bulk(request.protected_data_array, username=request.username)
        
        if not response.is_success:
            return RevealBulkResponse(
                status_code=response.status_code or 500,
                error=str(response.body) if response.body else "Bulk reveal failed"
            )
        
        restored_data = client.extract_restored_list_from_reveal_response(response)
        
        return RevealBulkResponse(
            status_code=response.status_code or 200,
            data_array=restored_data
        )
        
    except APIError as e:
        raise HTTPException(status_code=e.status_code or 500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@router.get("/health", tags=["Protect/Reveal"])
async def health_check():
    """
    Health check endpoint for Protect/Reveal service.
    
    Verifies connection to CRDP API server.
    """
    settings = get_settings()
    
    return {
        "status": "healthy",
        "crdp_api_host": settings.CRDP_API_HOST,
        "crdp_api_port": settings.CRDP_API_PORT,
        "protection_policy": settings.CRDP_PROTECTION_POLICY
    }
