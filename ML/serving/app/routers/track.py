from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

router = APIRouter(prefix="/predict", tags=["Track Forecasting"])

class TrackPredictionRequest(BaseModel):
    cyclone_id: str = Field(..., description="Unique storm identifier")
    current_lat: float = Field(..., description="Current latitude")
    current_lon: float = Field(..., description="Current longitude")
    current_wind_kmh: Optional[float] = Field(65.0, description="Current estimated wind speed")

class TrackPointForecast(BaseModel):
    lead_time_hours: int
    lat: float
    lon: float
    wind_speed_kmh: float

class TrackPredictionResponse(BaseModel):
    cyclone_id: str
    forecast: List[TrackPointForecast]
    model_version: str

@router.post("/track", response_model=TrackPredictionResponse)
def predict_track(req: TrackPredictionRequest):
    """
    Produces +6h, +12h, and +24h forecast points along the projected cyclone trajectory.
    """
    try:
        # Extrapolates storm progression with north-westward bias typical for North Indian Ocean
        forecast = [
            TrackPointForecast(
                lead_time_hours=6,
                lat=round(req.current_lat + 0.35, 2),
                lon=round(req.current_lon - 0.25, 2),
                wind_speed_kmh=round(req.current_wind_kmh + 2.0, 1)
            ),
            TrackPointForecast(
                lead_time_hours=12,
                lat=round(req.current_lat + 0.70, 2),
                lon=round(req.current_lon - 0.55, 2),
                wind_speed_kmh=round(max(0.0, req.current_wind_kmh - 5.0), 1)
            ),
            TrackPointForecast(
                lead_time_hours=24,
                lat=round(req.current_lat + 1.45, 2),
                lon=round(req.current_lon - 1.15, 2),
                wind_speed_kmh=round(max(0.0, req.current_wind_kmh - 20.0), 1)
            )
        ]
        return TrackPredictionResponse(
            cyclone_id=req.cyclone_id,
            forecast=forecast,
            model_version="v0.1"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Track prediction error: {str(e)}")
