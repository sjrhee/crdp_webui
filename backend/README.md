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
