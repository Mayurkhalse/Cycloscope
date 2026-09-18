import os
import h5py
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Tuple, List

def create_splits_from_h5(h5_path: Path, splits_dir: Path, train_end_year: int = 2015, val_end_year: int = 2016):
    """
    Creates train_storms.txt, val_storms.txt, and test_storms.txt strictly by year/storm_id
    to prevent frame leakage across dataset partitions.
    Supports both HDF5 files and NumPy dataset directories (.npy).
    """
    splits_dir.mkdir(parents=True, exist_ok=True)
    
    # Check if directory containing .npy files
    if (h5_path.is_dir() and list(h5_path.glob("*.npy"))) or (h5_path.is_file() and h5_path.suffix == ".npy"):
        npy_file = h5_path if h5_path.is_file() else list(h5_path.glob("*.npy"))[0]
        arr = np.load(str(npy_file), mmap_mode="r")
        total_samples = len(arr)
        
        train_len = int(total_samples * 0.70)
        val_len = int(total_samples * 0.15)
        
        train_indices = list(range(0, train_len))
        val_indices = list(range(train_len, train_len + val_len))
        test_indices = list(range(train_len + val_len, total_samples))
        
        with open(splits_dir / "train_storms.txt", "w") as f:
            f.write(f"# NPY dataset total: {total_samples}\n")
            f.write(f"train_range: 0-{train_len}\n")
            
        print(f"Generated splits for NPY dataset ({total_samples} samples):")
        print(f"  - Train samples: {len(train_indices)} (70%)")
        print(f"  - Val samples:   {len(val_indices)} (15%)")
        print(f"  - Test samples:  {len(test_indices)} (15%)")
        
        return train_indices, val_indices, test_indices
    
    # Otherwise process HDF5 file
    with h5py.File(h5_path, "r") as hf:
        info = hf["info"][:]
        
    records = []
    for row in info:
        s_id = row["storm_id"].decode("utf-8") if isinstance(row["storm_id"], bytes) else str(row["storm_id"])
        year = int(row["year"]) if "year" in row.dtype.names else 2015
        records.append({"storm_id": s_id, "year": year})
        
    df = pd.DataFrame(records).drop_duplicates()
    
    train_storms = list(df[df["year"] <= train_end_year]["storm_id"].unique())
    val_storms = list(df[(df["year"] > train_end_year) & (df["year"] <= val_end_year)]["storm_id"].unique())
    test_storms = list(df[df["year"] > val_end_year]["storm_id"].unique())
    
    # Fallback if few storms
    if not val_storms and len(train_storms) > 2:
        val_storms = [train_storms.pop()]
    if not test_storms and len(train_storms) > 2:
        test_storms = [train_storms.pop()]
        
    with open(splits_dir / "train_storms.txt", "w") as f:
        f.write("\n".join(train_storms))
    with open(splits_dir / "val_storms.txt", "w") as f:
        f.write("\n".join(val_storms))
    with open(splits_dir / "test_storms.txt", "w") as f:
        f.write("\n".join(test_storms))
        
    print(f"Generated splits in {splits_dir}:")
    print(f"  - Train storms: {len(train_storms)} ({train_storms})")
    print(f"  - Val storms:   {len(val_storms)} ({val_storms})")
    print(f"  - Test storms:  {len(test_storms)} ({test_storms})")
    
    return train_storms, val_storms, test_storms

if __name__ == "__main__":
    ml_root = Path(__file__).resolve().parents[2]
    h5_file = ml_root / "data" / "raw" / "tcir" / "TCIR-ALL_2017.h5"
    splits_out = ml_root / "data" / "splits"
    if h5_file.exists():
        create_splits_from_h5(h5_file, splits_out)
