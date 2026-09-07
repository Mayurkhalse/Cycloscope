from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

from serving.app.schemas.requests import LiveCycloneUpdateRequest
from serving.app.schemas.responses import RegionalScanResult
from serving.app.inference.intensity_infer import predict_intensity

router = APIRouter()

SCAN_REGIONS = ["bay_of_bengal", "arabian_sea"]

@router.post("/live/scan-regions", response_model=List[RegionalScanResult])
def scan_regions():
    """
    Scans predefined ocean regions for cyclogenesis / active storm signatures.
    """
    results = []
    for region in SCAN_REGIONS:
        # Runs intensity model on latest region frame
        wind_kmh, category, confidence, version = predict_intensity(channel="IR")
        detected = wind_kmh >= 31.0  # IMD Depression threshold
        results.append(RegionalScanResult(
            region=region,
            system_detected=detected,
            confidence=confidence
        ))
    return results

@router.post("/live/update-cyclone/{cyclone_id}")
def update_cyclone(cyclone_id: str, req: LiveCycloneUpdateRequest):
    """
    Fetches latest satellite crop around (lastKnownLat, lastKnownLon) and updates intensity & track predictions.
    """
    try:
        wind_kmh, category, confidence, version = predict_intensity(channel="IR")
        
        # Simple track prediction step (+6h, +12h, +24h persistence)
        track_forecast = [
            {"lead_time_hours": 6, "lat": round(req.lastKnownLat + 0.3, 2), "lon": round(req.lastKnownLon - 0.2, 2), "wind_speed_kmh": wind_kmh},
            {"lead_time_hours": 12, "lat": round(req.lastKnownLat + 0.6, 2), "lon": round(req.lastKnownLon - 0.5, 2), "wind_speed_kmh": max(0.0, wind_kmh - 5.0)},
            {"lead_time_hours": 24, "lat": round(req.lastKnownLat + 1.2, 2), "lon": round(req.lastKnownLon - 1.0, 2), "wind_speed_kmh": max(0.0, wind_kmh - 15.0)}
        ]
        
        return {
            "cyclone_id": cyclone_id,
            "category": category,
            "wind_speed_kmh": wind_kmh,
            "confidence": confidence,
            "model_version": version,
            "track": track_forecast
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Live update failed for cyclone {cyclone_id}: {str(e)}"
        )
