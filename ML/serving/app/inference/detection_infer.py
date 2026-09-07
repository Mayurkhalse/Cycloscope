import sys
from pathlib import Path
import torch

ML_ROOT = Path(__file__).resolve().parents[3]
sys.path.append(str(ML_ROOT))

from serving.app.models.model_loader import get_intensity_model

@torch.no_grad()
def predict_detection(image_tensor: torch.Tensor):
    """
    Detects whether an organized tropical system exists in the input region.
    Uses intensity regressor feature thresholding (wind speed >= 31 km/h is IMD Depression).
    """
    model, metadata = get_intensity_model()
    predicted_wind = model(image_tensor).item()
    wind_kmh = max(0.0, round(float(predicted_wind), 1))
    
    is_cyclone = wind_kmh >= 31.0
    confidence = round(min(0.95, max(0.60, 1.0 - (abs(wind_kmh - 40) / 250))), 2)
    
    return {
        "system_detected": is_cyclone,
        "estimated_wind_kmh": wind_kmh,
        "confidence": confidence,
        "model_version": metadata.get("version", "v0.1")
    }
