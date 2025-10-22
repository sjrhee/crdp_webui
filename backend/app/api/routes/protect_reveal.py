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
    debug: Optional[Dict[str, Any]] = None


class RevealResponse(BaseModel):
    """Reveal response."""
    status_code: int
    data: Optional[str] = None
    error: Optional[str] = None
    debug: Optional[Dict[str, Any]] = None


class ProtectBulkResponse(BaseModel):
    """Bulk protect response."""
    status_code: int
    protected_data_array: Optional[List[str]] = None
    error: Optional[str] = None
    debug: Optional[Dict[str, Any]] = None


class RevealBulkResponse(BaseModel):
    """Bulk reveal response."""
    status_code: int
    data_array: Optional[List[str]] = None
    error: Optional[str] = None
    debug: Optional[Dict[str, Any]] = None


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
        
        debug = {
            "url": response.request_url,
            "request": payload,
            "status_code": response.status_code,
            "response": response.body,
            "headers": response.request_headers,
        }

        if not response.is_success:
            return ProtectResponse(
                status_code=response.status_code or 500,
                error=str(response.body) if response.body else "Protect failed",
                debug=debug,
            )
        
        protected_token = client.extract_protected_from_protect_response(response)
        
        return ProtectResponse(
            status_code=response.status_code or 200,
            protected_data=protected_token,
            debug=debug,
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
        
        debug = {
            "url": response.request_url,
            "request": payload,
            "status_code": response.status_code,
            "response": response.body,
            "headers": response.request_headers,
        }

        if not response.is_success:
            return RevealResponse(
                status_code=response.status_code or 500,
                error=str(response.body) if response.body else "Reveal failed",
                debug=debug,
            )
        
        restored = client.extract_restored_from_reveal_response(response)
        
        return RevealResponse(
            status_code=response.status_code or 200,
            data=restored,
            debug=debug,
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
        
        debug = {
            "url": response.request_url,
            "request": {"protection_policy_name": client.policy, "data_array": request.data_array},
            "status_code": response.status_code,
            "response": response.body,
            "headers": response.request_headers,
        }

        if not response.is_success:
            return ProtectBulkResponse(
                status_code=response.status_code or 500,
                error=str(response.body) if response.body else "Bulk protect failed",
                debug=debug,
            )
        
        protected_tokens = client.extract_protected_list_from_protect_response(response)
        
        return ProtectBulkResponse(
            status_code=response.status_code or 200,
            protected_data_array=protected_tokens,
            debug=debug,
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
        
        debug = {
            "url": response.request_url,
            "request": {"protection_policy_name": client.policy, "protected_data_array": request.protected_data_array, **({"username": request.username} if request.username else {})},
            "status_code": response.status_code,
            "response": response.body,
            "headers": response.request_headers,
        }

        if not response.is_success:
            return RevealBulkResponse(
                status_code=response.status_code or 500,
                error=str(response.body) if response.body else "Bulk reveal failed",
                debug=debug,
            )
        
        restored_data = client.extract_restored_list_from_reveal_response(response)
        
        return RevealBulkResponse(
            status_code=response.status_code or 200,
            data_array=restored_data,
            debug=debug,
        )
        
    except APIError as e:
        raise HTTPException(status_code=e.status_code or 500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@router.get("/health", tags=["Protect/Reveal"])
async def health_check(policy: Optional[str] = None, host: Optional[str] = None, port: Optional[int] = None, healthz_port: Optional[int] = None):
    """
    Health check endpoint.

    - Attempts a lightweight CRDP call (protect with sample data) to verify connectivity.
    - Returns debug steps so the UI can show a progress log.
    - Accepts optional overrides via query params: policy, host, port.
    """
    settings = get_settings()

    # Build client with possible overrides
    client = ProtectRevealClient(
        host=host or settings.CRDP_API_HOST,
        port=port or settings.CRDP_API_PORT,  # protect/reveal port
        policy=policy or settings.CRDP_PROTECTION_POLICY,
        timeout=5,
        healthz_port=healthz_port or getattr(settings, "CRDP_HEALTHZ_PORT", None),  # healthz port (defaults to settings)
    )

    steps: list[dict] = []

    # Step 1: CRDP healthz (GET)
    try:
        resp = client.healthz()
        steps.append({
            "stage": "healthz",
            "method": "GET",
            "url": resp.request_url,
            "status_code": resp.status_code,
            "response": resp.body,
            "headers": resp.request_headers,
        })
        ok_get = resp.is_success
    except Exception as e:
        steps.append({"stage": "healthz", "method": "GET", "error": str(e)})
        ok_get = False

    # Step 2: minimal protect sample (POST) for additional verification
    sample = getattr(settings, "CRDP_SAMPLE_DATA", "1234567890123")
    payload = {"protection_policy_name": client.policy, "data": sample}
    try:
        resp2 = client.post_json(client.protect_url, payload)
        steps.append({
            "stage": "protect_sample",
            "method": "POST",
            "url": resp2.request_url,
            "request": payload,
            "status_code": resp2.status_code,
            "response": resp2.body,
            "headers": resp2.request_headers,
        })
        ok_post = resp2.is_success
    except Exception as e:
        steps.append({"stage": "protect_sample", "method": "POST", "error": str(e)})
        ok_post = False

    status = "healthy" if ok_get else "unhealthy"

    return {
        "status": status,
        "crdp_api_host": client.host,
        "crdp_api_port": port or settings.CRDP_API_PORT,
        "healthz_port": healthz_port or getattr(settings, "CRDP_HEALTHZ_PORT", None),
        "protection_policy": client.policy,
        "steps": steps,
    }
