"""
Dataset Registry Exporter
Extracts and registers raw original source datasets and cleaned reference data
into the unified top-level data/ directory structure with helpful logging.
"""
import sys
import shutil
from pathlib import Path
import pandas as pd
import h5py

# Define project roots
PROJECT_ROOT = Path(__file__).resolve().parents[4]
ML_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data"

RAW_ORIG_DIR = DATA_DIR / "raw" / "original"
RAW_SYN_DIR = DATA_DIR / "raw" / "synthetic"
PROCESSED_DIR = DATA_DIR / "processed"

def ensure_directories():
    RAW_ORIG_DIR.mkdir(parents=True, exist_ok=True)
    RAW_SYN_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

def export_ibtracs():
    src_full = ML_ROOT / "data" / "raw" / "ibtracs" / "ibtracs_nio_full.csv"
    dst_full = RAW_ORIG_DIR / "ibtracs_nio_full.csv"
    if src_full.exists():
        shutil.copy2(src_full, dst_full)
        df_full = pd.read_csv(dst_full, low_memory=False, skiprows=[1])
        print(f"[DATA] Saved raw original dataset:")
        print(f"       Rows: {len(df_full):,}")
        print(f"       Columns: {df_full.shape[1]}")
        print(f"       Path: {dst_full.relative_to(PROJECT_ROOT)}")

    src_clean = ML_ROOT / "data" / "processed" / "ibtracs_nio_cleaned.csv"
    dst_clean = PROCESSED_DIR / "ibtracs_nio_cleaned.csv"
    if src_clean.exists():
        shutil.copy2(src_clean, dst_clean)
        df_clean = pd.read_csv(dst_clean, low_memory=False)
        print(f"[DATA] Saved processed dataset:")
        print(f"       Rows: {len(df_clean):,}")
        print(f"       Columns: {df_clean.shape[1]}")
        print(f"       Path: {dst_clean.relative_to(PROJECT_ROOT)}")

def export_tcir_metadata():
    h5_path = ML_ROOT / "data" / "raw" / "tcir" / "TCIR-ALL_2017.h5"
    dst_csv = RAW_ORIG_DIR / "tcir_metadata.csv"
    if h5_path.exists():
        with h5py.File(h5_path, "r") as hf:
            info = hf["info"][:]
        records = []
        for row in info:
            s_id = row["storm_id"].decode("utf-8") if isinstance(row["storm_id"], bytes) else str(row["storm_id"])
            ts = row["timestamp"].decode("utf-8") if isinstance(row["timestamp"], bytes) else str(row["timestamp"])
            records.append({
                "storm_id": s_id,
                "timestamp": ts,
                "lat": float(row["lat"]),
                "lon": float(row["lon"]),
                "wind_kmh": float(row["wind_kmh"]),
                "year": int(row["year"]) if "year" in row.dtype.names else 2017
            })
        df_tcir = pd.DataFrame(records)
        df_tcir.to_csv(dst_csv, index=False)
        print(f"[DATA] Saved raw original dataset:")
        print(f"       Rows: {len(df_tcir):,}")
        print(f"       Columns: {df_tcir.shape[1]}")
        print(f"       Path: {dst_csv.relative_to(PROJECT_ROOT)}")

def export_climatology_profiles():
    # Climatology monthly profiles from backend seed definition
    climatology_records = []
    # Bay of Bengal (Months 1-12)
    for m in range(1, 13):
        is_peak = m in [4, 5, 10, 11, 12]
        climatology_records.append({
            "basin": "Bay of Bengal",
            "month": m,
            "avgWindSpeedKmh": 95 if is_peak else 65,
            "avgPressureHpa": 984 if is_peak else 996,
            "avgTrackBearingDeg": 305 if m >= 10 else 325,
            "avgTrackSpeedKmh": 16 if is_peak else 12,
            "sampleSize": 75 if is_peak else 30
        })
    # Arabian Sea (Months 1-12)
    for m in range(1, 13):
        is_peak = m in [5, 6, 10, 11]
        climatology_records.append({
            "basin": "Arabian Sea",
            "month": m,
            "avgWindSpeedKmh": 85 if is_peak else 60,
            "avgPressureHpa": 988 if is_peak else 998,
            "avgTrackBearingDeg": 300,
            "avgTrackSpeedKmh": 14 if is_peak else 11,
            "sampleSize": 45 if is_peak else 20
        })
    df_clim = pd.DataFrame(climatology_records)
    dst_clim = RAW_ORIG_DIR / "climatology_monthly_profiles.csv"
    df_clim.to_csv(dst_clim, index=False)
    print(f"[DATA] Saved raw original reference dataset:")
    print(f"       Rows: {len(df_clim):,}")
    print(f"       Columns: {df_clim.shape[1]}")
    print(f"       Path: {dst_clim.relative_to(PROJECT_ROOT)}")

