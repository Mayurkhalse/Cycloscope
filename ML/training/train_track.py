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
            
    df = pd.DataFrame(records)

    # [DATA Persistence Hook] Save raw synthetic dataset
    project_root = Path(__file__).resolve().parents[2]
    raw_syn_dir = project_root / "data" / "raw" / "synthetic"
    raw_syn_dir.mkdir(parents=True, exist_ok=True)
    raw_syn_path = raw_syn_dir / "synthetic_cyclone_tracks.csv"
    df.to_csv(raw_syn_path, index=False)
    print(f"[DATA] Saved synthetic dataset:")
    print(f"       Rows: {len(df):,}")
    print(f"       Columns: {df.shape[1]}")
    print(f"       Path: {raw_syn_path.relative_to(project_root)}")

    return df

def train_track_model(epochs: int = 10, batch_size: int = 4, lr: float = 1e-3, version: str = "v0.1"):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Starting Track Forecaster LSTM training on device: {device}")
    
    # 1. Build sequences
    df = generate_synthetic_storm_tracks(num_storms=20, timesteps_per_storm=30)
    sequences = build_sequences(df, window=8, horizon_steps=(2, 4, 8))
    print(f"Constructed {len(sequences)} multi-horizon sequence samples.")

    # [DATA Persistence Hook] Save processed sequence dataset
    project_root = Path(__file__).resolve().parents[2]
    processed_dir = project_root / "data" / "processed"
    processed_dir.mkdir(parents=True, exist_ok=True)
    
    seq_records = []
    for s_idx, seq in enumerate(sequences):
        past_df = seq["past"]
        t2 = seq["targets"][2]
        t4 = seq["targets"][4]
        t8 = seq["targets"][8]
        seq_records.append({
            "sample_index": s_idx,
            "storm_id": seq["storm_id"],
            "window_start": str(past_df.iloc[0]["timestamp"]),
            "window_end": str(past_df.iloc[-1]["timestamp"]),
            "current_lat": float(past_df.iloc[-1]["lat"]),
            "current_lon": float(past_df.iloc[-1]["lon"]),
            "current_wind_kmh": float(past_df.iloc[-1]["wind_kmh"]),
            "target_6h_lat": float(t2["lat"]),
            "target_6h_lon": float(t2["lon"]),
            "target_6h_wind_kmh": float(t2["wind_kmh"]),
            "target_12h_lat": float(t4["lat"]),
            "target_12h_lon": float(t4["lon"]),
            "target_12h_wind_kmh": float(t4["wind_kmh"]),
            "target_24h_lat": float(t8["lat"]),
            "target_24h_lon": float(t8["lon"]),
            "target_24h_wind_kmh": float(t8["wind_kmh"]),
        })
    df_seq = pd.DataFrame(seq_records)
    processed_seq_path = processed_dir / "track_sequences_processed.csv"
    df_seq.to_csv(processed_seq_path, index=False)
    print(f"[DATA] Saved final processed dataset:")
    print(f"       Rows: {len(df_seq):,}")
    print(f"       Columns: {df_seq.shape[1]}")
    print(f"       Path: {processed_seq_path.relative_to(project_root)}")

    dataset = CycloneSequenceDataset(sequences, embedding_dim=512)
    train_size = int(0.8 * len(dataset))
    val_size = len(dataset) - train_size
    train_ds, val_ds = torch.utils.data.random_split(dataset, [train_size, val_size])
    
    # [DATA Persistence Hook] Save train and validation sequence splits
    train_seq_df = df_seq.iloc[:train_size]
    val_seq_df = df_seq.iloc[train_size:]
    train_seq_path = processed_dir / "track_train_sequences.csv"
    val_seq_path = processed_dir / "track_val_sequences.csv"
    train_seq_df.to_csv(train_seq_path, index=False)
    val_seq_df.to_csv(val_seq_path, index=False)
    print(f"[DATA] Saved train split dataset:")
    print(f"       Rows: {len(train_seq_df):,}")
    print(f"       Columns: {train_seq_df.shape[1]}")
    print(f"       Path: {train_seq_path.relative_to(project_root)}")
    print(f"[DATA] Saved validation split dataset:")
    print(f"       Rows: {len(val_seq_df):,}")
    print(f"       Columns: {val_seq_df.shape[1]}")
    print(f"       Path: {val_seq_path.relative_to(project_root)}")
    
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
