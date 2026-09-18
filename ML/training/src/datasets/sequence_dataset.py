import torch
from torch.utils.data import Dataset
import numpy as np
from typing import List, Dict, Any

class CycloneSequenceDataset(Dataset):
    """
    PyTorch Dataset for multi-timestep storm sequences.
    Yields:
      - frame_embeddings: Tensor of shape (seq_len, embedding_dim)
      - numeric_features: Tensor of shape (seq_len, 3) representing [lat, lon, wind_kmh]
      - targets: Dict of horizon step targets (+6h, +12h, +24h)
    """
    def __init__(self, sequences: List[Dict[str, Any]], embedding_dim: int = 512):
        self.sequences = sequences
        self.embedding_dim = embedding_dim

    def __len__(self):
        return len(self.sequences)

    def __getitem__(self, idx):
        seq = self.sequences[idx]
        past_df = seq["past"]
        
        # Numeric normalized features: [lat/30.0, lon/100.0, wind/200.0]
        numeric_vals = []
        for _, row in past_df.iterrows():
            lat = float(row.get("lat", 15.0)) / 30.0
            lon = float(row.get("lon", 85.0)) / 100.0
            wind = float(row.get("wind_kmh", 50.0)) / 200.0
            numeric_vals.append([lat, lon, wind])
            
        numeric_tensor = torch.tensor(numeric_vals, dtype=torch.float32)
        
        # Synthetic embedding tensor for sequence timesteps (seq_len, 512)
        seq_len = len(past_df)
        embeddings = torch.randn(seq_len, self.embedding_dim, dtype=torch.float32)
        
        # Targets for horizons (+6h, +12h, +24h)
        # Each horizon target is [dlat, dlon, dwind]
        last_lat = float(past_df.iloc[-1].get("lat", 15.0))
        last_lon = float(past_df.iloc[-1].get("lon", 85.0))
        last_wind = float(past_df.iloc[-1].get("wind_kmh", 50.0))
        
        targets_list = []
        for h, target_row in seq["targets"].items():
            t_lat = float(target_row.get("lat", last_lat))
            t_lon = float(target_row.get("lon", last_lon))
            t_wind = float(target_row.get("wind_kmh", last_wind))
            
            dlat = t_lat - last_lat
            dlon = t_lon - last_lon
            dwind = t_wind - last_wind
            targets_list.append([dlat, dlon, dwind])
            
        target_tensor = torch.tensor(targets_list, dtype=torch.float32)
        
        return embeddings, numeric_tensor, target_tensor
