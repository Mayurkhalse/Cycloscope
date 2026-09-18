# CycoScope Data Directory & Dataset Registry

This directory contains the physical dataset registry for the **CycoScope** tropical cyclone intelligence platform. It organizes raw original observations, synthetic meteorological simulations, and final processed datasets used across all machine learning and decision-support pipelines.

---

## Directory Structure

```text
data/
├── raw/
│   ├── original/                                 # Authentic ground-truth & reference datasets
│   │   ├── ibtracs_nio_full.csv                  # NOAA NCEI IBTrACS North Indian Ocean (1842-2024)
│   │   ├── tcir_metadata.csv                     # TCIR benchmark dataset metadata fixes
│   │   ├── climatology_monthly_profiles.csv      # Monthly baseline climatology profiles (BoB & AS)
│   │   └── seed_cyclones.csv                     # Active & historical reference storms
│   │
│   └── synthetic/                                # Synthetic / empirically generated simulation datasets
│       ├── synthetic_environmental_cyclogenesis.csv # Atmospheric soundings for 48h cyclogenesis
│       └── synthetic_cyclone_tracks.csv          # Multi-timestep spatio-temporal cyclone tracks
│
├── processed/                                    # Feature-engineered datasets & training splits
│   ├── ibtracs_nio_cleaned.csv                   # Quality-controlled IBTrACS tracks with IMD categories
│   ├── cyclogenesis_processed.csv                # Final feature-engineered dataset for Cyclogenesis model
│   ├── cyclogenesis_train.csv                    # 75% Training partition for Calibrated Random Forest
│   ├── cyclogenesis_test.csv                     # 25% Testing partition for Calibrated Random Forest
│   ├── track_sequences_processed.csv             # Final multi-horizon trajectory sequence samples
│   ├── track_train_sequences.csv                 # 80% Training partition for TrackForecaster LSTM
│   ├── track_val_sequences.csv                   # 20% Validation partition for TrackForecaster LSTM
│   └── intensity_tcir_splits.csv                 # Storm-level temporal split assignments (Train/Val/Test)
│
└── README.md                                     # Dataset documentation & provenance reference
```

---

## Dataset Inventory

| Dataset File | Type | Source | Rows / Cols | Used For |
|---|---|---|---|---|
| `raw/original/ibtracs_nio_full.csv` | **Original** | NOAA NCEI IBTrACS Archive | 60,678 / 163 | Historical ground truth, track analysis & backtesting |
| `raw/original/tcir_metadata.csv` | **Original** | BoyoChen / TCIR Benchmark | 100 / 6 | TCIR benchmark storm frame indexing & metadata |
| `raw/original/climatology_monthly_profiles.csv` | **Original (Ref)** | NIO Historical Climatology DB | 24 / 7 | Statistical fallback engine & baseline trajectory vectors |
| `raw/original/seed_cyclones.csv` | **Original (Ref)** | IMD / RSMC Bulletins | 8 / 11 | Reference systems for API seeding & verification |
| `raw/synthetic/synthetic_environmental_cyclogenesis.csv` | **Synthetic** | Pipeline GPI Atmospheric Generator | 5,000 / 7 | 48-hour cyclogenesis probability model training |
| `raw/synthetic/synthetic_cyclone_tracks.csv` | **Synthetic** | Pipeline Track Kinematic Generator | 600 / 6 | Multi-horizon sequence construction for LSTM forecaster |
| `processed/ibtracs_nio_cleaned.csv` | **Processed** | Cleaned IBTrACS Archive | 17,080 / 14 | Quality-filtered storm fixes with mapped IMD categories |
| `processed/cyclogenesis_processed.csv` | **Processed** | Feature Pipeline Output | 5,000 / 7 | Input to Calibrated Random Forest Classifier |
| `processed/cyclogenesis_train.csv` | **Processed (Split)** | 75% Stratified Train Split | 3,750 / 7 | Training set for Calibrated Random Forest |
| `processed/cyclogenesis_test.csv` | **Processed (Split)** | 25% Stratified Test Split | 1,250 / 7 | Unseen test set for cyclogenesis ROC-AUC & Brier evaluation |
| `processed/track_sequences_processed.csv` | **Processed** | Multi-Horizon Sequence Pipeline | 280 / 16 | Input dataset for TrackForecaster LSTM (+6h, +12h, +24h) |
| `processed/track_train_sequences.csv` | **Processed (Split)** | 80% Train Split | 224 / 16 | Training partition for temporal LSTM |
| `processed/track_val_sequences.csv` | **Processed (Split)** | 20% Validation Split | 56 / 16 | Validation partition for loss monitoring & checkpointing |
| `processed/intensity_tcir_splits.csv` | **Processed (Split)** | Storm-level Temporal Split | 47,381 / 2 | Sample index assignments preventing frame leakage |

