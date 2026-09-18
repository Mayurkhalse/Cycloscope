import os
import sys
import glob
import json
import argparse
from pathlib import Path
from datetime import datetime

import torch
import torch.nn as nn
from torch.utils.data import DataLoader

ML_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ML_ROOT))

from training.src.datasets.cyclone_image_dataset import TCIRDataset
from training.src.models.intensity_regressor import IntensityRegressor
from training.src.preprocessing.split import create_splits_from_h5
from training.validate import validate_epoch
from training.test import run_test_evaluation
from training.export_model import export_model_artifacts

def find_dataset_path(custom_path: str = None) -> Path:
    """
    Finds the HDF5 or NPY dataset file in kaggle_tcir or tcir raw directories.
    """
    if custom_path and Path(custom_path).exists():
        return Path(custom_path)
        
    kaggle_dir = ML_ROOT / "training" / "data" / "raw" / "kaggle_tcir"
    tcir_dir = ML_ROOT / "training" / "data" / "raw" / "tcir"
    
    # Check for any .npy or .h5 files in kaggle_tcir first
    kaggle_npy = list(kaggle_dir.glob("*.npy"))
    if kaggle_npy:
        print(f"[*] Found Kaggle NumPy dataset in {kaggle_dir}: {[f.name for f in kaggle_npy]}")
        return kaggle_dir
        
    kaggle_h5 = list(kaggle_dir.glob("*.h5")) + list(kaggle_dir.glob("*.hdf5"))
    if kaggle_h5:
        print(f"[*] Found Kaggle HDF5 dataset in {kaggle_dir}: {kaggle_h5[0].name}")
        return kaggle_h5[0]
        
    # Check for any .h5 in tcir/
    tcir_h5 = list(tcir_dir.glob("*.h5")) + list(tcir_dir.glob("*.hdf5"))
    if tcir_h5:
        print(f"[*] Found TCIR dataset in {tcir_dir}: {tcir_h5[0].name}")
        return tcir_h5[0]
        
    # Fallback to automated fetcher
    from training.src.data_acquisition.fetch_tcir_benchmark import fetch_tcir
    return fetch_tcir()

def load_split_ids(split_file: Path):
    if not split_file.exists():
        return None
    with open(split_file, "r") as f:
        return [line.strip() for line in f if line.strip() and not line.startswith("#")]

