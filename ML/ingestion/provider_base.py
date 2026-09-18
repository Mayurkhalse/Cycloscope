"""
Satellite Data Provider Base Interface
Defines the unified abstract contract for all satellite ingestion sources (TCIR, MOSDAC, INSAT).
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple, Optional
from datetime import datetime
import numpy as np

class SatelliteDataProvider(ABC):
    """
    Abstract contract for meteorological satellite frame providers.
    Every provider must return both the raw numerical matrix (numpy array)
    and a structured metadata dictionary establishing complete provenance.
    """
    
    @abstractmethod
    def get_observation(
        self,
        center_lat: float,
        center_lon: float,
        timestamp: Optional[datetime] = None,
        channel: str = "ir"
    ) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Fetches an observation patch centered at (center_lat, center_lon).
        
        Returns:
            Tuple of:
            - ndarray of shape (H, W, C) containing calibrated brightness temp / reflectance
            - dict of metadata including sensor, timestamp, bounding box, units, calibration
        """
        pass

    @abstractmethod
    def get_region_frame(
        self,
        region_name: str,
        timestamp: Optional[datetime] = None,
        channel: str = "ir"
    ) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Fetches a wide regional synoptic frame for regional scanning (e.g. bay_of_bengal, arabian_sea).
        
        Returns:
            Tuple of (ndarray, metadata_dict)
        """
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        """Returns provider identifier string (e.g., 'TCIR', 'MOSDAC', 'INSAT-3D')"""
        pass
