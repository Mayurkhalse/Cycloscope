# CYCLONE AI PROJECT
## Next Steps & Implementation Roadmap

**Document Status:** Implementation Roadmap  
**Based On:** Current project architecture and Data Reality Audit  
**Primary Objective:** Convert the existing prototype into a genuinely data-driven Cyclone Intelligence & Prediction System

---

# 1. Executive Summary

The current Cyclone AI system already contains several genuine components:

- Authentic historical satellite imagery from TCIR
- Authentic historical cyclone observations from IBTrACS
- A trained PyTorch intensity prediction model
- MongoDB-based storm and prediction storage
- Satellite visualization
- Automated scheduling
- Climatological fallback
- RAG-based cyclone intelligence assistant

However, several components currently operate using **hardcoded values, heuristics, curated scenarios, or historical replay data** rather than dynamically acquired observations.

The next development phase should therefore focus on removing these limitations in a controlled sequence.

## Current → Target

```text
CURRENT SYSTEM

Historical TCIR Satellite Data
          ↓
Hardcoded Storm → Frame Mapping
          ↓
Intensity CNN
          ↓
Heuristic Track Prediction

Hardcoded Environmental Values
          ↓
Rule-Based Cyclogenesis

Curated Active Storms
          ↓
MongoDB
          ↓
Frontend / RAG
```

The target architecture should become:

```text
LIVE SATELLITE / ENVIRONMENTAL DATA
              ↓
      DATA INGESTION LAYER
              ↓
   VALIDATION + NORMALIZATION
              ↓
      STORM DETECTION
              ↓
     STORM TRACK ASSOCIATION
              ↓
      FEATURE EXTRACTION
              ↓
 ┌────────────┼─────────────┐
 ↓            ↓             ↓
Intensity   Track       Cyclogenesis
Model       Model          Model
 ↓            ↓             ↓
 └────────────┼─────────────┘
              ↓
       PREDICTION ENGINE
              ↓
     CONFIDENCE + QUALITY
              ↓
        MongoDB / API
              ↓
     Frontend + RAG Assistant
```

---

# 2. Priority Order

The work should be completed in the following order.

| Priority | Task | Importance | Status |
|---|---|---|---|
| P0 | Remove hardcoded satellite frame mapping | Critical | Pending |
| P0 | Build proper satellite data ingestion layer | Critical | Pending |
| P0 | Establish timestamp/geolocation provenance | Critical | Pending |
| P0 | Connect real satellite observations to inference | Critical | Pending |
| P1 | Integrate trained track model | Critical | Pending |
| P1 | Replace heuristic track forecasting | Critical | Pending |
| P1 | Build proper storm-history sequence pipeline | High | Pending |
| P1 | Implement dynamic storm detection/association | High | Pending |
| P2 | Integrate ERA5/environmental data | High | Pending |
| P2 | Build ML-based cyclogenesis model | High | Pending |
| P2 | Train/validate environmental prediction models | High | Pending |
| P3 | Improve uncertainty/confidence estimation | Medium | Pending |
| P3 | Historical backtesting | High | Pending |
| P3 | Live-vs-replay system modes | High | Pending |
| P4 | Performance/scalability optimization | Medium | Pending |
| P4 | Documentation and scientific reporting | High | Pending |

---

# 3. Phase 0 — Freeze and Document the Current Baseline

Before changing the system, create a reproducible baseline.

## 3.1 Create two explicit operating modes

The system must distinguish between:

### Historical Replay Mode

Uses:

- TCIR
- IBTrACS
- Existing historical model artifacts
- Historical storm records

Purpose:

- Development
- Testing
- Demonstrations
- Backtesting

### Live Mode

Uses:

- Live/near-real-time satellite observations
- Current environmental observations
- Current storm detections
- Current model inference

Purpose:

- Operational prediction
- Demonstration of real-time capabilities

Never silently mix the two modes.

---

# 4. Phase 1 — Fix Satellite Data Provenance

This is the most important immediate task.

## Current Problem

The current system contains mappings such as:

```text
IO_2026_03 → frame 420
IO_2026_02 → frame 1080
IO_2026_01 → frame 2540
IO_2026_04 → frame 3120
```

