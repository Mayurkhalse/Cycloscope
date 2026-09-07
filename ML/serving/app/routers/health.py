from fastapi import APIRouter
from fastapi.responses import JSONResponse

from serving.app.schemas.responses import HealthStatusResponse
from serving.app.models.model_loader import get_intensity_model

router = APIRouter()

@router.get("/health", response_model=HealthStatusResponse)
def health_check():
    """
    Polled by Node.js backend circuit breaker to verify ML service status.
    Returns status 200 'ok' if models are loaded, or 503 if degraded.
    """
    try:
        model, metadata = get_intensity_model(version="v0.1")
        model_name = metadata.get("model_name", "intensity_regressor")
        version = metadata.get("version", "v0.1")
        return HealthStatusResponse(
            status="ok",
            models_loaded=[f"{model_name}:{version}"]
        )
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "degraded", "error": str(e), "models_loaded": []}
        )
