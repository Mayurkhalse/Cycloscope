import os
import sys
from pathlib import Path
import numpy as np
from datetime import datetime
from typing import Optional, Dict, Any, Tuple

ML_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ML_ROOT))

from ingestion.satellite_repository import satellite_repo

def get_latest_synoptic_tick() -> datetime:
    """
    Returns the nearest past synoptic hour (00, 06, 12, 18 UTC).
    """
    now = datetime.utcnow()
    hour = (now.hour // 6) * 6
    return now.replace(hour=hour, minute=0, second=0, microsecond=0)

def get_latest_region_frame(region_name: str, mode: str = "live") -> np.ndarray:
    """
    Fetches real satellite frame for a predefined region (bay_of_bengal, arabian_sea).
    Pulls authentic 201x201 infrared satellite frame matrix from the satellite repository.
    """
    frame, _ = satellite_repo.get_region_frame(region_name, mode=mode)
    return frame

def get_latest_frame_for_cyclone(center_lat: float, center_lon: float, mode: str = "live") -> np.ndarray:
    """
    Fetches authentic satellite frame cropped around the cyclone center coordinates.
    """
    frame, _ = satellite_repo.get_observation_for_storm(center_lat, center_lon, mode=mode)
    return frame

def get_observation_with_provenance(center_lat: float, center_lon: float, mode: str = "live") -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Fetches both the satellite frame matrix and its detailed provenance metadata dictionary.
    """
    return satellite_repo.get_observation_for_storm(center_lat, center_lon, mode=mode)