This means the system knows which satellite frame to use because the developer explicitly specified it.

That is not a real dynamic satellite pipeline.

## Required Architecture

Replace:

```text
Storm ID
   ↓
Hardcoded frame number
   ↓
TCIR image
```

with:

```text
Observation
   ↓
Timestamp
   ↓
Geographical bounds
   ↓
Available satellite frames
   ↓
Frame selection
   ↓
Storm location
   ↓
Spatial patch extraction
```

## Required metadata for every satellite frame

Every observation should have:

```json
{
  "source": "TCIR",
  "satellite": "...",
  "instrument": "...",
  "timestamp": "...",
  "latitude_bounds": [],
  "longitude_bounds": [],
  "channel": "IR",
  "resolution": "...",
  "units": "Kelvin",
  "file": "...",
  "quality": "..."
}
```

The exact fields should be adapted to the actual source dataset.

---

# 5. Phase 2 — Build the Satellite Ingestion Abstraction

Create a unified interface so the ML system does not care whether the input came from TCIR, MOSDAC, or another provider.

Recommended structure:

```text
ML/
└── ingestion/
    ├── base.py
    ├── tcir_client.py
    ├── mosdac_client.py
    ├── satellite_repository.py
    ├── metadata.py
    ├── validator.py
    └── cache.py
```

## Interface

Conceptually:

```python
class SatelliteDataProvider:

    def get_latest_observation(self):
        pass

    def get_observation(self, timestamp):
        pass

    def get_region(self, bbox, timestamp):
        pass
```

The existing TCIR data should become the first implementation.

MOSDAC should become the live implementation once valid access is configured.

---

# 6. Phase 3 — Connect MOSDAC / Live Satellite Data

The existing project already contains:

```text
ML/ingestion/mosdac_client.py
```

but it is currently not part of the active runtime pipeline.

## Required work

### Step 1

Verify the actual MOSDAC access mechanism.

Do not invent:

- API endpoints
- authentication methods
- product identifiers
- download URLs

Use the actual available MOSDAC documentation/access credentials.

### Step 2

Implement authentication/configuration through environment variables.

Example:

```env
MOSDAC_USERNAME=
MOSDAC_PASSWORD=
MOSDAC_PRODUCT=
MOSDAC_REGION=
```

Do not hardcode credentials.

### Step 3

Implement:

```text
Request observation
       ↓
Download
       ↓
Validate
       ↓
Store/cache
       ↓
Register metadata
       ↓
Expose to ML pipeline
```

### Step 4

Implement retry handling.

```text
Live source
   ↓
Timeout?
   ├── No → Continue
   └── Yes
         ↓
       Retry
         ↓
       Retry
         ↓
    Historical fallback
```

---

# 7. Phase 4 — Build a Proper Data Provenance System

Every prediction must be traceable back to its input data.

A prediction should be able to answer:

> "Which satellite observation and which environmental observations produced this prediction?"

Store something similar to:

```json
{
  "prediction_id": "...",
  "storm_id": "...",

  "data": {
    "satellite": {
      "source": "TCIR/MOSDAC",
      "timestamp": "...",
      "file": "...",
      "observation_id": "..."
    },

    "environment": {
      "source": "ERA5",
      "timestamp": "...",
      "variables": []
    }
  },

  "models": {
    "intensity": "v0.2",
    "track": "v0.2",
    "cyclogenesis": "v0.1"
  },

  "generated_at": "..."
}
```

This is essential for scientific credibility.

---

# 8. Phase 5 — Build Dynamic Storm Detection

Currently, active storms are based on curated scenarios.

The target system should detect potential disturbances from incoming data.

## Target pipeline

```text
Satellite observation
        ↓
Preprocessing
        ↓
Cloud/thermal feature extraction
        ↓
Disturbance candidate detection
        ↓
Candidate coordinates
        ↓
Storm association
        ↓
Storm object
```

The system should produce:

```json
{
  "candidate_id": "...",
  "timestamp": "...",
  "latitude": 18.42,
  "longitude": 87.31,
  "confidence": 0.81
}
```

