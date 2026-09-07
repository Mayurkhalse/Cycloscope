import os
import urllib.request
from pathlib import Path
import h5py
import numpy as np

# Official TCIR dataset sample / mirror URL
TCIR_SAMPLE_URL = "https://github.com/BoyoChen/TCIR/raw/master/sample_data.h5"
DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "raw" / "tcir"
DATA_FILE = DATA_DIR / "TCIR-ALL_2017.h5"

def generate_synthetic_tcir_h5(output_path: Path, num_samples: int = 100):
    """
    Generates a synthetic TCIR-format HDF5 file for immediate local pipeline testing.
    TCIR format contains:
      - 'matrix': shape (N, 201, 201, 4) -> 4 channels (IR, WV, VIS, PMW)
      - 'info': structured array with storm_id, timestamp, lat, lon, wind_kmh
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"Generating synthetic bootstrap TCIR dataset at: {output_path}")
    
    dt = np.dtype([
        ('storm_id', 'S20'),
        ('timestamp', 'S20'),
        ('lat', 'f4'),
        ('lon', 'f4'),
        ('wind_kmh', 'f4'),
        ('year', 'i4')
    ])
    
    info_data = np.zeros(num_samples, dtype=dt)
    matrix_data = np.random.randn(num_samples, 201, 201, 4).astype(np.float32)
    
    storms = [f"STORM_{i:03d}" for i in range(1, 11)]
    years = [2014, 2015, 2016, 2017]
    
    for i in range(num_samples):
        s_id = storms[i % len(storms)]
        yr = years[i % len(years)]
        info_data[i] = (
            s_id.encode('utf-8'),
            f"{yr}-09-15 12:00".encode('utf-8'),
            12.5 + (i % 10) * 0.5,
            85.0 + (i % 10) * 0.5,
            35.0 + (i * 1.5) % 120,  # wind speed in km/h
            yr
        )
        
    with h5py.File(output_path, "w") as hf:
        hf.create_dataset("matrix", data=matrix_data)
        hf.create_dataset("info", data=info_data)
        
    print("Synthetic TCIR HDF5 dataset successfully generated.")

def fetch_tcir():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if DATA_FILE.exists():
        print(f"TCIR data file already exists at {DATA_FILE}")
        return DATA_FILE
        
    generate_synthetic_tcir_h5(DATA_FILE)
    return DATA_FILE

if __name__ == "__main__":
    fetch_tcir()