---

## Detailed Dataset Descriptions

### 1. `raw/original/` — Authentic Source Data
* **`ibtracs_nio_full.csv`**: Complete historical cyclone record for the North Indian Ocean basin (Bay of Bengal and Arabian Sea) from 1842 to 2024 sourced from NOAA's International Best Track Archive for Climate Stewardship (IBTrACS v04r00). Contains latitude, longitude, WMO wind speed, central pressure, and storm classifications.
* **`tcir_metadata.csv`**: Ground-truth best track labels extracted from the TCIR HDF5 archive (`TCIR-ALL_2017.h5`), including storm identifiers, timestamps, spatial coordinates, and verified peak wind speeds.
* **`climatology_monthly_profiles.csv`**: Monthly mean translational speed, bearing angle, central pressure, and wind speed compiled for Bay of Bengal and Arabian Sea basins (months 1–12). Powers the system's reliability fallback layer if live satellite feeds or ML inference nodes degrade.

### 2. `raw/synthetic/` — Generated Simulations

> [!IMPORTANT]
> **Notice on Synthetic Data:**
> Datasets in `raw/synthetic/` are generated algorithmically by the CycoScope data pipeline to model physical atmospheric relationships. They are used for training and testing ML models when real-time satellite frame pairs or environmental sounding observations are unapproved or undergoing clearance. **They must not be represented as real-world observational measurements.**

* **`synthetic_environmental_cyclogenesis.csv`**: Generated via `generate_environmental_genesis_dataset()` in `ML/training/train_cyclogenesis.py`. Implements the Emanuel-Nolan Genesis Potential Index (GPI) formulation over North Indian Ocean thermodynamic soundings:
  - `basin`: 0 (Arabian Sea), 1 (Bay of Bengal)
  - `sea_surface_temp_c`: Sea Surface Temperature (24.0°C – 32.5°C)
  - `vertical_wind_shear_knots`: 200–850 hPa deep-layer shear (3.0 – 45.0 kts)
  - `mid_troposphere_rh`: 700 hPa relative humidity (30% – 95%)
  - `vorticity_850hpa`: 850 hPa low-level relative vorticity (0.5 – 25.0 × 10⁻⁵ s⁻¹)
  - `sea_level_pressure_hpa`: Mean sea level pressure (992 – 1018 hPa)
  - `cyclogenesis_label`: Binary label (0 = No formation, 1 = Genesis within 48h)
* **`synthetic_cyclone_tracks.csv`**: Generated via `generate_synthetic_storm_tracks()` in `ML/training/train_track.py`. Generates multi-timestep storm progressions (20 synthetic cyclones × 30 three-hourly fixes = 600 records) exhibiting realistic northwestward translation and intensity lifecycle curves.

### 3. `processed/` — Transformed Features & Partitions
* **`cyclogenesis_processed.csv`**, **`cyclogenesis_train.csv`**, **`cyclogenesis_test.csv`**: Feature-engineered tabular matrices used directly by `train_cyclogenesis.py` for model fitting and evaluation (calibrated using sigmoid Platt scaling).
* **`track_sequences_processed.csv`**, **`track_train_sequences.csv`**, **`track_val_sequences.csv`**: 8-timestep historical observation windows mapped directly to multi-horizon target coordinates:
  - Lead time +6 hours (`target_6h_lat`, `target_6h_lon`, `target_6h_wind_kmh`)
  - Lead time +12 hours (`target_12h_lat`, `target_12h_lon`, `target_12h_wind_kmh`)
  - Lead time +24 hours (`target_24h_lat`, `target_24h_lon`, `target_24h_wind_kmh`)
* **`ibtracs_nio_cleaned.csv`**: Quality-filtered historical storm tracks with knots converted to km/h, valid pressure readings, and classified IMD intensity categories (Depression, Deep Depression, Cyclonic Storm, Severe Cyclonic Storm, Very Severe Cyclonic Storm, Extremely Severe Cyclonic Storm, Super Cyclonic Storm).

---

## How to Regenerate the Datasets

To regenerate all raw synthetic and processed datasets from scratch:

```powershell
# 1. Regenerate raw original registry & reference datasets
python ML/training/src/data_acquisition/export_dataset_registry.py

# 2. Regenerate synthetic cyclogenesis soundings, processed data & train/test splits
python ML/training/train_cyclogenesis.py

# 3. Regenerate synthetic cyclone tracks, multi-horizon sequences & splits
python ML/training/train_track.py

# 4. Regenerate storm-level temporal split index
python ML/training/train.py --epochs 1
```

All generation routines use fixed random seeds (`seed=42`) ensuring **100% deterministic reproducibility**.