---

# 9. Phase 6 — Build Storm Track Association

After detecting a disturbance, the system needs to determine whether the new observation belongs to:

- an existing storm
- a newly forming storm
- a previously observed disturbance

Example:

```text
Observation T0
     ↓
Candidate A

Observation T+30min
     ↓
Candidate B
     ↓
Spatial/temporal matching
     ↓
Candidate B = Candidate A
     ↓
Storm history updated
```

This creates the sequential history required by a genuine track model.

---

# 10. Phase 7 — Activate the Existing Track Model

A trained artifact already exists:

```text
track_best.pt
```

but the active serving pipeline currently uses a kinematic heuristic.

This must be changed.

## Current

```text
Current location
     ↓
+0.35° latitude
-0.25° longitude
     ↓
6-hour prediction
```

This should be removed from the primary prediction path.

## Target

```text
Historical storm positions
        ↓
Feature sequence
        ↓
TrackForecaster
        ↓
6h
12h
24h
48h
predictions
```

---

# 11. Phase 8 — Verify the Track Model Before Production Use

Do not simply connect `track_best.pt` and assume it works.

Perform:

### Model verification

- Check checkpoint loading
- Verify architecture
- Verify input dimensions
- Verify feature ordering
- Verify normalization
- Verify output dimensions
- Verify device handling
- Verify missing-data handling

### Prediction verification

Run historical storms through:

```text
T0 → model → T+6
T0...T+6 → model → T+12
T0...T+12 → model → T+24
...
```

Compare predicted coordinates with actual IBTrACS positions.

---

# 12. Phase 9 — Track Model Evaluation

Use historical IBTrACS storms as ground truth.

Calculate:

- 6-hour track error
- 12-hour track error
- 24-hour track error
- 48-hour track error

Use:

```text
Great-circle / Haversine distance
```

for geographical error.

Example:

```text
Prediction: 18.2°N, 87.5°E
Actual:     18.5°N, 87.9°E

Error = geographical distance between the two points
```

Report:

```text
MAE
RMSE
Median Error
Mean Track Error
```

for each forecast horizon.

---

# 13. Phase 10 — Integrate ERA5 Environmental Data

The current cyclogenesis architecture expects environmental information but does not currently have an operational ERA5 pipeline.

Required variables should include, where supported by the chosen dataset:

- Sea surface temperature
- Relative humidity
- Vertical wind shear
- Atmospheric pressure
- Temperature
- Wind fields

Architecture:

```text
ERA5
 ↓
Download / API
 ↓
NetCDF / GRIB
 ↓
Preprocessing
 ↓
Spatial extraction around storm
 ↓
Temporal alignment
 ↓
Feature vector
```

---

# 14. Phase 11 — Replace Rule-Based Cyclogenesis

Current system:

```text
SST
Wind shear
RH
 ↓
Weighted thresholds
 ↓
Cyclogenesis score
```

This should eventually become:

```text
Satellite features
+
ERA5 features
+
Historical storm labels
+
Temporal features
        ↓
ML model
        ↓
Cyclogenesis probability
```

Possible model progression:

### Baseline

Logistic Regression

### Strong baseline

Random Forest / XGBoost

### Advanced

Temporal neural network

Do not jump directly to a complex deep-learning architecture.

First establish a strong measurable baseline.

---

# 15. Phase 12 — Create Cyclogenesis Training Dataset

Construct samples such as:

```text
Timestamp
Location
SST
Wind shear
Humidity
Pressure
Satellite features
Historical storm formation?
```

Target:

```text
0 = No cyclogenesis
1 = Cyclogenesis
```

The label definition must be clearly documented.

For example:

```text
Cyclogenesis = formation of a tropical cyclone within
a predefined spatial radius and time window.
```

The exact definition should be fixed before training.

---

# 16. Phase 13 — Improve Intensity Model Pipeline

The intensity model is currently the strongest genuine ML component.

Existing:

```text
best.pt
 ↓
IntensityRegressor
 ↓
Wind speed
```

Do not replace it unnecessarily.

Instead, improve its input pipeline.

## Required changes

Current:

