import sys
from pathlib import Path
import h5py
import torch
from torch.utils.data import Dataset
import numpy as np

# Include shared package path
sys.path.append(str(Path(__file__).resolve().parents[3]))
from shared.preprocessing import clean_channel, normalize

class TCIRDataset(Dataset):
    """
    PyTorch Dataset for TCIR Satellite HDF5 files.
    Reads 201x201 4-channel imagery (IR, WV, VIS, PMW) and targets (wind speed km/h).
    """
    def __init__(self, h5_path: str, storm_ids=None, channels=("IR",), transform=None):
        self.h5_path = h5_path
        self.h5_file = h5py.File(h5_path, "r")
        self.info = self.h5_file["info"][:]
        self.matrix = self.h5_file["matrix"]
        
        self.channel_map = {"IR": 0, "WV": 1, "VIS": 2, "PMW": 3}
        self.selected_indices = [self.channel_map[c] for c in channels if c in self.channel_map]
        
        if storm_ids is not None:
            decoded_storms = [s.decode('utf-8') if isinstance(s, bytes) else str(s) for s in storm_ids]
            self.indices = [
                i for i, row in enumerate(self.info) 
                if (row['storm_id'].decode('utf-8') if isinstance(row['storm_id'], bytes) else str(row['storm_id'])) in decoded_storms
            ]
        else:
            self.indices = list(range(len(self.info)))

    def __len__(self):
        return len(self.indices)

    def __getitem__(self, idx):
        real_idx = self.indices[idx]
        image_data = self.matrix[real_idx]  # shape: (201, 201, 4)
        
        # Select specified channels
        selected = image_data[:, :, self.selected_indices]
        
        # Clean and normalize
        cleaned = clean_channel(selected, strategy="zero")
        normalized = normalize(cleaned)
        
        # Transpose to Channel x Height x Width format for PyTorch
        tensor_img = torch.tensor(normalized).permute(2, 0, 1).float()
        
        wind_kmh = float(self.info[real_idx]['wind_kmh'])
        target = torch.tensor(wind_kmh, dtype=torch.float32)
        
        return tensor_img, target

    def close(self):
        self.h5_file.close()
