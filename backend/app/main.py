from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes.auth import router as auth_router
from app.api.routes.items import router as items_router
from app.api.routes.protect_reveal import router as protect_reveal_router

app = FastAPI(title=settings.APP_NAME)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

# Routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(items_router, prefix="/api", tags=["items"])
app.include_router(protect_reveal_router, prefix="/api/crdp", tags=["protect-reveal"])