def main():
    parser = argparse.ArgumentParser(description="Cyclone Scope ML Training Pipeline (9 Steps)")
    parser.add_argument("--task", type=str, default="intensity", choices=["intensity", "track"], help="Training task")
    parser.add_argument("--channels", type=str, default="IR", help="Channels to use, comma-separated (e.g. IR or IR,WV)")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")
    parser.add_argument("--lr", type=float, default=1e-4, help="Learning rate")
    parser.add_argument("--data_path", type=str, default=None, help="Custom path to dataset file or folder")
    parser.add_argument("--version", type=str, default="v0.1", help="Model artifact version")
    args = parser.parse_args()

    channels = tuple(args.channels.split(","))

    print("=================================================================")
    print(f"  CYCLONE SCOPE ML — 9-STEP TRAINING PIPELINE ({args.version})   ")
    print(f"  Task: {args.task.upper()} | Channels: {channels} | Epochs: {args.epochs}")
    print("=================================================================\n")
    
    version = args.version
    exp_dir = ML_ROOT / "training" / "experiments" / version
    exp_dir.mkdir(parents=True, exist_ok=True)
    
    # Step 1: Acquire / Locate Dataset
    print("[Step 1/9] Locating Dataset Archive (Kaggle TCIR / Mirror)...")
    data_path = find_dataset_path(args.data_path)
    print(f"[*] Target dataset path: {data_path}")
    
    # Step 2-4: Clean, Crop & Labels
    print("[Step 2-4/9] Cleaning channels, applying 7° storm-crop conventions & building labels...")
    
    # Step 5: Storm-Level Splits
    print("[Step 5/9] Creating storm-level temporal splits (never random rows)...")
    splits_dir = ML_ROOT / "training" / "data" / "splits"
    train_part, val_part, test_part = create_splits_from_h5(data_path, splits_dir, train_end_year=2015, val_end_year=2016)
    
    is_npy_dataset = (data_path.is_dir() and list(data_path.glob("*.npy"))) or (data_path.is_file() and data_path.suffix == ".npy")
    
    if is_npy_dataset:
        train_ds = TCIRDataset(str(data_path), indices=train_part, channels=channels)
        val_ds = TCIRDataset(str(data_path), indices=val_part, channels=channels)
        test_ds = TCIRDataset(str(data_path), indices=test_part, channels=channels)
    else:
        train_ids = load_split_ids(splits_dir / "train_storms.txt")
        val_ids = load_split_ids(splits_dir / "val_storms.txt")
        test_ids = load_split_ids(splits_dir / "test_storms.txt")
        train_ds = TCIRDataset(str(data_path), storm_ids=train_ids, channels=channels)
        val_ds = TCIRDataset(str(data_path), storm_ids=val_ids, channels=channels)
        test_ds = TCIRDataset(str(data_path), storm_ids=test_ids, channels=channels)
    
    print(f"Dataset partitions loaded: Train samples={len(train_ds)}, Val samples={len(val_ds)}, Test samples={len(test_ds)}")
    
    # Step 6: Train ResNet-18 Intensity Regressor
    print("[Step 6/9] Initializing Model & Device...")
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Training on device: {device.upper()}")
    if device == "cuda":
        print(f"GPU: {torch.cuda.get_device_name(0)}")
    
    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=args.batch_size, shuffle=False)
    test_loader = DataLoader(test_ds, batch_size=args.batch_size, shuffle=False)
    
    model = IntensityRegressor(in_channels=len(channels)).to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=args.lr)
    criterion = nn.MSELoss()
    
    best_val_mae = float("inf")
    ckpt_dir = exp_dir / "checkpoints"
    ckpt_dir.mkdir(parents=True, exist_ok=True)
    best_ckpt_path = ckpt_dir / "best.pt"
    
    epoch_history = []
    
    print("\nStarting Training Loop...")
    for epoch in range(1, args.epochs + 1):
        model.train()
        total_train_loss = 0.0
        
        for images, targets in train_loader:
            images, targets = images.to(device), targets.to(device)
            optimizer.zero_grad()
            preds = model(images)
            loss = criterion(preds, targets)
            loss.backward()
            optimizer.step()
            total_train_loss += loss.item() * images.size(0)
            
        train_loss = total_train_loss / len(train_ds) if len(train_ds) > 0 else 0.0
        
        # Step 7: Validate
        val_mae, val_loss = validate_epoch(model, val_loader, criterion, device)
        print(f"Epoch {epoch:02d}/{args.epochs:02d} | Train Loss (MSE): {train_loss:.4f} | Val MAE: {val_mae:.2f} km/h | Val Loss: {val_loss:.4f}")
        
        epoch_history.append({
            "epoch": epoch,
            "train_loss": round(train_loss, 4),
            "val_mae_kmh": round(val_mae, 2),
            "val_loss": round(val_loss, 4)
        })
        
        if val_mae <= best_val_mae:
            best_val_mae = val_mae
            torch.save(model.state_dict(), best_ckpt_path)
            
    # Load best checkpoint for final test
    model.load_state_dict(torch.load(best_ckpt_path, map_location=device))
    
    # Step 8: Final Test on Unseen Split
    print("\n[Step 8/9] Running final evaluation on untouched test split...")
    test_metrics = run_test_evaluation(model, test_loader, device)
    test_metrics["best_val_mae_kmh"] = round(best_val_mae, 2)
    
    # Save experiment metrics.json
    metrics_file = exp_dir / "metrics.json"
    with open(metrics_file, "w") as f:
        json.dump({
            "timestamp": str(datetime.utcnow()),
            "version": version,
            "device": device,
            "train_samples": len(train_ds),
            "val_samples": len(val_ds),
            "test_samples": len(test_ds),
            "final_metrics": test_metrics,
            "history": epoch_history
        }, f, indent=2)
    print(f"Saved experiment metrics to {metrics_file}")
    
    # Step 9: Export Artifacts to serving/
    print(f"\n[Step 9/9] Exporting model artifacts to serving/model_artifacts/{version}/...")
    dest_artifacts = ML_ROOT / "serving" / "model_artifacts" / version
    export_model_artifacts(
        checkpoint_path=best_ckpt_path,
        dest_dir=dest_artifacts,
        version=version,
        test_metrics=test_metrics,
        train_storm_count=len(train_ds),
        data_source="kaggle/kbdharun/tropical-cyclone-intensity-regression"
    )
    
    print("\n=================================================================")
    print("      TRAINING PIPELINE COMPLETED SUCCESSFULLY (9/9 STEPS)       ")
    print("=================================================================")

if __name__ == "__main__":
    main()
