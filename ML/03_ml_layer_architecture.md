# ML Layer — Architecture & Logic Specification (Detailed)
**Stack:** Python + FastAPI, fully independent service from the Node/Express backend

---

## 1. Core Principle

The ML layer is a standalone microservice with three folders. `ingestion/` and `training/` never run inside a live request; `serving/` is the only one that does.

```
ml-layer/
├── ingestion/    # fetches live satellite frames from MOSDAC and preps them for inference
├── training/     # builds and exports versioned model artifacts — offline, not in the request path
└── serving/      # FastAPI app that loads exported artifacts, calls ingestion for live data, answers HTTP requests
```

`training/` produces model files. `ingestion/` produces fresh image data. `serving/` consumes both. The Node backend no longer needs to source or pass satellite imagery at all — it just tells `serving/` which cyclone or region to look at, and `serving/` handles fetching the actual frame internally.

---

## 1A. `ingestion/` — Live Satellite Acquisition (MOSDAC / INSAT-3D, INSAT-3DR)

### ⚠️ This is a blocking prerequisite, not something to build against yet

MOSDAC access requires registration and account approval before any of this code can actually run — once your registration is complete and your account is approved, you become eligible to use the application for downloading datasets. Submit that registration now, in parallel with everything else, since approval time is outside your control.

### How MOSDAC access actually works

