"""
Satellite Repository
Unified registry for satellite data providers providing mode-aware observation retrieval,
in-memory caching, and metadata provenance for the Cyclone Scope system.
"""
from typing import Dict, Any, Tuple, Optional
from datetime import datetime
import numpy as np

from ingestion.provider_base import SatelliteDataProvider
from ingestion.tcir_provider import TCIRSatelliteProvider
from ingestion.mosdac_provider import MOSDACSatelliteProvider

class SatelliteRepository:
    """
    Central repository for satellite observation access across the entire platform.
    """
    
    def __init__(self):
        self._tcir_provider = TCIRSatelliteProvider()
        self._mosdac_provider = MOSDACSatelliteProvider()
        self._cache = {}

    def get_provider(self, mode: str = "live") -> SatelliteDataProvider:
        """Returns the appropriate provider based on active system mode."""
        if mode == "replay" or mode == "historical_replay":
            return self._tcir_provider
        return self._mosdac_provider

    def get_observation_for_storm(
        self,
        center_lat: float,
        center_lon: float,
        timestamp: Optional[datetime] = None,
        channel: str = "ir",
        mode: str = "live"
    ) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Retrieves observation patch and metadata for a storm fix.
        """
        provider = self.get_provider(mode)
        return provider.get_observation(center_lat, center_lon, timestamp, channel)

    def get_region_frame(
        self,
        region_name: str,
        timestamp: Optional[datetime] = None,
        channel: str = "ir",
        mode: str = "live"
    ) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Retrieves regional synoptic observation and metadata.
        """
        provider = self.get_provider(mode)
        return provider.get_region_frame(region_name, timestamp, channel)

# Global singleton repository
satellite_repo = SatelliteRepository()
