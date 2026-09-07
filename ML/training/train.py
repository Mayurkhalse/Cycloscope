import os
import sys
import json
import shutil
from pathlib import Path
from datetime import date

import torch
import torch.nn as nn
from torch.utils.data import DataLoader

# Add project root to path
ML_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ML_ROOT))

from src.data_acquisition.fetch_tcir_benchmark import fetch_tcir
from src.datasets.cyclone_image_dataset import TCIRDataset
from src.models.intensity_regressor import IntensityRegressor

def validate(model, dataloader, device):
    model.eval()
    errors = []
    with torch.no_grad():
        for images, targets in dataloader:
            images, targets = images.to(device), targets.to(device)
            preds = model(images)
            errors.append(torch.abs(preds - targets))
    if not errors:
        return 0.0
    return torch.cat(errors).mean().item()

def train_and_export(epochs: int = 5, batch_size: int = 16, lr: float = 1e-4, version: str = "v0.1"):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Starting training run for model {version} on device: {device}")
    
    # Ensure bootstrap dataset is ready
    h5_path = fetch_tcir()
    
    dataset = TCIRDataset(str(h5_path), channels=("IR",))
    train_size = int(0.8 * len(dataset))
    val_size = len(dataset) - train_size
    train_ds, val_ds = torch.utils.data.random_split(dataset, [train_size, val_size])
    
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)
    
    model = IntensityRegressor(in_channels=1).to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    criterion = nn.MSELoss()
    
    best_val_mae = float("inf")
    checkpoint_dir = ML_ROOT / "experiments" / version / "checkpoints"
    checkpoint_dir.mkdir(parents=True, exist_ok=True)
    best_ckpt_path = checkpoint_dir / "best.pt"
    
    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0
        for images, targets in train_loader:
            images, targets = images.to(device), targets.to(device)
            optimizer.zero_grad()
            preds = model(images)
            loss = criterion(preds, targets)
            loss.backward()
            optimizer.step()
            total_loss += loss.item() * images.size(0)
            
        train_loss = total_loss / len(train_ds) if len(train_ds) > 0 else 0.0
        val_mae = validate(model, val_loader, device)
        print(f"Epoch {epoch}/{epochs} | Train Loss: {train_loss:.4f} | Val MAE: {val_mae:.4f} km/h")
        
        if val_mae <= best_val_mae:
            best_val_mae = val_mae
            torch.save(model.state_dict(), best_ckpt_path)
            
    dataset.close()
    
    # Export artifacts to serving/model_artifacts/<version>
    export_dir = ML_ROOT / "serving" / "model_artifacts" / version
    export_ckpt_dir = export_dir / "checkpoints"
    export_ckpt_dir.mkdir(parents=True, exist_ok=True)
    
    shutil.copy(best_ckpt_path, export_ckpt_dir / "best.pt")
    
    metadata = {
        "model_name": "intensity_regressor",
        "version": version,
        "trained_on": str(date.today()),
        "train_samples": train_size,
        "val_mae_kmh": round(best_val_mae, 2),
        "data_source": "TCIR-Bootstrap-Sample",
        "channels": ["IR"]
    }
    
    with open(export_dir / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"\nSuccessfully exported model {version} artifacts to {export_dir}")

if __name__ == "__main__":
    train_and_export(epochs=3)