def export_seed_cyclones():
    seed_cyclones = [
        {"cycloneId": "IO_2026_03", "name": "Remal", "basin": "Bay of Bengal", "season": 2026, "status": "active", "category": "Severe Cyclonic Storm", "windSpeedKmh": 115, "pressureHpa": 980, "lat": 18.5, "lon": 88.8, "source": "live-feed"},
        {"cycloneId": "IO_2026_02", "name": "Tej", "basin": "Arabian Sea", "season": 2026, "status": "active", "category": "Very Severe Cyclonic Storm", "windSpeedKmh": 155, "pressureHpa": 978, "lat": 14.8, "lon": 56.4, "source": "live-feed"},
        {"cycloneId": "IO_2026_01", "name": "Asna", "basin": "Arabian Sea", "season": 2026, "status": "active", "category": "Deep Depression", "windSpeedKmh": 65, "pressureHpa": 994, "lat": 23.2, "lon": 67.5, "source": "live-feed"},
        {"cycloneId": "IO_2026_04", "name": "Dana", "basin": "Bay of Bengal", "season": 2026, "status": "active", "category": "Cyclonic Storm", "windSpeedKmh": 85, "pressureHpa": 988, "lat": 16.2, "lon": 89.1, "source": "live-feed"},
        {"cycloneId": "IO_2023_02", "name": "Biparjoy", "basin": "Arabian Sea", "season": 2023, "status": "historical", "category": "Extremely Severe Cyclonic Storm", "windSpeedKmh": 165, "pressureHpa": 954, "lat": 23.2, "lon": 68.6, "source": "IBTrACS"},
        {"cycloneId": "IO_2023_01", "name": "Mocha", "basin": "Bay of Bengal", "season": 2023, "status": "historical", "category": "Extremely Severe Cyclonic Storm", "windSpeedKmh": 215, "pressureHpa": 938, "lat": 20.1, "lon": 92.8, "source": "IBTrACS"},
        {"cycloneId": "IO_2021_01", "name": "Tauktae", "basin": "Arabian Sea", "season": 2021, "status": "historical", "category": "Extremely Severe Cyclonic Storm", "windSpeedKmh": 220, "pressureHpa": 950, "lat": 20.8, "lon": 71.1, "source": "IBTrACS"},
        {"cycloneId": "IO_2020_01", "name": "Amphan", "basin": "Bay of Bengal", "season": 2020, "status": "historical", "category": "Super Cyclonic Storm", "windSpeedKmh": 260, "pressureHpa": 920, "lat": 21.7, "lon": 88.3, "source": "IBTrACS"}
    ]
    df_seeds = pd.DataFrame(seed_cyclones)
    dst_seeds = RAW_ORIG_DIR / "seed_cyclones.csv"
    df_seeds.to_csv(dst_seeds, index=False)
    print(f"[DATA] Saved raw original reference dataset:")
    print(f"       Rows: {len(df_seeds):,}")
    print(f"       Columns: {df_seeds.shape[1]}")
    print(f"       Path: {dst_seeds.relative_to(PROJECT_ROOT)}")

def main():
    print("=== Exporting Dataset Registry into data/ ===")
    ensure_directories()
    export_ibtracs()
    export_tcir_metadata()
    export_climatology_profiles()
    export_seed_cyclones()
    print("=== Dataset Registry Export Complete ===\n")

if __name__ == "__main__":
    main()
