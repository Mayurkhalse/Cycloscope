import os
import sys
from pathlib import Path
import h5py
import torch
from torch.utils.data import Dataset
import numpy as np
import pandas as pd

# Include shared package path
sys.path.append(str(Path(__file__).resolve().parents[3]))
from shared.preprocessing import clean_channel, normalize

class TCIRDataset(Dataset):
    """
    PyTorch Dataset for TCIR Satellite data supporting both:
    1. HDF5 files (.h5) from BoyoChen/TCIR
    2. NumPy arrays (.npy) like ir.npy + vmax.npy from Kaggle (kbdharun/tropical-cyclone-intensity-regression)
    """
    def __init__(self, data_path: str, storm_ids=None, channels=("IR",), indices=None):
        self.data_path = Path(data_path)
        self.channels = channels
        self.channel_map = {"IR": 0, "WV": 1, "VIS": 2, "PMW": 3}
        self.selected_indices = [self.channel_map[c] for c in channels if c in self.channel_map]
        
        self.is_h5 = False
        self.is_npy = False
        self.h5_file = None
        self.ir_mmap = None
        self.targets = None
        
        # Determine source type
        if self.data_path.is_dir():
            h5_files = list(self.data_path.glob("*.h5")) + list(self.data_path.glob("*.hdf5"))
            npy_files = list(self.data_path.glob("*.npy"))
            if h5_files:
                self.data_path = h5_files[0]
                self.is_h5 = True
            elif npy_files:
                self.is_npy = True
                self.npy_dir = self.data_path
                self._init_npy(self.npy_dir, indices)
                return
        elif self.data_path.suffix in [".h5", ".hdf5"]:
            self.is_h5 = True
        elif self.data_path.suffix == ".npy":
            self.is_npy = True
            self.npy_dir = self.data_path.parent
            self._init_npy(self.npy_dir, indices)
            return

        if self.is_h5:
            self.h5_file = h5py.File(self.data_path, "r")
            self.info = self.h5_file["info"][:]
            self.matrix = self.h5_file["matrix"]
            
            if storm_ids is not None:
                decoded_storms = [s.decode('utf-8') if isinstance(s, bytes) else str(s) for s in storm_ids]
                self.indices = [
                    i for i, row in enumerate(self.info) 
                    if (row['storm_id'].decode('utf-8') if isinstance(row['storm_id'], bytes) else str(row['storm_id'])) in decoded_storms
                ]
            elif indices is not None:
                self.indices = indices
            else:
                self.indices = list(range(len(self.info)))
        else:
            self.indices = list(range(100))

    def _init_npy(self, npy_dir: Path, indices=None):
        # Look for image array (ir.npy or similar)
        ir_candidates = ["ir.npy", "IR.npy", "images.npy", "matrix.npy", "X.npy"]
        ir_file = None
        for cand in ir_candidates:
            if (npy_dir / cand).exists():
                ir_file = npy_dir / cand
                break
        if not ir_file:
            ir_file = list(npy_dir.glob("*.npy"))[0]
            
        print(f"[*] TCIRDataset: Memory-mapping NumPy array from {ir_file}")
        self.ir_mmap = np.load(str(ir_file), mmap_mode="r")
        total_samples = len(self.ir_mmap)
        
        # Look for target/label array (vmax.npy, labels.npy, y.npy, target.npy)
        target_candidates = ["vmax.npy", "labels.npy", "label.npy", "target.npy", "targets.npy", "y.npy", "info.npy"]
        target_file = None
        for cand in target_candidates:
            if (npy_dir / cand).exists():
                target_file = npy_dir / cand
                break
                
        if target_file:
            print(f"[*] TCIRDataset: Loading intensity targets from {target_file}")
            self.targets = np.load(str(target_file))
            # If targets are in knots, convert to km/h if max is typical knot value
            if np.nanmax(self.targets) < 200:
                self.targets = self.targets * 1.852  # convert knots to km/h
        else:
            print(f"[!] Warning: No separate labels file found in {npy_dir}. Defaulting to synthetic reference labels.")
            self.targets = np.full(total_samples, 65.0, dtype=np.float32)
            
        if indices is not None:
            self.indices = indices
        else:
            self.indices = list(range(total_samples))

    def __len__(self):
        return len(self.indices)

    def __getitem__(self, idx):
        real_idx = self.indices[idx]
        
        if self.is_npy:
            raw_img = np.array(self.ir_mmap[real_idx], dtype=np.float32)
            # If shape is (95, 95, 1) or (95, 95)
            if raw_img.ndim == 2:
                raw_img = raw_img[:, :, np.newaxis]
            
            cleaned = clean_channel(raw_img, strategy="zero")
            normalized = normalize(cleaned)
            
            # (H, W, C) -> (C, H, W)
            tensor_img = torch.tensor(normalized).permute(2, 0, 1).float()
            target_val = float(self.targets[real_idx]) if self.targets is not None else 65.0
            return tensor_img, torch.tensor(target_val, dtype=torch.float32)
            
        elif self.is_h5:
            image_data = self.matrix[real_idx]  # shape: (201, 201, 4)
            selected = image_data[:, :, self.selected_indices]
            cleaned = clean_channel(selected, strategy="zero")
            normalized = normalize(cleaned)
            
            tensor_img = torch.tensor(normalized).permute(2, 0, 1).float()
            wind_kmh = float(self.info[real_idx]['wind_kmh'])
            return tensor_img, torch.tensor(wind_kmh, dtype=torch.float32)
        else:
            img = np.random.randn(len(self.selected_indices), 95, 95).astype(np.float32)
            return torch.tensor(img), torch.tensor(55.0, dtype=torch.float32)

    def close(self):
        if hasattr(self, 'h5_file') and self.h5_file is not None:
            self.h5_file.close()
