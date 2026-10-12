"""FastAPI application entry point for Urban Flood Risk Prediction System."""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.api.areas import router as areas_router
from backend.app.api.drift import router as drift_router
from backend.app.api.health import router as health_router
from backend.app.api.ingestion import router as ingestion_router
from backend.app.api.metrics import router as metrics_router
from backend.app.api.predictions import router as predictions_router
from backend.app.core.config import settings
from backend.app.core.logging_config import get_app_logger
from backend.app.services.area_service import AreaService
from backend.app.services.model_service import ModelService

logger = get_app_logger("backend.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    logger.info(f"Starting {settings.PROJECT_NAME} (Env: {settings.ENVIRONMENT})...")
    # Preload ModelService and AreaService
    model_service = ModelService.get_instance()
    area_service = AreaService.get_instance()
    logger.info(
        f"Initialization complete. Model Loaded: {model_service.is_loaded}, "
        f"Areas Cached: {len(area_service.areas_cache)}"
    )
    yield
    logger.info("Shutting down service...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Educational decision-support prototype that estimates relative urban flood "
        "risk across Mumbai pilot study locations using topography, drainage, and rainfall features."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception at {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": "An internal server error occurred."},
    )

# Root endpoint
@app.get("/", tags=["Overview"])
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "pilot_region": "Greater Mumbai (Mithi River Basin & Hotspots)",
        "docs_url": "/docs",
        "health_check": "/health",
        "sdgs": ["SDG 11: Sustainable Cities", "SDG 13: Climate Action"],
        "disclaimer": (
            "Educational decision-support prototype only. Not an official early-warning "
            "service and must not be used as the sole basis for emergency decisions."
        ),
    }

# Register Routers
app.include_router(health_router)
app.include_router(predictions_router, prefix=settings.API_PREFIX)
app.include_router(metrics_router, prefix=settings.API_PREFIX)
app.include_router(areas_router, prefix=settings.API_PREFIX)
app.include_router(ingestion_router, prefix=settings.API_PREFIX)
app.include_router(drift_router, prefix=settings.API_PREFIX)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
