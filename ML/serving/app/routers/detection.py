from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from serving.app.inference.preprocess_request import preprocess
from serving.app.inference.detection_infer import predict_detection

router = APIRouter(prefix="/predict", tags=["Detection"])

class DetectionRequest(BaseModel):
    region: Optional[str] = Field(None, description="Region identifier (e.g. bay_of_bengal, arabian_sea)")
    image_base64: Optional[str] = Field(None, description="Base64 encoded frame")

class DetectionResponse(BaseModel):
    region: Optional[str]
    system_detected: bool
    estimated_wind_kmh: float
    confidence: float
    model_version: str

@router.post("/detection", response_model=DetectionResponse)
def detect_system(req: DetectionRequest):
    try:
        tensor = preprocess(req.image_base64)
        result = predict_detection(tensor)
        return DetectionResponse(
            region=req.region,
            **result
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection inference error: {str(e)}")
