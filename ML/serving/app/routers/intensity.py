from fastapi import APIRouter, HTTPException
from serving.app.schemas.requests import IntensityPredictionRequest
from serving.app.schemas.responses import IntensityPredictionResponse
from serving.app.inference.intensity_infer import predict_intensity

router = APIRouter()

@router.post("/predict/intensity", response_model=IntensityPredictionResponse)
def predict_cyclone_intensity(req: IntensityPredictionRequest):
    """
    Predicts cyclone intensity (wind speed in km/h & IMD category) from input image tensor.
    """
    try:
        wind_kmh, category, confidence, version = predict_intensity(
            image_base64=req.image_base64,
            channel=req.channel
        )
        return IntensityPredictionResponse(
            cyclone_id=req.cyclone_id,
            category=category,
            wind_speed_kmh=wind_kmh,
            confidence=confidence,
            model_version=version
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Intensity inference error: {str(e)}"
        )
