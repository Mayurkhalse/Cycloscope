import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

ML_ROOT = Path(__file__).resolve().parents[3]
sys.path.append(str(ML_ROOT))

from serving.app.inference.track_infer import predict_storm_track

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
    Produces multi-horizon forecast points along the projected cyclone trajectory using PyTorch TrackForecaster.
    """
    try:
        res = predict_storm_track(
            cyclone_id=req.cyclone_id,
            current_lat=req.current_lat,
            current_lon=req.current_lon,
            current_wind_kmh=req.current_wind_kmh or 65.0,
            mode="live"
        )
        
        forecast_pts = [
            TrackPointForecast(
                lead_time_hours=pt["lead_time_hours"],
                lat=pt["lat"],
                lon=pt["lon"],
                wind_speed_kmh=pt["wind_speed_kmh"]
            )
            for pt in res["forecast"]
        ]
        
        return TrackPredictionResponse(
            cyclone_id=req.cyclone_id,
            forecast=forecast_pts,
            model_version=res["model_version"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Track prediction error: {str(e)}")