```text
Storm ID
 ↓
Hardcoded TCIR frame
 ↓
Model
```

Target:

```text
Live/historical observation
 ↓
Storm-centered patch
 ↓
Preprocessing
 ↓
Intensity model
 ↓
Wind speed
```

The model should receive the actual observation associated with the storm.

---

# 17. Phase 14 — Multi-Channel Satellite Intelligence

The project contains a 4-channel TCIR HDF5 dataset:

```text
IR
WV
VIS
PMW
```

Currently, the strongest active inference path is based on IR data.

A future model can exploit multiple channels:

```text
IR
WV
VIS
PMW
 ↓
Multi-channel CNN
 ↓
Feature representation
 ↓
Intensity / structure estimation
```

This should be implemented only after the single-channel pipeline is reliable.

---

# 18. Phase 15 — Build a Unified Prediction Engine

Create a central prediction service.

Recommended conceptual architecture:

```text
PredictionEngine
│
├── DataValidator
├── SatelliteProcessor
├── EnvironmentalProcessor
├── StormDetector
├── StormTracker
├── IntensityModel
├── TrackModel
├── CyclogenesisModel
├── UncertaintyEstimator
└── PredictionRepository
```

The frontend should not directly depend on individual ML implementation details.

---

# 19. Phase 16 — Add Prediction Confidence Correctly

Confidence should not simply be an arbitrary number.

Confidence should consider:

- Model uncertainty
- Input data quality
- Missing channels
- Age of observation
- Distance from known storm center
- Model validation performance
- Whether the prediction uses live or fallback data

Example:

```text
Prediction Confidence

High
 ├── Fresh observation
 ├── Complete inputs
 ├── Valid storm association
 └── Model operating within training distribution

Medium
 ├── Slightly old observation
 └── Some missing information

Low
 ├── Stale observation
 ├── Missing environmental data
 └── Fallback prediction
```

---

# 20. Phase 17 — Historical Backtesting

This is one of the most important steps before claiming prediction capability.

Select historical storms from IBTrACS.

For each storm:

```text
Historical observations
        ↓
System prediction
        ↓
Compare against actual track/intensity
```

The system should operate as if it did not know the future.

Do NOT allow future observations to leak into the input.

---

# 21. Phase 18 — Prevent Data Leakage

Training and testing must be separated properly.

Do not randomly split individual satellite frames if frames from the same storm appear in both training and validation.

Prefer:

```text
Training storms
Validation storms
Testing storms
```

rather than:

```text
Random frames
```

Otherwise performance may appear artificially high.

---

# 22. Phase 19 — Build a Proper Evaluation Framework

Create:

```text
ML/evaluation/
├── intensity_metrics.py
├── track_metrics.py
├── cyclogenesis_metrics.py
├── backtest.py
└── reports/
```

## Intensity metrics

- MAE
- RMSE
- Bias
- Category accuracy

## Track metrics

- 6h error
- 12h error
- 24h error
- 48h error

## Cyclogenesis metrics

- Precision
- Recall
- F1
- ROC-AUC
- PR-AUC
- Brier score if probability calibration is used

---

# 23. Phase 20 — Separate Live Data from Fallback Data

The system must always disclose its data source.

Example API response:

```json
{
  "mode": "live",
  "data_source": "MOSDAC",
  "observation_age_minutes": 18,
  "fallback_used": false
}
```

Fallback:

```json
{
  "mode": "fallback",
  "data_source": "TCIR",
  "fallback_used": true,
  "fallback_reason": "Live satellite unavailable"
}
```

This should be visible in the UI.

---

# 24. Phase 21 — Update the Frontend

The frontend should clearly display:

## Data Source

```text
Satellite Source:
MOSDAC / TCIR
```

## Observation

```text
Observation:
08 Sep 2026 06:00 UTC
```

## Model

```text
Intensity Model:
v0.2
```

## Prediction

```text
Current Intensity:
XX km/h

24h Forecast:
XX km/h
```

## Track

Display:

```text
Current
 ↓
+6h
 ↓
+12h
 ↓
+24h
 ↓
+48h
```

with uncertainty information where available.

---

