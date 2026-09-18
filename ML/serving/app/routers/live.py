import sys
from pathlib import Path
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Response, Query
import torch

ML_ROOT = Path(__file__).resolve().parents[3]
sys.path.append(str(ML_ROOT))

from serving.app.schemas.requests import LiveCycloneUpdateRequest
from serving.app.schemas.responses import RegionalScanResult
from serving.app.models.model_loader import get_intensity_model, get_track_model
from ingestion.fetch_latest_frame import get_latest_region_frame, get_latest_frame_for_cyclone
from ingestion.satellite_renderer import render_satellite_frame
from ingestion.live_preprocessor import preprocess_live_frame
from shared.category_mapper import wind_to_category

router = APIRouter()

SCAN_REGIONS = ["bay_of_bengal", "arabian_sea"]

@router.get("/live/scan-regions")
@router.post("/live/scan-regions")
def scan_regions():
    """
    Scans predefined ocean regions for cyclogenesis / active storm signatures using real satellite matrices.
    """
    results = []
    region_centers = {
        "bay_of_bengal": {"lat": 14.5, "lon": 87.5},
        "arabian_sea": {"lat": 13.0, "lon": 66.0}
    }
    
    model, metadata = get_intensity_model(version="v0.1")
    
    for region in SCAN_REGIONS:
        # Load real satellite frame from memory-mapped dataset
        raw_frame = get_latest_region_frame(region)
        tensor = preprocess_live_frame(raw_frame)
        
        with torch.no_grad():
            predicted_wind = model(tensor).item()
            
        wind_kmh = max(0.0, round(float(predicted_wind), 1))
        detected = wind_kmh >= 31.0  # IMD Depression threshold
        confidence = round(min(0.95, max(0.65, 1.0 - (abs(wind_kmh - 80) / 300))), 2)
        
        results.append({
            "region": "Bay of Bengal" if region == "bay_of_bengal" else "Arabian Sea",
            "present": detected,
            "confidence": confidence,
            "estimatedCenter": region_centers.get(region, {"lat": 14.0, "lon": 88.0}),
            "source": "ml-model",
            "model_version": metadata.get("version", "v0.1")
        })
    return results

from serving.app.services.prediction_engine import prediction_engine

@router.post("/live/update-cyclone/{cyclone_id}")
def update_cyclone(cyclone_id: str, req: LiveCycloneUpdateRequest):
    """
    Fetches real satellite crop around (lastKnownLat, lastKnownLon), runs PyTorch ResNet-18 intensity,
    PyTorch LSTM track forecasting, and ML cyclogenesis with complete metadata provenance.
    """
    try:
        res = prediction_engine.execute_full_storm_prediction(
            cyclone_id=cyclone_id,
            current_lat=req.lastKnownLat,
            current_lon=req.lastKnownLon,
            mode="live"
        )
        return res
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Live update failed for cyclone {cyclone_id}: {str(e)}"
        )

@router.get("/live/satellite-frame/{cyclone_id}")
def get_satellite_frame(
    cyclone_id: str,
    name: str = Query("Cyclone", description="Storm name"),
    category: str = Query("Cyclonic Storm", description="Current intensity category"),
    lat: float = Query(15.0, description="Center latitude"),
    lon: float = Query(85.0, description="Center longitude"),
    channel: str = Query("ir", description="Channel: ir, dvorak, wv"),
):
    """
    Renders dynamic authentic meteorological satellite frame for a cyclone with requested channel colormap.
    """
    try:
        img_bytes = render_satellite_frame(
            cyclone_id=cyclone_id,
            cyclone_name=name,
            category=category,
            center_lat=lat,
            center_lon=lon,
            channel=channel
        )
        return Response(
            content=img_bytes,
            media_type="image/png",
            headers={
                "Cache-Control": "public, max-age=60",
                "X-Satellite-Channel": channel,
                "X-Cyclone-ID": cyclone_id
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate satellite visualization for {cyclone_id}: {str(e)}"
        )


