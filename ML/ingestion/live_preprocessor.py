import sys
from pathlib import Path
import numpy as np
import torch

ML_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ML_ROOT))

from shared.preprocessing import clean_channel, normalize

def preprocess_live_frame(raw_array: np.ndarray) -> torch.Tensor:
    """
    Preprocesses a raw satellite frame from MOSDAC for live inference.
    Applies the exact same cleaning & normalization as offline training.
    """
    cleaned = clean_channel(raw_array, strategy="zero")
    normalized = normalize(cleaned)
    
    if normalized.ndim == 2:
        normalized = normalized[:, :, np.newaxis]
        
    tensor = torch.tensor(normalized).permute(2, 0, 1).unsqueeze(0).float()
    return tensor
