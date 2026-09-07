from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

router = APIRouter(prefix="/predict", tags=["Cyclogenesis"])

class CyclogenesisRequest(BaseModel):
    region: str = Field(..., description="Ocean basin name (bay_of_bengal or arabian_sea)")
    sea_surface_temp_c: Optional[float] = Field(28.5, description="Sea Surface Temperature in Celsius")
    vertical_wind_shear_knots: Optional[float] = Field(12.0, description="Vertical wind shear in knots")
    mid_troposphere_rh: Optional[float] = Field(70.0, description="Mid-troposphere relative humidity %")

class CyclogenesisResponse(BaseModel):
    region: str
    probability_48h: float
    genesis_risk_level: str
    dominant_factor: str
    model_version: str

@router.post("/cyclogenesis", response_model=CyclogenesisResponse)
def estimate_cyclogenesis_risk(req: CyclogenesisRequest):
    """
    Estimates 48-hour cyclogenesis probability based on regional environmental indicators.
    """
    try:
        # Favorable genesis conditions: SST > 26.5°C, Shear < 20 kts, RH > 60%
        score = 0.0
        if (req.sea_surface_temp_c or 28.5) >= 28.0:
            score += 0.35
        if (req.vertical_wind_shear_knots or 12.0) <= 15.0:
            score += 0.35
        if (req.mid_troposphere_rh or 70.0) >= 65.0:
            score += 0.30
            
        prob = round(min(0.95, max(0.05, score)), 2)
        
        if prob >= 0.70:
            risk = "HIGH"
            factor = "High Sea Surface Temperature & Low Vertical Wind Shear"
        elif prob >= 0.40:
            risk = "MODERATE"
            factor = "Marginal atmospheric moisture"
        else:
            risk = "LOW"
            factor = "Unfavorable vertical wind shear"
            
        return CyclogenesisResponse(
            region=req.region,
            probability_48h=prob,
            genesis_risk_level=risk,
            dominant_factor=factor,
            model_version="v0.1"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cyclogenesis calculation error: {str(e)}")
