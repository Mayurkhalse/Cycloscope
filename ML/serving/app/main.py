import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add ML root to path
ML_ROOT = Path(__file__).resolve().parents[2]
sys.path.append(str(ML_ROOT))

from serving.app.core.config import settings
from serving.app.core.logging import logger
from serving.app.routers import health, intensity, detection, track, cyclogenesis, live
from serving.app.models.model_loader import get_intensity_model

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Cyclone Scope ML Microservice providing detection, intensity estimation, track forecasting, and cyclogenesis prediction.",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all sub-routers
app.include_router(health.router)
app.include_router(intensity.router)
app.include_router(detection.router)
app.include_router(track.router)
app.include_router(cyclogenesis.router)
app.include_router(live.router)

@app.on_event("startup")
def startup_event():
    """
    Preloads ML model artifact into memory during app startup.
    """
    try:
        get_intensity_model(version=settings.MODEL_VERSION)
        logger.info(f"ML Service successfully preloaded model artifact ({settings.MODEL_VERSION}).")
    except Exception as e:
        logger.warning(f"Could not preload model on startup ({e}). Models will load on first request.")

@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
