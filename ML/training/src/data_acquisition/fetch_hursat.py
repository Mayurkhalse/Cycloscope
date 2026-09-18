import os
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "raw" / "hursat"

def fetch_hursat(dest_dir: Path = DATA_DIR) -> Path:
    """
    Acquisition hook for NOAA HURSAT / INSAT satellite imagery for matched storm IDs.
    Feasibility and approval-gated; placeholder scaffold for offline acquisition.
    """
    dest_dir.mkdir(parents=True, exist_ok=True)
    marker_file = dest_dir / ".hursat_catalog.json"
    if not marker_file.exists():
        with open(marker_file, "w") as f:
            f.write('{"status": "ready", "provider": "NOAA-HURSAT-B1"}')
    return dest_dir

if __name__ == "__main__":
    fetch_hursat()