# 25. Phase 22 — Add Historical Replay UI

A very useful feature is:

```text
Mode:
[ Live ] [ Historical Replay ]
```

Historical replay should allow:

```text
Storm:
Cyclone X

Date:
YYYY-MM-DD

Time:
HH:MM

[ Run Prediction ]
```

This allows you to demonstrate the system even when live satellite access is unavailable.

---

# 26. Phase 23 — Improve RAG Assistant

The RAG assistant should be grounded in actual prediction records.

It should be able to answer:

- What is the current storm intensity?
- What was the previous intensity?
- What is the predicted track?
- What data source was used?
- When was the last observation?
- What is the model confidence?
- Was fallback used?
- What environmental conditions are present?

It should not invent information unavailable in MongoDB.

---

# 27. Phase 24 — Add Audit Logs

Every prediction should create an audit record.

Example:

```text
Prediction ID
Storm ID
Timestamp
Satellite source
Observation timestamp
Environmental source
Models used
Model versions
Input quality
Fallback status
Prediction
Confidence
Execution time
```

This will make debugging and scientific evaluation much easier.

---

# 28. Phase 25 — Automated Pipeline

The final runtime scheduler should resemble:

```text
Scheduler
   ↓
Check for new observations
   ↓
Download satellite data
   ↓
Validate
   ↓
Detect storms
   ↓
Associate with existing storms
   ↓
Extract features
   ↓
Run intensity model
   ↓
Run track model
   ↓
Run cyclogenesis model
   ↓
Calculate uncertainty
   ↓
Store prediction
   ↓
Update API
   ↓
Frontend refresh
   ↓
RAG context refresh
```

---

# 29. Phase 26 — Failure Handling

Every external dependency must have a fallback.

```text
MOSDAC unavailable
       ↓
Retry
       ↓
Still unavailable?
       ↓
Use most recent valid observation
       ↓
If unavailable
       ↓
Historical/replay fallback
```

But the system must clearly mark:

```text
LIVE
STALE
FALLBACK
```

It must never present fallback data as live data.

---

# 30. Phase 27 — Testing Requirements

Before declaring the system complete, test each layer independently.

## Data tests

- Satellite file validation
- Timestamp validation
- Coordinate validation
- Missing-data handling
- Corrupt-file handling

## Model tests

- Intensity checkpoint loading
- Track checkpoint loading
- Cyclogenesis model loading
- Input shape validation
- Output range validation

## Integration tests

```text
Satellite → ML
ML → Backend
Backend → MongoDB
Backend → Frontend
RAG → MongoDB
```

## Failure tests

Simulate:

- Satellite unavailable
- Database unavailable
- ML service unavailable
- Invalid observation
- Missing environmental data
- Model timeout

---

# 31. Phase 28 — Performance Optimization

After correctness is established, optimize performance.

Priority:

1. Cache satellite observations
2. Cache preprocessing
3. Load models once
4. Avoid repeated checkpoint loading
5. Batch inference where possible
6. Optimize MongoDB queries
7. Add API caching where appropriate
8. Monitor FastAPI latency

Do not optimize before the data pipeline is correct.

---

# 32. Phase 29 — Observability

Add logging and metrics.

Monitor:

```text
Satellite ingestion latency
Prediction latency
Model inference time
API latency
Database latency
Failed predictions
Fallback frequency
Missing observations
Model errors
```

Example:

```text
[06:00 UTC]

Satellite ingestion: SUCCESS
Observation age: 12 min

Storm detection: 3 candidates
Storm association: 2 active storms

Intensity inference: SUCCESS
Track inference: SUCCESS
Cyclogenesis inference: SUCCESS

Prediction stored: SUCCESS
```

---

# 33. Phase 30 — Model Versioning

Use explicit model versions.

Example:

```text
models/
├── intensity/
│   ├── v0.1/
│   └── v0.2/
│
├── track/
│   ├── v0.1/
│   └── v0.2/
│
└── cyclogenesis/
    └── v0.1/
```

Every prediction should record the model version.

---

# 34. Phase 31 — Scientific Validation

Before making performance claims, produce a proper validation report.