- **Authentication**: MOSDAC Single Sign-On (SSO) credentials, used for both the web portal and the API-based Data Download API.
- **Programmatic access**: MOSDAC provides an official Data Download API where you specify `search_parameters` (recommended to set `startTime`/`endTime`, otherwise it fetches the dataset's entire lifespan) and optional `download_settings` (e.g. organizing downloaded files by date).
- **Near-real-time data specifically**: this is the critical detail for a live pipeline — near-real-time delivery requires placing a **standing order**, and a standing order can only be placed for a maximum of one month at a time, after which it must be placed again. This means your ingestion service needs an operational reminder/renewal step, not just a one-time setup.
- **Rate/lockout behavior**: entering incorrect credentials three times consecutively locks the account for 1 hour — the client below handles this with backoff rather than blind retries.
- **Exact product format** (HDF5 vs GeoTIFF vs other) and the precise resolution/channel layout for the specific INSAT-3D/3DR product you'll request should be confirmed directly against the product page for the dataset you order, since this varies by product — don't hardcode a parser before confirming the format for your specific standing order.

### Folder structure

```
ingestion/
├── mosdac_client.py       # SSO auth, standing-order management, API-based download calls
├── standing_order_monitor.py  # tracks the 1-month expiry, alerts before renewal is needed
├── fetch_latest_frame.py  # pulls the most recent frame near each synoptic tick (00/06/12/18 UTC)
├── region_config.py       # fixed bounding boxes for Bay of Bengal + Arabian Sea
├── region_crop.py         # crops the full-disk frame down to each fixed region
├── live_preprocessor.py   # reuses the SAME clean()/normalize() functions as training/serving
└── requirements.txt
```

### Fixed-region scanning (chosen approach for detection)

Since detection has to look somewhere before a storm exists to be centered on, `region_config.py` defines two static boxes scanned every cycle rather than the whole satellite disk:

```python
# ingestion/region_config.py
SCAN_REGIONS = {
    "bay_of_bengal": {"lat_min": 5, "lat_max": 22, "lon_min": 80, "lon_max": 100},
    "arabian_sea":   {"lat_min": 5, "lat_max": 25, "lon_min": 55, "lon_max": 78},
}
```

For an already-confirmed active system, ingestion instead crops around that storm's last known position (same 7-degree-radius convention as training, from Step 3 of the training pipeline) rather than the whole fixed box — tighter crop, more relevant frame.

```python
# ingestion/mosdac_client.py
import time
import requests

class MosdacClient:
    def __init__(self, username, password, base_url="https://mosdac.gov.in"):
        self.session = requests.Session()
        self.username = username
        self.password = password
        self.failed_attempts = 0

    def login(self):
        if self.failed_attempts >= 3:
            raise RuntimeError("Account temporarily locked — back off for 1 hour before retrying")
        resp = self.session.post(f"{self.base_url}/sso/login", data={
            "username": self.username, "password": self.password
        })
        if resp.status_code != 200:
            self.failed_attempts += 1
            raise RuntimeError("MOSDAC login failed")
        self.failed_attempts = 0
        return resp

    def fetch_latest(self, product_code, start_time, end_time):
        # Uses the official Data Download API's search_parameters
        return self.session.get(f"{self.base_url}/download-api/search", params={
            "product": product_code, "startTime": start_time, "endTime": end_time,
        })
```

```python
# ingestion/standing_order_monitor.py
from datetime import datetime, timedelta

def check_expiry(order_placed_on: datetime, max_days=30, warn_days_before=5):
    expiry = order_placed_on + timedelta(days=max_days)
    days_left = (expiry - datetime.utcnow()).days
    if days_left <= warn_days_before:
        logger.warning(f"MOSDAC standing order expires in {days_left} day(s) — renew it")
    return days_left
```

### How `serving/` calls into this

`serving/` imports `ingestion/` directly (both are Python, same service) — this is the one intentional coupling in the whole system, since fetching live data and running inference on it are two steps of the same request:

```python
# app/routers/live.py
from ingestion.fetch_latest_frame import get_latest_region_frame, get_latest_frame_for_cyclone

@router.post("/live/scan-regions")
def scan_regions():
    results = []
    for region_name in SCAN_REGIONS:
        frame = get_latest_region_frame(region_name)
        tensor = preprocess(frame)                 # same preprocess_request.py from Step 2 of serving
        detection = predict_detection(tensor)
        results.append({"region": region_name, **detection})
    return results

@router.post("/live/update-cyclone/{cyclone_id}")
def update_cyclone(cyclone_id: str, last_known_lat: float, last_known_lon: float):
    frame = get_latest_frame_for_cyclone(last_known_lat, last_known_lon)
    tensor = preprocess(frame)
    intensity = predict_intensity(tensor)
    track = predict_track(cyclone_id, tensor)
    return {"cyclone_id": cyclone_id, "intensity": intensity, "track": track}
```

### What changes in the backend because of this

The Node backend's `predictionOrchestrator.js` (from the scheduling doc) gets simpler — it no longer builds or passes an `image_base64` payload at all, it just calls `/live/scan-regions` and `/live/update-cyclone/:id`:

```js
// src/services/mlClient.js — updated calls
async function scanRegions() {
  return axios.post(`${ML_SERVICE_URL}/live/scan-regions`);
}
async function updateCyclone(cycloneId, lastKnownLat, lastKnownLon) {
  return axios.post(`${ML_SERVICE_URL}/live/update-cyclone/${cycloneId}`, { lastKnownLat, lastKnownLon });
}
```

**New fallback trigger to add to the backend's fallback layer:** a MOSDAC fetch failure (expired standing order, feed outage, account lockout) is a distinct failure mode from a model error, and should route to the same climatology fallback — worth logging separately in `AlertLog` so you can tell "the model failed" apart from "we couldn't even get a satellite frame."

### Environment variables (`ingestion/.env` or `serving/.env`)

```
MOSDAC_USERNAME=
MOSDAC_PASSWORD=
MOSDAC_PRODUCT_CODE=          # confirm exact code for the INSAT-3D/3DR product ordered
MOSDAC_STANDING_ORDER_DATE=   # date the current standing order was placed, for expiry tracking
```

---

## 2. `training/` — Step by Step

### Step 1 — Acquire

Two data sources feed this project at different stages: **TCIR** (to bootstrap a working pipeline immediately) and **HURSAT + IBTrACS** (the real North Indian Ocean data, once your feasibility study from earlier is done).

**Getting TCIR:**
- Source: hosted by the dataset authors (Hsuan-Tien Lin's lab, NTU) and mirrored at `github.com/BoyoChen/TCIR`
- No auth/API key required — direct HTTP download of HDF5 files
- Two size tiers are provided: a smaller subset for fast local iteration, and the full dataset for real training. Start with the small one.
- Each HDF5 file bundles: a 4-channel image array (IR, WV, VIS, PMW) at 201×201 pixels per storm-timestep, and a paired metadata table (storm ID, ISO timestamp, lat/lon, best-track wind speed in knots, basin)

> ⚠️ **Basin-mismatch caveat:** TCIR is global, not North Indian Ocean-specific — it draws from every major TC basin worldwide, and the North Indian Ocean has far fewer cyclones per year than the Northwest Pacific or Atlantic. When you filter TCIR down to the North Indian Ocean, expect a fairly small subset — check the actual count before assuming it's enough for a solid basin-specific baseline. TCIR's best-track labels also come from JTWC/HURDAT2 conventions, not IMD's — wind-speed values and category cutoffs won't line up perfectly once you swap in IBTrACS North Indian Ocean data. This is fine for the bootstrap phase (the goal here is proving the pipeline works, not basin accuracy), but **v0.1's accuracy numbers should not be presented as representative of North Indian Ocean performance** — that claim only becomes valid after retraining on real HURSAT/IBTrACS NIO data in v0.2 (Step 4 of the build order, §7).

```python
# src/data_acquisition/fetch_tcir_benchmark.py
import urllib.request
from pathlib import Path

TCIR_URL = "<official HDF5 download link from BoyoChen/TCIR README>"
DEST = Path("data/raw/tcir/TCIR-ALL_2017.h5")

def download():
    DEST.parent.mkdir(parents=True, exist_ok=True)
    if DEST.exists():
        print("Already downloaded.")
        return
    urllib.request.urlretrieve(TCIR_URL, DEST)
    print(f"Saved to {DEST}")

if __name__ == "__main__":
    download()
```

**Getting IBTrACS (real ground truth for North Indian Ocean):**
- Source: NOAA NCEI, CSV or NetCDF, public, no auth
- Download the "since 1980" or basin-specific subset to keep file size manageable
- Filter immediately to `BASIN == 'NI'` (North Indian) on load

**Getting HURSAT/INSAT imagery:**
- Requires matching storm IDs and timestamps from IBTrACS first, then pulling the corresponding satellite frames
- This is the step your earlier feasibility study should have already sized (number of storms, frame availability) — don't start bulk-downloading before that's confirmed

Every acquisition script should be idempotent (skip if already downloaded) and log exactly what version/date range was pulled — this feeds the reproducibility metadata in Step 9.

---

### Step 2 — Clean

For TCIR specifically: the dataset ships with missing values already filled as `NaN` in some channels (especially VIS, which is unusable at night). Handle explicitly:

```python
# src/preprocessing/clean.py
import numpy as np

def clean_channel(array: np.ndarray, strategy: str = "zero") -> np.ndarray:
    if strategy == "zero":
        return np.nan_to_num(array, nan=0.0)
    if strategy == "interpolate":
        # simple linear fill along spatial axis for small gaps
        mask = np.isnan(array)
        array[mask] = np.interp(
            np.flatnonzero(mask), np.flatnonzero(~mask), array[~mask]
        )
        return array
    raise ValueError(strategy)
```

For your own HURSAT/IBTrACS data: drop duplicate track fixes (same storm+timestamp appearing twice), drop frames where cloud cover fully obscures the center (flag via a simple brightness-temperature threshold check), and log how many samples were dropped and why — this number matters later when someone asks "how much data did you actually end up training on."

---

### Step 3 — Crop / Align (only needed for your own satellite data — TCIR is pre-cropped)

TCIR images are already 201×201 and storm-centered, so this step is a no-op for the bootstrap phase. For your own HURSAT/INSAT imagery:

```python
# src/preprocessing/crop_patches.py
def crop_around_center(full_image, center_lat, center_lon, grid_resolution_deg, radius_deg=7.0):
    """
    Mirrors TCIR's convention: 7-degree radius box centered on the storm.
    Keeping this consistent with TCIR means your custom-trained model
    stays compatible with the same serving preprocessing code.
    """
    half_px = int(radius_deg / grid_resolution_deg)
    center_px = latlon_to_pixel(full_image, center_lat, center_lon)
    return full_image[
        center_px[0]-half_px:center_px[0]+half_px,
        center_px[1]-half_px:center_px[1]+half_px,
    ]
```

Matching TCIR's 7-degree-radius, storm-centered convention here is deliberate — it means the same `preprocess_request.py` code in `serving/` works whether the loaded model was trained on TCIR or on your own data.

---

### Step 4 — Label

Two label types, both from best-track (TCIR's bundled metadata, or IBTrACS for custom data):

```python
# src/preprocessing/build_labels.py
IMD_CATEGORIES = [
    (0, 31, "Depression"),
    (31, 49, "Deep Depression"),
    (49, 62, "Cyclonic Storm"),
    (62, 88, "Severe Cyclonic Storm"),
    (88, 118, "Very Severe Cyclonic Storm"),
    (118, 166, "Extremely Severe Cyclonic Storm"),
    (166, 999, "Super Cyclonic Storm"),
]

def wind_to_category(wind_kmh: float) -> str:
    for low, high, label in IMD_CATEGORIES:
        if low <= wind_kmh < high:
            return label
    return "Unknown"
```

Produce **both** targets per sample — continuous wind speed (regression) and IMD category (classification) — as discussed earlier, so a near-boundary wind speed doesn't create an artificial hard classification error during evaluation.

---

### Step 5 — Split (storm-level, never random)

```python
# src/preprocessing/split.py
def split_by_year(metadata_df, train_end_year=2014, val_end_year=2016):
    train = metadata_df[metadata_df.year <= train_end_year]
    val = metadata_df[(metadata_df.year > train_end_year) & (metadata_df.year <= val_end_year)]
    test = metadata_df[metadata_df.year > val_end_year]
    return train.storm_id.unique(), val.storm_id.unique(), test.storm_id.unique()
```

Write the resulting storm ID lists to `data/splits/*.txt` and have the Dataset class filter by these IDs — never by a random row-level `train_test_split`, which would leak frames from the same storm across splits.

---

### Step 6 — Train

**Dataset class:**
```python
# src/datasets/cyclone_image_dataset.py
import h5py
import torch
from torch.utils.data import Dataset

class TCIRDataset(Dataset):
    def __init__(self, h5_path, storm_ids, channels=("IR",)):
        self.h5 = h5py.File(h5_path, "r")
        self.metadata = self.h5["info"][:]  # storm_id, wind_kmh, etc.
        self.indices = [i for i, m in enumerate(self.metadata) if m["storm_id"] in storm_ids]
        self.channels = channels

    def __len__(self):
        return len(self.indices)

    def __getitem__(self, idx):
        i = self.indices[idx]
        image = self.h5["matrix"][i]          # shape: (201, 201, 4)
        channel_idx = {"IR": 0, "WV": 1, "VIS": 2, "PMW": 3}
        img = image[:, :, [channel_idx[c] for c in self.channels]]
        img = clean_channel(img, strategy="zero")
        img = normalize(img)                   # per-channel mean/std, computed once on train split
        wind_kmh = self.metadata[i]["wind_kmh"]
        return torch.tensor(img).permute(2, 0, 1).float(), torch.tensor(wind_kmh).float()
```

**Model (baseline — start here, not with anything fancy):**
```python
# src/models/intensity_regressor.py
import torch.nn as nn
from torchvision.models import resnet18

class IntensityRegressor(nn.Module):
    def __init__(self, in_channels=1):
        super().__init__()
        self.backbone = resnet18(weights=None)
        self.backbone.conv1 = nn.Conv2d(in_channels, 64, kernel_size=7, stride=2, padding=3, bias=False)
        self.backbone.fc = nn.Linear(self.backbone.fc.in_features, 1)  # single wind-speed output

    def forward(self, x):
        return self.backbone(x).squeeze(-1)
```

**Training loop:**
```python
# src/train.py
import torch
from torch.utils.data import DataLoader

def train_one_epoch(model, loader, optimizer, criterion, device):
    model.train()
    total_loss = 0.0
    for images, targets in loader:
        images, targets = images.to(device), targets.to(device)
        optimizer.zero_grad()
        preds = model(images)
        loss = criterion(preds, targets)
        loss.backward()
        optimizer.step()
        total_loss += loss.item() * images.size(0)
    return total_loss / len(loader.dataset)

# entrypoint: python train.py --task intensity --channels IR --epochs 30
if __name__ == "__main__":
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = IntensityRegressor(in_channels=1).to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)
    criterion = torch.nn.MSELoss()
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)

    best_val_mae = float("inf")
    for epoch in range(30):
        train_loss = train_one_epoch(model, train_loader, optimizer, criterion, device)
        val_mae = validate(model, val_loader, device)          # Step 7
        print(f"epoch {epoch}: train_loss={train_loss:.3f} val_mae={val_mae:.3f}")
        if val_mae < best_val_mae:
            best_val_mae = val_mae
            torch.save(model.state_dict(), "experiments/run1/checkpoints/best.pt")
```

Key defaults to start with: IR channel only, batch size 32, Adam at 1e-4, MSE loss on wind speed (knots or km/h — pick one and be consistent end-to-end into the API response), 30 epochs with early stopping on validation MAE.

---

### Step 7 — Validate

```python
# src/validate.py
import torch

@torch.no_grad()
def validate(model, loader, device):
    model.eval()
    errors = []
    for images, targets in loader:
        images, targets = images.to(device), targets.to(device)
        preds = model(images)
        errors.append(torch.abs(preds - targets))
    return torch.cat(errors).mean().item()
```

Run this every epoch during training (as shown above) to drive early stopping and checkpoint selection — never select your final model based on test-set performance.

---

### Step 8 — Test

Run once, at the very end, on the untouched test split (2017 storms if following the year-split convention):

```python
# src/test.py
def run_test(model, test_loader, device):
    mae = validate(model, test_loader, device)          # reuse validate()
    rmse = compute_rmse(model, test_loader, device)
    print(f"TEST — MAE: {mae:.2f} km/h, RMSE: {rmse:.2f} km/h")
    return {"test_mae_kmh": mae, "test_rmse_kmh": rmse}
```

Log this result into the experiment's `metrics.json` — it's what gets copied into the export metadata in Step 9 and what the backend/frontend can eventually surface as "model accuracy" if you want that transparency on the dashboard.

---

### Step 9 — Export

```python
# src/export_model.py
import json
import shutil
from datetime import date

def export(model_path, version, test_metrics, train_storm_count, data_source):
    dest_dir = f"../serving/model_artifacts/{version}"
    shutil.copytree("experiments/run1", dest_dir, dirs_exist_ok=True)
    metadata = {
        "model_name": "intensity_regressor",
        "version": version,
        "trained_on": str(date.today()),
        "train_storms": train_storm_count,
        "val_mae_kmh": test_metrics.get("val_mae_kmh"),
        "test_mae_kmh": test_metrics["test_mae_kmh"],
        "data_source": data_source,          # e.g. "TCIR-2003-2017" or "HURSAT-NIO-v1"
    }
    with open(f"{dest_dir}/metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)
```

This is the handoff point to `serving/` — nothing in the serving code should ever read from `training/` directly; it only reads from `serving/model_artifacts/<version>/`.

---

## 2A. Track Prediction — Detailed Steps

**Feasible with TCIR now** — each sample carries `storm_id`, `timestamp`, `lat`, `lon`, and `wind_kmh`, and storms have multiple ~3-hourly frames. Sequences can be built directly from the existing bootstrap data; no new data source is needed to get this working end to end.

### Step 1 — Build sequences from TCIR metadata

```python
# src/preprocessing/build_sequences.py
def build_sequences(metadata_df, window=8, horizon_steps=(2, 4, 8)):
    """
    window=8 prior 3-hourly frames (~24h of history)
    horizon_steps in units of 3h steps: 2=+6h, 4=+12h, 8=+24h
    """
    sequences = []
    for storm_id, group in metadata_df.groupby("storm_id"):
        group = group.sort_values("timestamp").reset_index(drop=True)
        for i in range(window, len(group) - max(horizon_steps)):
            past = group.iloc[i - window:i]
            targets = {h: group.iloc[i + h] for h in horizon_steps}
            sequences.append({"storm_id": storm_id, "past": past, "targets": targets})
    return sequences
```

Split these sequences by `storm_id` using the same train/val/test storm lists from Step 5 of the intensity pipeline — a sequence must never span storms that appear in different splits.

### Step 2 — Persistence baseline (build this before any neural net)

```python
# src/models/persistence_baseline.py
def persistence_forecast(past_sequence, horizon_hours):
    """Naive baseline: assume storm continues at its current bearing and speed."""
    last, second_last = past_sequence.iloc[-1], past_sequence.iloc[-2]
    dt_hours = (last.timestamp - second_last.timestamp).total_seconds() / 3600
    dlat = (last.lat - second_last.lat) / dt_hours * horizon_hours
    dlon = (last.lon - second_last.lon) / dt_hours * horizon_hours
    return last.lat + dlat, last.lon + dlon, last.wind_kmh
```

Run this on the test split and record its MAE/position-error before training anything else. If your LSTM can't beat this, the LSTM isn't adding value yet — this is a real risk with cyclone track models and worth checking early, not after weeks of tuning.

### Step 3 — Dataset class (image embeddings + numeric features per timestep)

```python
# src/datasets/sequence_dataset.py
class CycloneSequenceDataset(Dataset):
    def __init__(self, sequences, image_encoder, channels=("IR",)):
        self.sequences = sequences
        self.image_encoder = image_encoder   # a frozen or fine-tuned CNN, e.g. the intensity model's backbone

    def __getitem__(self, idx):
        seq = self.sequences[idx]
        frame_embeddings = [self.image_encoder(load_image(row)) for _, row in seq["past"].iterrows()]
        numeric = seq["past"][["lat", "lon", "wind_kmh"]].values  # normalize before use
        targets = {h: (t.lat, t.lon, t.wind_kmh) for h, t in seq["targets"].items()}
        return torch.stack(frame_embeddings), torch.tensor(numeric).float(), targets
```

Reusing the intensity model's trained CNN backbone as a frozen feature extractor here avoids training a second image model from scratch — a practical shortcut worth taking for the MVP.

### Step 4 — Model (LSTM over the sequence, multi-horizon output head)

```python
# src/models/temporal_lstm.py
class TrackForecaster(nn.Module):
    def __init__(self, embedding_dim=512, numeric_dim=3, hidden_dim=128, horizons=3):
        super().__init__()
        self.lstm = nn.LSTM(input_size=embedding_dim + numeric_dim, hidden_size=hidden_dim, batch_first=True)
        self.heads = nn.ModuleList([nn.Linear(hidden_dim, 3) for _ in range(horizons)])  # dlat, dlon, wind

    def forward(self, frame_embeddings, numeric):
        x = torch.cat([frame_embeddings, numeric], dim=-1)
        _, (h_n, _) = self.lstm(x)
        return [head(h_n[-1]) for head in self.heads]   # one output per horizon (+6h, +12h, +24h)
```

### Step 5 — Train / validate / test

Same shape as the intensity pipeline (Steps 6–8 above): MSE loss per horizon (sum or weighted average across the three), early stopping on validation position-error, final test-set comparison against the persistence baseline from Step 2. Log both MAE-in-km (haversine distance from predicted to actual lat/lon) and wind-speed MAE.

### Step 6 — Export & serve

Exports the same way as intensity (`metadata.json` + versioned checkpoint). Serving endpoint:

```python
# app/routers/track.py
@router.post("/predict/track")
def predict_track(req: TrackPredictionRequest):
    embeddings, numeric = preprocess_sequence(req.past_frames)
    model, metadata = get_track_model()
    outputs = model(embeddings, numeric)
    return TrackPredictionResponse(
        cyclone_id=req.cyclone_id,
        forecast=[
            {"lead_time_hours": h, "lat": o[0], "lon": o[1], "wind_speed_kmh": o[2]}
            for h, o in zip([6, 12, 24], outputs)
        ],
        model_version=metadata["version"],
    )
```

The Node backend maps this directly into `TrackPoint` documents with `type: "predicted"`.

---

## 2B. Cyclogenesis — Detailed Steps (not achievable with TCIR — scoped for later)

TCIR only contains frames centered on storms that already exist. Cyclogenesis needs the opposite: regions with **no storm yet**, labeled by whether one formed within the next 48h. This requires a different data pipeline entirely — noting it here so it's scoped, not skipped.

### What's actually needed before this can be built

1. **IBTrACS genesis timestamps** — the first recorded fix of each storm marks when it "became" a tropical cyclone. The 48h window *before* that timestamp, in that region, is a positive sample.
2. **Negative samples** — ocean regions/times where no genesis occurred in the following 48h. These need to be sampled deliberately (e.g. random ocean patches during cyclone season, weighted toward regions with some convective activity so the model doesn't just learn "calm ocean = no genesis," which would be a trivially easy and useless shortcut).
3. **ERA5 environmental grids** for both positive and negative regions/times: SST, wind shear, mid-level humidity, vorticity — the variables meteorologically associated with genesis. This is tabular/gridded data, not satellite imagery, so the model architecture differs from detection/intensity.

### Planned dataset shape (once ERA5 access is confirmed)

```python
# src/preprocessing/build_cyclogenesis_labels.py (not runnable yet — depends on ERA5 acquisition)
def label_genesis_windows(ibtracs_df, era5_grid, negative_sample_rate=1.0):
    positives = []
    for storm_id, group in ibtracs_df.groupby("storm_id"):
        genesis_time = group.timestamp.min()
        genesis_loc = group.iloc[0][["lat", "lon"]]
        window_start = genesis_time - timedelta(hours=48)
        env_features = era5_grid.sample(genesis_loc, window_start, genesis_time)
        positives.append({"features": env_features, "label": 1})
    negatives = sample_negative_regions(era5_grid, ibtracs_df, rate=negative_sample_rate)
    return positives + negatives
```

### Planned model (MVP: tabular, not a CNN)

Since inputs here are environmental variables at a point/region rather than an image, an XGBoost classifier on the ERA5-derived features is a reasonable, interpretable MVP — matching the earlier project guide's own model-role table (Model B used XGBoost/Random Forest for exactly this reason). A CNN over a small regional grid patch is a reasonable upgrade later, but XGBoost with SHAP explainability is a better starting point since it directly tells you which environmental factor drove a given probability.

```python
# src/models/cyclogenesis_classifier.py (planned)
import xgboost as xgb

def train_cyclogenesis_model(X_train, y_train):
    model = xgb.XGBClassifier(n_estimators=300, max_depth=5, eval_metric="logloss")
    model.fit(X_train, y_train)
    return model
```

### Serving shape (once trained)

```python
# app/routers/cyclogenesis.py (planned)
@router.post("/predict/cyclogenesis")
def predict_cyclogenesis(req: CyclogenesisRequest):
    features = extract_era5_features(req.region, req.timestamp)
    model, metadata = get_cyclogenesis_model()
    probability = model.predict_proba([features])[0][1]
    return CyclogenesisResponse(
        region=req.region, probability_48h=probability, model_version=metadata["version"]
    )
```

**Bottom line on sequencing:** track prediction can be prototyped in this same TCIR-bootstrap phase. Cyclogenesis genuinely cannot — it's blocked on your ERA5 acquisition and the genesis-window labeling logic above, which should happen alongside (not before) your HURSAT/IBTrACS feasibility work from earlier.

---

## 3. `serving/` — Step by Step

### Step 1 — Startup: load model once, not per-request

```python
# app/models/model_loader.py
import torch
import json
from functools import lru_cache

@lru_cache(maxsize=1)
def get_intensity_model():
    version = "v1.2"   # or read from env var MODEL_VERSION
    path = f"model_artifacts/{version}"
    model = IntensityRegressor(in_channels=1)
    model.load_state_dict(torch.load(f"{path}/checkpoints/best.pt", map_location="cpu"))
    model.eval()
    with open(f"{path}/metadata.json") as f:
        metadata = json.load(f)
    return model, metadata
```

`lru_cache` ensures this runs once at first call (or trigger it explicitly in a FastAPI `@app.on_event("startup")` hook so cold-start latency doesn't hit the first user).

### Step 2 — Preprocess the incoming request identically to training

This is the step most services get wrong — if normalization, channel selection, or cropping convention drifts from what was used in training, predictions silently degrade.

```python
# app/inference/preprocess_request.py
def preprocess(image_base64: str, channel: str):
    img_array = decode_base64_image(image_base64)          # -> numpy array
    img_array = clean_channel(img_array, strategy="zero")   # same function as training/src/preprocessing/clean.py
    img_array = normalize(img_array, stats=TRAIN_NORM_STATS)  # same stats saved during training
    return torch.tensor(img_array).unsqueeze(0).float()
```

Recommendation: literally share the `clean.py` and `normalize()` code between `training/` and `serving/` via a small shared package, rather than reimplementing it twice — that's the single biggest source of train/serve skew bugs.

### Step 3 — Run inference

```python
# app/inference/intensity_infer.py
@torch.no_grad()
def predict_intensity(image_tensor):
    model, metadata = get_intensity_model()
    wind_kmh = model(image_tensor).item()
    category = wind_to_category(wind_kmh)
    confidence = estimate_confidence(model, image_tensor)   # see note below
    return wind_kmh, category, confidence, metadata["version"]
```

**On confidence scores:** a plain regression model doesn't natively output a confidence number. Two practical options for the MVP:
- Simple: derive a heuristic confidence from how close the input distribution is to training data (e.g. based on image quality/cloud-obscuration checks)
- Better (Phase 2): enable dropout at inference time (MC Dropout) and run 10–20 forward passes, using the variance across them as an uncertainty measure

Don't fabricate a confidence number with no basis — the dashboard explicitly depends on this being honest.

### Step 4 — Build the response

```python
# app/routers/intensity.py
from fastapi import APIRouter
from app.schemas.responses import IntensityPredictionResponse

router = APIRouter()

@router.post("/predict/intensity", response_model=IntensityPredictionResponse)
def predict(req: IntensityPredictionRequest):
    tensor = preprocess(req.image_base64, req.channel)
    wind_kmh, category, confidence, version = predict_intensity(tensor)
    return IntensityPredictionResponse(
        cyclone_id=req.cyclone_id,
        category=category,
        wind_speed_kmh=wind_kmh,
        confidence=confidence,
        model_version=version,
    )
```

### Step 5 — Error handling

Any failure here (bad image decode, model not loaded, NaN output) should raise an HTTP 4xx/5xx with a clear error body — this is what the backend's fallback layer is watching for, so silent failures or malformed 200 responses are the worst outcome:

```python
from fastapi import HTTPException

if torch.isnan(torch.tensor(wind_kmh)):
    raise HTTPException(status_code=500, detail="Model produced invalid output")
```

### Step 6 — Health check

```python
# app/routers/health.py
@router.get("/health")
def health():
    try:
        model, metadata = get_intensity_model()
        return {"status": "ok", "models_loaded": [metadata["model_name"] + ":" + metadata["version"]]}
    except Exception as e:
        return JSONResponse(status_code=503, content={"status": "degraded", "error": str(e)})
```

The Node backend should poll this before/alongside prediction calls so it can decide fallback vs. live without waiting for a full prediction timeout every time.

---

## 4. Full ML Lifecycle Diagram

```
training/                                   serving/
┌───────────────┐                    ┌──────────────────────┐
│ Acquire (TCIR/│                    │ Startup: load model + │
│ HURSAT/IBTrACS)│                    │ metadata.json          │
└──────┬─────────┘                   └──────────┬────────────┘
       ▼                                          │
┌───────────────┐                                 ▼
│ Clean          │                    ┌──────────────────────┐
└──────┬─────────┘                    │ Request received      │
       ▼                              │ (image + metadata)    │
┌───────────────┐                    └──────────┬────────────┘
│ Crop/Align     │                                │
└──────┬─────────┘                                ▼
       ▼                              ┌──────────────────────┐
┌───────────────┐                    │ Preprocess (same code  │
│ Label          │                    │ as training)           │
└──────┬─────────┘                    └──────────┬────────────┘
       ▼                                          ▼
┌───────────────┐                    ┌──────────────────────┐
│ Split by storm │                    │ Run inference          │
└──────┬─────────┘                    └──────────┬────────────┘
       ▼                                          ▼
┌───────────────┐                    ┌──────────────────────┐
│ Train          │                    │ Build response +       │
└──────┬─────────┘                    │ confidence              │
       ▼                              └──────────┬────────────┘
┌───────────────┐                                ▼
│ Validate       │                    ┌──────────────────────┐
└──────┬─────────┘                    │ Return JSON to backend │
       ▼                              └──────────────────────┘
┌───────────────┐
│ Test           │
└──────┬─────────┘
       ▼
┌───────────────┐        exports to
│ Export ────────┼──────► serving/model_artifacts/<version>/
└───────────────┘
```

---

## 5. File Structure (unchanged from before, included here for reference)

```
ml-layer/
├── ingestion/
│   ├── mosdac_client.py
│   ├── standing_order_monitor.py
│   ├── fetch_latest_frame.py
│   ├── region_config.py
│   ├── region_crop.py
│   ├── live_preprocessor.py
│   └── requirements.txt
├── training/
│   ├── data/{raw,processed,splits}/
│   ├── src/
│   │   ├── data_acquisition/{fetch_ibtracs.py, fetch_hursat.py, fetch_tcir_benchmark.py}
│   │   ├── preprocessing/{clean.py, crop_patches.py, align_timestamps.py, build_labels.py, split.py}
│   │   ├── datasets/{cyclone_image_dataset.py, sequence_dataset.py}
│   │   ├── models/{detection_cnn.py, intensity_regressor.py, temporal_lstm.py}
│   │   ├── train.py, validate.py, test.py, export_model.py
│   ├── experiments/<run_id>/{config.yaml, metrics.json, checkpoints/}
│   ├── notebooks/
│   └── requirements.txt
└── serving/
    ├── app/
    │   ├── main.py
    │   ├── routers/{detection.py, intensity.py, track.py, cyclogenesis.py, health.py, live.py}
    │   ├── schemas/{requests.py, responses.py}
    │   ├── models/model_loader.py
    │   ├── inference/{detection_infer.py, intensity_infer.py, preprocess_request.py}
    │   └── core/{config.py, logging.py}
    ├── model_artifacts/<version>/{checkpoints/, metadata.json}
    ├── requirements.txt
    └── Dockerfile
```

---

## 6. Configuration & Reproducibility

- Every training run reads hyperparameters from a `config.yaml` (channels used, batch size, LR, epochs, split years) rather than hardcoded values — makes runs comparable and reproducible.
- Every `experiments/<run_id>/` folder is self-contained: config, metrics, checkpoints. Never overwrite a previous run.
- `serving/` pins an exact `MODEL_VERSION` via environment variable — upgrading the model in production is a config change, not a code change.

---

## 7. Minimal Build Order (recap)

1. Submit MOSDAC registration now — approval time is outside your control, so this shouldn't block starting everything else.
2. `training/`: run `fetch_tcir_benchmark.py` → clean → build IR-only dataset → train `IntensityRegressor` → validate → test → export `v0.1`
3. `serving/`: load `v0.1`, expose `/predict/intensity` and `/health`, tested with manually-supplied images (no live feed needed yet)
4. Confirm the Node backend's fallback triggers correctly when `serving/` is stopped
5. Once MOSDAC access is approved: build `ingestion/`, place the standing order, wire `/live/scan-regions` and `/live/update-cyclone/:id` into `serving/`, and confirm the fallback also triggers correctly when the MOSDAC fetch itself fails (not just when the model fails)
6. Swap TCIR for real HURSAT/IBTrACS North Indian Ocean data in `training/`, retrain, export `v0.2` — no changes needed in `serving/`, `ingestion/`, or the backend
