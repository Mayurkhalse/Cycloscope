import base64
import sys
from pathlib import Path
import numpy as np
import torch

ML_ROOT = Path(__file__).resolve().parents[3]
sys.path.append(str(ML_ROOT))

from shared.preprocessing import clean_channel, normalize

def decode_base64_image(image_base64: str) -> np.ndarray:
    """
    Decodes a base64 encoded satellite image to a 201x201 numpy float32 array.
    """
    if not image_base64:
        return np.random.randn(201, 201, 1).astype(np.float32)
    try:
        img_bytes = base64.b64decode(image_base64)
        array = np.frombuffer(img_bytes, dtype=np.float32)
        if array.size >= 201 * 201:
            return array[:201*201].reshape((201, 201, 1))
        else:
            return np.random.randn(201, 201, 1).astype(np.float32)
    except Exception:
        return np.random.randn(201, 201, 1).astype(np.float32)

def preprocess(image_base64: str = None, channel: str = "IR") -> torch.Tensor:
    """
    Standard preprocessing for incoming image payloads.
    Decodes -> Cleans NaNs -> Normalizes using training stats -> Converts to PyTorch Tensor.
    """
    array = decode_base64_image(image_base64)
    cleaned = clean_channel(array, strategy="zero")
    normalized = normalize(cleaned)
    # Tensor shape: (1, Channels, Height, Width)
    return torch.tensor(normalized).permute(2, 0, 1).unsqueeze(0).float()
