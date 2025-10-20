# Backend (FastAPI)

## Features
- FastAPI with automatic OpenAPI/Swagger UI
- JWT auth (OAuth2 password flow)
- CORS configured for Vite dev server
- Items demo API (protected)

## Endpoints
- `GET /health` – health check
- `POST /api/auth/login` – form fields: username, password; returns JWT
- `GET /api/auth/me` – requires `Authorization: Bearer <token>`
- `GET /api/items` – protected demo list
- Swagger UI: `/docs`  | ReDoc: `/redoc`

## Setup
1. Create virtualenv (optional) and install deps:
```
pip3 install -r requirements.txt
```
2. Create `.env` from example and adjust:
```
cp .env.example .env
```
3. Run dev server:
```
uvicorn app.main:app --reload --port 8000
```

## Tests
```
pytest -q
```

## CRDP Protect integration

New endpoints:
- `POST /api/protect` → external CRDP Protect API
- `POST /api/reveal` → external CRDP Reveal API

Optional JSON body to override (protect):

```
{
	"host": "192.168.0.231",
	"port": 32082,
	"policy": "P03",
	"data": "1234567890123"
}
```

Environment variables (backend/.env):

```
CRDP_API_HOST=192.168.0.231
CRDP_API_PORT=32082
CRDP_PROTECTION_POLICY=P03
CRDP_SAMPLE_DATA=1234567890123
```

Reveal body example:

```
{
	"host": "192.168.0.231",
	"port": 32082,
	"policy": "P03",
	"protected_data": "<protected string>",
	"username": "user1",            // optional
	"external_version": "1001002"   // optional
}
```
