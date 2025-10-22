import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging import setup_logging
from app.core.exceptions import CRDPConnectionError, CRDPAPIError, CRDPTimeoutError
from app.api.routes.protect_reveal import router as protect_reveal_router

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.APP_NAME)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(CRDPConnectionError)
async def crdp_connection_error_handler(request: Request, exc: CRDPConnectionError):
    logger.error(f"CRDP connection error: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": "CRDP Connection Error", "detail": exc.detail}
    )

@app.exception_handler(CRDPAPIError)
async def crdp_api_error_handler(request: Request, exc: CRDPAPIError):
    logger.error(f"CRDP API error: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": "CRDP API Error", "detail": exc.detail}
    )

@app.exception_handler(CRDPTimeoutError)
async def crdp_timeout_error_handler(request: Request, exc: CRDPTimeoutError):
    logger.error(f"CRDP timeout error: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": "CRDP Timeout Error", "detail": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "detail": "An unexpected error occurred"}
    )

@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.APP_NAME}")
    logger.info(f"CORS origins: {settings.CORS_ORIGINS}")
    logger.info(f"CRDP API: {settings.CRDP_API_HOST}:{settings.CRDP_API_PORT}")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info(f"Shutting down {settings.APP_NAME}")

@app.get("/health")
async def health():
    logger.debug("Health check requested")
    return {"status": "ok"}

# Routers (only Protect/Reveal)
app.include_router(protect_reveal_router, prefix="/api/crdp", tags=["protect-reveal"])