The report should include:

```text
Dataset
↓
Preprocessing
↓
Train/Validation/Test Split
↓
Model Architecture
↓
Training
↓
Evaluation
↓
Baseline Comparison
↓
Error Analysis
↓
Limitations
```

Never report only the best metric.

---

# 35. Phase 32 — Final Target Architecture

The final architecture should look approximately like:

```text
                    ┌──────────────────────┐
                    │ Satellite Data       │
                    │ MOSDAC / TCIR        │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │ Data Ingestion       │
                    │ + Validation         │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │ Observation Store    │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       Storm Detection   Environmental      Historical
                         Data / ERA5         IBTrACS
              │                │                │
              └────────────────┼────────────────┘
                               │
                    ┌──────────▼───────────┐
                    │ Feature Engineering  │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        Intensity          Track          Cyclogenesis
          Model             Model             Model
              │                │                │
              └────────────────┼────────────────┘
                               │
                    ┌──────────▼───────────┐
                    │ Prediction Engine    │
                    │ + Uncertainty        │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │ MongoDB              │
                    │ Predictions/History  │
                    └──────────┬───────────┘
                               │
                  ┌────────────┴────────────┐
                  │                         │
                  ▼                         ▼
             React UI                  RAG Assistant
```

---

# 36. Recommended Implementation Sequence

Do NOT attempt everything simultaneously.

Follow this sequence.

## Sprint 1 — Data Reality

### Goal

Make satellite data usage completely dynamic.

Tasks:

- [ ] Remove hardcoded storm → frame mappings
- [ ] Create satellite provider abstraction
- [ ] Add satellite metadata
- [ ] Add timestamp handling
- [ ] Add provenance
- [ ] Make TCIR the historical provider
- [ ] Prepare MOSDAC provider
- [ ] Add live/replay mode

---

## Sprint 2 — Real-Time Satellite Pipeline

### Goal

Connect actual incoming satellite observations.

Tasks:

- [ ] Verify MOSDAC access
- [ ] Configure credentials securely
- [ ] Implement download
- [ ] Validate observations
- [ ] Cache observations
- [ ] Store metadata
- [ ] Connect observations to ML preprocessing
- [ ] Add failure handling

---

## Sprint 3 — Dynamic Storm Detection

### Goal

Stop relying on curated active storms.

Tasks:

- [ ] Candidate detection
- [ ] Coordinate extraction
- [ ] Storm association
- [ ] Storm lifecycle management
- [ ] Dynamic storm IDs

---

## Sprint 4 — Track Model

### Goal

Replace the kinematic heuristic.

Tasks:

- [ ] Verify `track_best.pt`
- [ ] Build historical sequence generator
- [ ] Connect TrackForecaster
- [ ] Remove heuristic as primary path
- [ ] Backtest on IBTrACS
- [ ] Calculate 6/12/24/48h errors

---

## Sprint 5 — Environmental Intelligence

### Goal

Build a real cyclogenesis pipeline.

Tasks:

- [ ] Integrate ERA5
- [ ] Extract environmental variables
- [ ] Align spatially/temporally
- [ ] Generate training dataset
- [ ] Train baseline ML model
- [ ] Evaluate
- [ ] Integrate into serving

---

## Sprint 6 — Unified Prediction Engine

### Goal

Bring all models together.

```text
Satellite
+
Environmental
+
Historical Track
        ↓
Prediction Engine
        ↓
Intensity
Track
Cyclogenesis
Confidence
```

---

## Sprint 7 — Validation

### Goal

Prove that the system works.

Tasks:

- [ ] Historical backtesting
- [ ] No data leakage
- [ ] Track error evaluation
- [ ] Intensity evaluation
- [ ] Cyclogenesis evaluation
- [ ] Error analysis
- [ ] Baseline comparison

---

## Sprint 8 — Production Readiness

Tasks:

- [ ] Monitoring
- [ ] Logging
- [ ] Model versioning
- [ ] Failure handling
- [ ] Caching
- [ ] API optimization
- [ ] Frontend data-source indicators
- [ ] Documentation

---

# 37. Definition of Done

