import json
import shutil
from pathlib import Path
from datetime import date
from typing import Dict, Any

def export_model_artifacts(
    checkpoint_path: Path,
    dest_dir: Path,
    version: str,
    test_metrics: Dict[str, float],
    train_storm_count: int,
    data_source: str = "TCIR-ALL_2017"
):
    """
    Exports trained checkpoint and metadata.json to serving directory.
    This creates the clean handoff between training/ and serving/.
    """
    dest_dir.mkdir(parents=True, exist_ok=True)
    checkpoints_dest = dest_dir / "checkpoints"
    checkpoints_dest.mkdir(parents=True, exist_ok=True)
    
    # Copy best checkpoint to serving artifacts
    shutil.copy(checkpoint_path, checkpoints_dest / "best.pt")
    
    metadata: Dict[str, Any] = {
        "model_name": "intensity_regressor",
        "version": version,
        "trained_on": str(date.today()),
        "train_storms": train_storm_count,
        "val_mae_kmh": test_metrics.get("val_mae_kmh", 0.0),
        "test_mae_kmh": test_metrics.get("test_mae_kmh", 0.0),
        "test_rmse_kmh": test_metrics.get("test_rmse_kmh", 0.0),
        "data_source": data_source,
        "channels": ["IR"]
    }
    
    with open(dest_dir / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"Exported model artifacts to {dest_dir}:")
    print(f"  - Checkpoint: {checkpoints_dest / 'best.pt'}")
    print(f"  - Metadata:   {dest_dir / 'metadata.json'}")
