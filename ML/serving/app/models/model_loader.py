import json
import sys
from pathlib import Path
from functools import lru_cache
import torch

# Include ML root and shared paths
ML_ROOT = Path(__file__).resolve().parents[3]
sys.path.append(str(ML_ROOT))

from training.src.models.intensity_regressor import IntensityRegressor
from training.src.models.temporal_lstm import TrackForecaster

@lru_cache(maxsize=1)
def get_intensity_model(version: str = "v0.1"):
    """
    Loads trained intensity model weights and metadata into memory once.
    Reuses cached model instance across incoming requests.
    """
    artifact_dir = ML_ROOT / "serving" / "model_artifacts" / version
    ckpt_path = artifact_dir / "checkpoints" / "best.pt"
    meta_path = artifact_dir / "metadata.json"
    
    if not ckpt_path.exists():
        raise FileNotFoundError(f"Model checkpoint not found at {ckpt_path}. Run training/train.py first.")
        
    model = IntensityRegressor(in_channels=1)
    state_dict = torch.load(ckpt_path, map_location="cpu")
    model.load_state_dict(state_dict)
    model.eval()
    
    metadata = {}
    if meta_path.exists():
        with open(meta_path, "r") as f:
            metadata = json.load(f)
    else:
        metadata = {"version": version, "model_name": "intensity_regressor"}
        
    return model, metadata

@lru_cache(maxsize=1)
def get_track_model(version: str = "v0.1"):
    """
    Loads trained temporal LSTM track model weights into memory.
    """
    artifact_dir = ML_ROOT / "serving" / "model_artifacts" / version
    ckpt_path = artifact_dir / "checkpoints" / "track_best.pt"
    
    model = TrackForecaster(embedding_dim=512, numeric_dim=3, hidden_dim=128, horizons=3)
    if ckpt_path.exists():
        state_dict = torch.load(ckpt_path, map_location="cpu")
        model.load_state_dict(state_dict)
    model.eval()
    return model
