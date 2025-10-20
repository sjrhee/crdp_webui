from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.core.security import get_current_user
from app.models.schemas import Item
from app.core.config import settings
import httpx

router = APIRouter()

_fake_items = [
    Item(id=1, name="Foo", description="A foo item"),
    Item(id=2, name="Bar", description="A bar item"),
]

@router.get("/items", response_model=List[Item])
async def list_items(current_user: str = Depends(get_current_user)):
    return _fake_items


@router.post("/protect")
async def protect(
    body: Dict[str, Any] | None = None,
    current_user: str = Depends(get_current_user),
):
    host = settings.CRDP_API_HOST
    port = settings.CRDP_API_PORT
    policy = settings.CRDP_PROTECTION_POLICY
    data = settings.CRDP_SAMPLE_DATA

    # allow override via request body
    if body:
        host = body.get("host", host)
        port = int(body.get("port", port))
        policy = body.get("policy", policy)
        data = body.get("data", data)

    url = f"http://{host}:{port}/v1/protect"
    req_json = {"protection_policy_name": policy, "data": data}

    async with httpx.AsyncClient(timeout=10) as client:
        try:
            resp = await client.post(url, json=req_json)
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"CRDP connect error: {str(e)}")

    result = {
        "request": {
            "url": url,
            "headers": {"content-type": "application/json"},
            "body": req_json,
        },
        "status": resp.status_code,
        "response": None,
    }

    # parse response JSON if available
    try:
        result["response"] = resp.json()
    except Exception:
        result["response"] = {"text": resp.text}

    if resp.status_code >= 400:
        raise HTTPException(status_code=resp.status_code, detail=result)

    return result


@router.post("/reveal")
async def reveal(
    body: Dict[str, Any] | None = None,
    current_user: str = Depends(get_current_user),
):
    host = settings.CRDP_API_HOST
    port = settings.CRDP_API_PORT
    policy = settings.CRDP_PROTECTION_POLICY

    protected_data: str | None = None
    username: str | None = None
    external_version: str | None = None

    if body:
        host = body.get("host", host)
        port = int(body.get("port", port))
        policy = body.get("policy", policy)
        protected_data = body.get("protected_data", protected_data)
        username = body.get("username", username)
        external_version = body.get("external_version", external_version)

    if not protected_data:
        raise HTTPException(status_code=400, detail="'protected_data' is required")

    url = f"http://{host}:{port}/v1/reveal"
    req_json: Dict[str, Any] = {"protection_policy_name": policy, "protected_data": protected_data}
    if username:
        req_json["username"] = username
    if external_version:
        req_json["external_version"] = external_version

    async with httpx.AsyncClient(timeout=10) as client:
        try:
            resp = await client.post(url, json=req_json)
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"CRDP connect error: {str(e)}")

    result = {
        "request": {
            "url": url,
            "headers": {"content-type": "application/json"},
            "body": req_json,
        },
        "status": resp.status_code,
        "response": None,
    }

    try:
        result["response"] = resp.json()
    except Exception:
        result["response"] = {"text": resp.text}

    if resp.status_code >= 400:
        raise HTTPException(status_code=resp.status_code, detail=result)

    return result
