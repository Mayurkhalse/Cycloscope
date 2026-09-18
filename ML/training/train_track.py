import sys
import json
import shutil
from pathlib import Path
from datetime import date
import pandas as pd
import numpy as np

import torch
import torch.nn as nn
from torch.utils.data import DataLoader

ML_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ML_ROOT))

from src.models.temporal_lstm import TrackForecaster
from src.datasets.sequence_dataset import CycloneSequenceDataset
from src.preprocessing.build_sequences import build_sequences

def generate_synthetic_storm_tracks(num_storms: int = 15, timesteps_per_storm: int = 24) -> pd.DataFrame:
    """
    Generates synthetic cyclone tracks for training the LSTM trajectory model.
    """
    records = []
    for s_idx in range(num_storms):
        storm_id = f"STORM_{s_idx+1:03d}"
        base_lat = 8.0 + np.random.rand() * 8.0
        base_lon = 88.0 + np.random.rand() * 6.0
        base_wind = 40.0 + np.random.rand() * 20.0
        
        for t in range(timesteps_per_storm):
            # Northwestward progression
            lat = base_lat + t * 0.35 + np.random.normal(0, 0.05)
            lon = base_lon - t * 0.25 + np.random.normal(0, 0.05)
            # Intensify then decay
            wind = base_wind + (t if t < 12 else 24 - t) * 3.0 + np.random.normal(0, 1.0)
            
            records.append({
                "storm_id": storm_id,
                "timestamp": f"2020-05-{(t//8)+1:02d} {(t%8)*3:02d}:00",
                "lat": round(lat, 2),
                "lon": round(lon, 2),
                "wind_kmh": round(max(20.0, wind), 1),
                "year": 2020
            })
            
    return pd.DataFrame(records)

def train_track_model(epochs: int = 10, batch_size: int = 4, lr: float = 1e-3, version: str = "v0.1"):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Starting Track Forecaster LSTM training on device: {device}")
    
    # 1. Build sequences
    df = generate_synthetic_storm_tracks(num_storms=20, timesteps_per_storm=30)
    sequences = build_sequences(df, window=8, horizon_steps=(2, 4, 8))
    print(f"Constructed {len(sequences)} multi-horizon sequence samples.")
    
    dataset = CycloneSequenceDataset(sequences, embedding_dim=512)
    train_size = int(0.8 * len(dataset))
    val_size = len(dataset) - train_size
    train_ds, val_ds = torch.utils.data.random_split(dataset, [train_size, val_size])
    
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)
    
    model = TrackForecaster(embedding_dim=512, numeric_dim=3, hidden_dim=128, horizons=3).to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    criterion = nn.MSELoss()
    
    best_loss = float("inf")
    checkpoint_dir = ML_ROOT / "experiments" / version / "checkpoints"
    checkpoint_dir.mkdir(parents=True, exist_ok=True)
    best_ckpt_path = checkpoint_dir / "track_best.pt"
    
    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0
        for embeddings, numeric, targets in train_loader:
            embeddings, numeric, targets = embeddings.to(device), numeric.to(device), targets.to(device)
            optimizer.zero_grad()
            
            outputs = model(embeddings, numeric) # list of 3 tensors: shape (B, 3) each
            pred_tensor = torch.stack(outputs, dim=1) # shape (B, 3, 3)
            
            loss = criterion(pred_tensor, targets)
            loss.backward()
            optimizer.step()
            total_loss += loss.item() * embeddings.size(0)
            
        train_loss = total_loss / len(train_ds) if len(train_ds) > 0 else 0.0
        
        # Validation
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for embeddings, numeric, targets in val_loader:
                embeddings, numeric, targets = embeddings.to(device), numeric.to(device), targets.to(device)
                outputs = model(embeddings, numeric)
                pred_tensor = torch.stack(outputs, dim=1)
                val_loss += criterion(pred_tensor, targets).item() * embeddings.size(0)
        val_loss = val_loss / len(val_ds) if len(val_ds) > 0 else 0.0
        
        print(f"Epoch {epoch}/{epochs} | Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f}")
        
        if val_loss <= best_loss:
            best_loss = val_loss
            torch.save(model.state_dict(), best_ckpt_path)
            
    # Export to serving/model_artifacts/<version>/checkpoints/track_best.pt
    export_dir = ML_ROOT / "serving" / "model_artifacts" / version / "checkpoints"
    export_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy(best_ckpt_path, export_dir / "track_best.pt")
    print(f"\nSuccessfully exported Track Forecaster model to {export_dir / 'track_best.pt'}")

if __name__ == "__main__":
    train_track_model(epochs=5)
