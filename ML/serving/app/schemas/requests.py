from pydantic import BaseModel, Field
from typing import Optional

class IntensityPredictionRequest(BaseModel):
    cyclone_id: Optional[str] = Field(None, description="Identifier of the cyclone system")
    image_base64: Optional[str] = Field(None, description="Base64 encoded satellite image frame")
    channel: str = Field("IR", description="Satellite channel used (e.g. IR, WV, VIS)")

class LiveCycloneUpdateRequest(BaseModel):
    lastKnownLat: float = Field(..., description="Last known latitude coordinate")
    lastKnownLon: float = Field(..., description="Last known longitude coordinate")
