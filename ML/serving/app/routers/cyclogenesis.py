import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

ML_ROOT = Path(__file__).resolve().parents[3]
sys.path.append(str(ML_ROOT))

from serving.app.inference.cyclogenesis_infer import predict_cyclogenesis_risk

router = APIRouter(prefix="/predict", tags=["Cyclogenesis"])

class CyclogenesisRequest(BaseModel):
    region: str = Field(..., description="Ocean basin name (bay_of_bengal or arabian_sea)")
    sea_surface_temp_c: Optional[float] = Field(28.5, description="Sea Surface Temperature in Celsius")
    vertical_wind_shear_knots: Optional[float] = Field(12.0, description="Vertical wind shear in knots")
    mid_troposphere_rh: Optional[float] = Field(70.0, description="Mid-troposphere relative humidity %")
    vorticity_850hpa: Optional[float] = Field(6.5, description="Low-level relative vorticity")
    sea_level_pressure_hpa: Optional[float] = Field(1006.0, description="Mean Sea Level Pressure in hPa")

class CyclogenesisResponse(BaseModel):
    region: str
    probability_48h: float
    genesis_risk_level: str
    dominant_factor: str
    model_version: str
    model_type: Optional[str] = "Calibrated Random Forest"
    environmental_inputs: Optional[Dict[str, Any]] = None

@router.post("/cyclogenesis", response_model=CyclogenesisResponse)
def estimate_cyclogenesis_risk(req: CyclogenesisRequest):
    """
    Estimates 48-hour cyclogenesis probability using trained Machine Learning Random Forest model.
    """
    try:
        res = predict_cyclogenesis_risk(
            region=req.region,
            sea_surface_temp_c=req.sea_surface_temp_c,
            vertical_wind_shear_knots=req.vertical_wind_shear_knots,
            mid_troposphere_rh=req.mid_troposphere_rh,
            vorticity_850hpa=req.vorticity_850hpa,
            sea_level_pressure_hpa=req.sea_level_pressure_hpa
        )
        return CyclogenesisResponse(
            region=res["region"],
            probability_48h=res["probability_48h"],
            genesis_risk_level=res["genesis_risk_level"],
            dominant_factor=res["dominant_factor"],
            model_version=res["model_version"],
            model_type=res.get("model_type"),
            environmental_inputs=res.get("environmental_inputs")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cyclogenesis calculation error: {str(e)}")

