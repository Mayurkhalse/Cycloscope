from pydantic import BaseModel, Field
from typing import List, Optional

class IntensityPredictionResponse(BaseModel):
    cyclone_id: Optional[str] = Field(None, description="Identifier of the cyclone system")
    category: str = Field(..., description="Official IMD cyclone intensity category")
    wind_speed_kmh: float = Field(..., description="Estimated maximum sustained wind speed in km/h")
    confidence: float = Field(..., description="Model confidence score between 0.0 and 1.0")
    model_version: str = Field(..., description="Exported model artifact version")

class HealthStatusResponse(BaseModel):
    status: str = Field(..., description="Health status ('ok' or 'degraded')")
    models_loaded: List[str] = Field(..., description="List of currently loaded model names and versions")

class RegionalScanResult(BaseModel):
    region: str = Field(..., description="Scanning region name (bay_of_bengal or arabian_sea)")
    system_detected: bool = Field(..., description="Whether a tropical disturbance is detected")
    confidence: float = Field(..., description="Detection confidence score")
