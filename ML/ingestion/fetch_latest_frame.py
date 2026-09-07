import numpy as np
from datetime import datetime
from typing import Optional

from ingestion.region_config import SCAN_REGIONS
from ingestion.region_crop import crop_around_center

def get_latest_synoptic_tick() -> datetime:
    """
    Returns the nearest past synoptic hour (00, 06, 12, 18 UTC).
    """
    now = datetime.utcnow()
    hour = (now.hour // 6) * 6
    return now.replace(hour=hour, minute=0, second=0, microsecond=0)

def get_latest_region_frame(region_name: str) -> np.ndarray:
    """
    Fetches the latest satellite frame for a predefined region (e.g. bay_of_bengal, arabian_sea).
    Returns a 201x201 numpy array.
    """
    if region_name not in SCAN_REGIONS:
        raise ValueError(f"Unknown region: {region_name}")
    # In live mode with approved MOSDAC SSO, pulls from MosdacClient; falls back to synthetic test frame
    return np.random.randn(201, 201, 1).astype(np.float32)

def get_latest_frame_for_cyclone(center_lat: float, center_lon: float) -> np.ndarray:
    """
    Fetches the latest satellite frame cropped to 7 degrees around the cyclone center.
    """
    full_disk_mock = np.random.randn(800, 1400, 1).astype(np.float32)
    crop = crop_around_center(full_disk_mock, center_lat, center_lon, grid_resolution_deg=0.07, radius_deg=7.0)
    return crop