The project should NOT be considered a fully operational cyclone prediction system until all of the following are true.

## Satellite

- [ ] Satellite observations are dynamically acquired
- [ ] No hardcoded storm → frame mapping
- [ ] Every observation has timestamp/provenance
- [ ] Live and historical modes are separated

## Intensity

- [ ] Real satellite observation reaches the trained model
- [ ] Model inference is verified
- [ ] Historical performance is measured
- [ ] Predictions are traceable to input data

## Track

- [ ] `track_best.pt` is integrated
- [ ] Hardcoded directional movement is removed from the primary path
- [ ] Historical sequence is generated dynamically
- [ ] 6/12/24/48h errors are measured

## Cyclogenesis

- [ ] Environmental data pipeline exists
- [ ] ERA5 or equivalent data is actually used
- [ ] Training dataset is created
- [ ] ML model is trained
- [ ] Model is evaluated
- [ ] Rule-based scoring is no longer the primary model

## System

- [ ] Live/replay modes exist
- [ ] Data provenance exists
- [ ] Fallback state is visible
- [ ] Audit logs exist
- [ ] Automated scheduling works
- [ ] Failure handling works
- [ ] Historical backtesting works

---

# 38. What Should NOT Be Done

Avoid spending the next development cycle on:

- Redesigning the frontend unnecessarily
- Adding more dashboard widgets
- Adding more fake storm scenarios
- Adding arbitrary confidence values
- Adding more hardcoded cyclone data
- Claiming live satellite capability before it exists
- Claiming LSTM/TrackForecaster predictions while heuristic tracking is active
- Claiming ERA5/XGBoost cyclogenesis while the active model is rule-based
- Training increasingly complex models before fixing the data pipeline

The priority is:

> **Data correctness → Model integration → Validation → Productionization → UI improvements**

---

# 39. Most Important Immediate Tasks

If development time is limited, complete these five tasks first:

### 1. Remove hardcoded satellite frame selection

Replace:

```text
Storm → frame number
```

with:

```text
Storm → location + timestamp → appropriate observation
```

### 2. Connect real satellite ingestion

Move from:

```text
Local historical archive only
```

towards:

```text
Live satellite → ingestion → preprocessing → inference
```

### 3. Activate `track_best.pt`

Replace:

```text
+0.35 latitude
-0.25 longitude
```

with actual model inference.

### 4. Build ERA5 environmental pipeline

Replace hardcoded environmental values with actual observations.

### 5. Backtest everything

Do not claim that the system predicts cyclones accurately until historical validation demonstrates it.

---

# 40. Final Development Goal

The final system should be honestly describable as:

> **An AI-powered Cyclone Intelligence and Prediction System that ingests satellite and environmental observations, dynamically identifies and tracks tropical disturbances, estimates cyclone intensity, forecasts future track and intensity, evaluates cyclogenesis probability, maintains historical storm intelligence, and provides explainable decision support through a unified prediction and RAG interface.**

The key transition is:

```text
PROTOTYPE
   ↓
Historical data + trained model + heuristics
   ↓
DATA-DRIVEN SYSTEM
   ↓
Dynamic observations + trained models
   ↓
VALIDATED SYSTEM
   ↓
Historical backtesting + uncertainty
   ↓
OPERATIONAL SYSTEM
   ↓
Live ingestion + monitoring + fallback + provenance
```

---

# 41. Immediate Action Plan

Start with **Phase 1**, not with new ML training.

### First implementation milestone

```text
TCIR / MOSDAC
      ↓
Dynamic observation
      ↓
Timestamp + coordinates
      ↓
Storm-centered satellite patch
      ↓
Existing IntensityRegressor
      ↓
Real prediction
```

Once this works reliably:

```text
Dynamic storm history
      ↓
TrackForecaster
      ↓
6h / 12h / 24h / 48h prediction
```

Then:

```text
Satellite + ERA5
      ↓
Cyclogenesis ML
```

Finally:

```text
All models
      ↓
Unified prediction engine
      ↓
Backtesting
      ↓
Confidence / uncertainty
      ↓
Live operational system
```

**This sequence should be treated as the project's primary development roadmap.**