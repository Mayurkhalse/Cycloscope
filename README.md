# Cycloscope — AI-Powered Cyclone Decision Support System

> **Meteorological Intelligence, Intensity Estimation, Deep Neural Track Forecasting, and Cyclogenesis Early Warning for the North Indian Ocean (Bay of Bengal & Arabian Sea).**  
> *Designed to augment and assist official India Meteorological Department (IMD) / RSMC New Delhi bulletins.*

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Data Sources
        SAT["ISRO INSAT-3D / TCIR Archive<br/>(4km Multi-Spectral L1B)"] --> INGEST["Dynamic Satellite Ingestion<br/>(ML/ingestion/satellite_repository.py)"]
        ERA["ERA5 Atmospheric Soundings<br/>(SST, Shear, RH, Vorticity, MSLP)"] --> INGEST
        IBTRACS["NOAA IBTrACS NIO Archive<br/>(1842–2024 Historical Tracks)"] --> BACKTEST["Backtest Suite<br/>(ML/evaluation/backtest_suite.py)"]
    end

    subgraph Machine Learning Layer (:8000)
        INGEST --> INT_MODEL["Intensity Regressor (ResNet-18)<br/>serving/model_artifacts/v0.1/checkpoints/best.pt"]
        INGEST --> TRK_MODEL["TrackForecaster (Temporal LSTM)<br/>serving/model_artifacts/v0.1/checkpoints/track_best.pt"]
        INGEST --> CYCLO_MODEL["Cyclogenesis Classifier (Calibrated RF)<br/>serving/model_artifacts/v0.1/checkpoints/cyclogenesis_model.joblib"]
        
        INT_MODEL --> PRED_ENG["Unified Prediction Engine<br/>serving/app/services/prediction_engine.py"]
        TRK_MODEL --> PRED_ENG
        CYCLO_MODEL --> PRED_ENG
    end

    subgraph Backend Microservice (:5000)
        PRED_ENG --> ORCH["Node.js / Express Orchestrator<br/>backend/src/services/predictionOrchestrator.js"]
        ORCH --> MONGO[("MongoDB Database<br/>mongodb://127.0.0.1:27017/cycloscope")]
        MONGO --> API["REST API Endpoints<br/>/api/cyclones, /api/predictions, /api/cyclogenesis"]
        RAG["RAG Chatbot Assistant<br/>(Pinecone + Google Gemini)"] --> API
    end

    subgraph Frontend Dashboard (:5173)
        API --> UI["React + Vite Interactive Dashboard<br/>• Live Operations vs Historical Replay Mode<br/>• Multi-Channel Satellite Imagery (IR, BD-Curve, WV)<br/>• Trajectory Uncertainty Cones (+6h to +48h)<br/>• Dynamic Intensity Trend Indicators"]
    end
```

---

## ⚡ Quickstart Execution Guide

To run the complete Cyclone AI platform locally, launch the three independent microservices across three separate terminal windows.

### Prerequisites

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **Python**: v3.10, v3.11, v3.12, or v3.13 ([Download](https://www.python.org/))
- **MongoDB**: Community Server running locally on `mongodb://127.0.0.1:27017` ([Download](https://www.mongodb.com/try/download/community)) or a free MongoDB Atlas cluster.
- **Git**

---

### 💻 Step 1: Start the Machine Learning Microservice (Port 8000)

Open **Terminal 1**:

```bash
# 1. Navigate to the ML directory
cd ML

# 2. Create and activate a Python virtual environment
# On Windows (PowerShell / Command Prompt):
python -m venv venv
.\venv\Scripts\activate

# On Linux / macOS:
# python3 -m venv venv
# source venv/bin/activate

# 3. Install required machine learning dependencies
pip install -r requirements.txt

# 4. Launch the FastAPI Serving Engine
python app.py
```

* **Service URL:** `http://localhost:8000`
* **Interactive Swagger Documentation:** [`http://localhost:8000/docs`](http://localhost:8000/docs)
* **Preloaded Artifacts:** `best.pt` (ResNet-18 Intensity), `track_best.pt` (PyTorch LSTM Track), `cyclogenesis_model.joblib` (Calibrated Random Forest).

---

### 🗄️ Step 2: Start the Backend Orchestrator & Database (Port 5000)

Ensure your local MongoDB service is running (e.g. via Windows Services or `mongod`).

Open **Terminal 2**:

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install Node.js dependencies
npm install

# 3. (First time only) Seed MongoDB with authentic North Indian Ocean cyclones
npm run seed

# 4. Launch the backend in development mode
npm run dev
```

* **Service URL:** `http://localhost:5000`
* **API Base:** `http://localhost:5000/api`
* **Health Check:** `http://localhost:5000/api/system/health`

---

### 🖥️ Step 3: Start the React + Vite Frontend Dashboard (Port 5173)

Open **Terminal 3**:

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install frontend dependencies
npm install

# 3. Launch the Vite development server
npm run dev
```

* **Dashboard Web App:** Open [`http://localhost:5173`](http://localhost:5173) in your browser.

---

## 🧪 Step 4: Model Training & Scientific Backtesting Suites

You can independently execute model training or run historical backtesting against IBTrACS ground truth:

### 1. Train the ML Cyclogenesis Classifier
```bash
# In the ML/ directory with venv activated:
python training/train_cyclogenesis.py
```
* **Output:** Trains calibrated Random Forest on thermodynamic environmental soundings, exports `cyclogenesis_model.joblib` and metrics to `serving/model_artifacts/v0.1/cyclogenesis_metrics.json` (Test ROC-AUC: `0.8176`, Brier: `0.1690`).

### 2. Run Historical Backtesting Suite (IBTrACS Ground Truth)
```bash
# In the ML/ directory with venv activated:
python evaluation/backtest_suite.py
```
* **Output:** Evaluates trajectory forecast errors (Haversine distance in km) and intensity errors across prominent historical cyclones (Fani 2019, Amphan 2020, Tauktae 2021, Biparjoy 2023). Generates report in `ML/evaluation/reports/backtest_report.json`.

---

## ⚙️ Environment Variables Reference

### Backend Configuration (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/cycloscope
ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_TIMEOUT_MS=5000
PREDICTION_CRON_SCHEDULE=0 0,6,12,18 * * *

# Optional: RAG Assistant Keys (if using Pinecone / Gemini chatbot)
PINECONE_API_KEY=your_pinecone_key_here
PINECONE_INDEX=cyclone-knowledge
GEMINI_API_KEY=your_gemini_key_here
```

### Frontend Configuration (`frontend/.env`)

```env
VITE_BACKEND_API_URL=http://localhost:5000/api
```

### ML Service Configuration (`ML/serving/.env`)

```env
HOST=0.0.0.0
PORT=8000
MODEL_VERSION=v0.1
LOG_LEVEL=INFO

# Optional: ISRO MOSDAC live feed credentials
MOSDAC_USERNAME=
MOSDAC_PASSWORD=
MOSDAC_PRODUCT=3D_IMG_L1B_STD
```

---

## 📡 REST API Endpoints Overview

| Service | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **ML Engine** | `GET` | `/live/scan-regions` | Scans Bay of Bengal & Arabian Sea using satellite tensors |
| **ML Engine** | `POST` | `/live/update-cyclone/{id}` | Runs ResNet-18 intensity & LSTM trajectory forecasting |
| **ML Engine** | `POST` | `/predict/track` | Multi-horizon trajectory forecast (+6h, +12h, +24h, +48h) |
| **ML Engine** | `POST` | `/predict/cyclogenesis` | ML 48h cyclogenesis probability & environmental drivers |
| **ML Engine** | `GET` | `/live/satellite-frame/{id}` | Streams multi-channel satellite frame (IR, Dvorak, WV) |
| **Backend** | `GET` | `/api/cyclones/active` | Lists all active cyclones in the North Indian Ocean |
| **Backend** | `GET` | `/api/cyclones/:id` | Detailed storm fixes, observed track, and prediction cones |
| **Backend** | `POST` | `/api/predictions/:id/refresh` | Triggers live ML re-inference and updates MongoDB |
| **Backend** | `GET` | `/api/cyclogenesis/watch` | Lists candidate disturbances and formation risk |
| **Backend** | `GET` | `/api/cyclones/historical` | Query historical IBTrACS storms (Fani, Amphan, etc.) |

---

## 📊 Scientific Model Validation Metrics

> 📖 **For in-depth analysis, loss curves, feature importances, and historical benchmark backtesting breakdowns across NIO cyclones (Fani, Amphan, Tauktae, Biparjoy), see [METRICS_AND_EVALUATION.md](METRICS_AND_EVALUATION.md).**

| Model | Architecture | Target | Key Validation Metric |
| :--- | :--- | :--- | :--- |
| **Intensity Regressor** | ResNet-18 CNN (`best.pt`) | Wind Speed (km/h) | $\text{MAE} = 8.38\text{ km/h}$, Category Accuracy: `83.98%` (Test Split $\text{MAE} = 0.55\text{ km/h}$) |
| **Track Forecaster** | Temporal LSTM (`track_best.pt`) | Coordinates (+6h to +48h) | +6h $\text{MAE} = 76.87\text{ km}$, +12h $\text{MAE} = 149.58\text{ km}$ |
| **Cyclogenesis Model** | Calibrated Random Forest (`cyclogenesis_model.joblib`) | 48h Genesis Risk | $\text{ROC-AUC} = 0.8163$, $\text{F1-Score} = 79.77\%$ (Accuracy: `80.08%`) |

---

## 📁 Data Pipeline & Dataset Organization

CycoScope organizes all its raw, synthetic, and final processed datasets within a dedicated `data/` directory:

```text
data/
├── raw/
│   ├── original/              # Authentic observational and historical datasets
│   │   ├── ibtracs_nio_full.csv
│   │   ├── tcir_metadata.csv
│   │   ├── climatology_monthly_profiles.csv
│   │   └── seed_cyclones.csv
│   │
│   └── synthetic/             # Algorithmic simulations modeling physical atmospheric dynamics
│       ├── synthetic_environmental_cyclogenesis.csv
│       └── synthetic_cyclone_tracks.csv
│
├── processed/                 # Cleaned features and train/test/validation partitions
│   ├── ibtracs_nio_cleaned.csv
│   ├── cyclogenesis_processed.csv
│   ├── cyclogenesis_train.csv
│   ├── cyclogenesis_test.csv
│   ├── track_sequences_processed.csv
│   ├── track_train_sequences.csv
│   ├── track_val_sequences.csv
│   └── intensity_tcir_splits.csv
│
└── README.md                  # Comprehensive dataset schema reference
```

### Dataset Categories & Provenance

1. **Real / Source Data (`data/raw/original/`):**
   - `ibtracs_nio_full.csv`: 60,678 historical storm fixes from NOAA NCEI IBTrACS for the North Indian Ocean basin (1842–2024).
   - `tcir_metadata.csv`: Ground-truth best track labels from the TCIR benchmark dataset.
   - `climatology_monthly_profiles.csv`: Monthly baseline translational speed and bearing vectors for Bay of Bengal and Arabian Sea.
   - `seed_cyclones.csv`: Reference storm definitions for live testing and initialization.

2. **Synthetic / Generated Data (`data/raw/synthetic/`):**
   > **Notice:** Synthetic datasets are generated algorithmically by the CycoScope data pipeline to model physical atmospheric relationships. **They are simulations and must not be represented as real-world observational measurements.**
   - `synthetic_environmental_cyclogenesis.csv`: 5,000 synthetic atmospheric soundings modeling Gray's Genesis Potential Index (SST, vertical wind shear, mid-tropospheric relative humidity, vorticity, and sea level pressure).
   - `synthetic_cyclone_tracks.csv`: 600 synthetic multi-timestep storm track fixes (20 storms × 30 timesteps) modeling northwestward progression and intensity curves.

3. **Processed Data (`data/processed/`):**
   - `cyclogenesis_processed.csv`: The final feature-engineered dataset combining environmental predictors with genesis ground truth.
   - `cyclogenesis_train.csv` & `cyclogenesis_test.csv`: 75%/25% stratified splits used for training and evaluating the Calibrated Random Forest model.
   - `track_sequences_processed.csv`: The final temporal sequence dataset mapping 8-timestep historical observation windows to multi-horizon targets (+6h, +12h, +24h).
   - `track_train_sequences.csv` & `track_val_sequences.csv`: 80%/20% partitions used for training the PyTorch TrackForecaster LSTM.
   - `ibtracs_nio_cleaned.csv`: Cleaned historical records with IMD classifications.
   - `intensity_tcir_splits.csv`: Storm-level temporal split indices (33,166 train, 7,107 val, 7,108 test).

### How to Regenerate the Datasets
All generation scripts use fixed seeds (`seed=42`) and are **100% deterministic**:

```powershell
# Export original raw datasets & reference records
python ML/training/src/data_acquisition/export_dataset_registry.py

# Regenerate cyclogenesis synthetic soundings, processed data & splits
python ML/training/train_cyclogenesis.py

# Regenerate synthetic cyclone tracks, processed sequences & splits
python ML/training/train_track.py

# Regenerate intensity split partitions
python ML/training/train.py --epochs 1
```

---

## ⚠️ Disclaimer & Operational Notice

*This platform is an AI-assisted research and decision-support prototype. For life-safety, disaster response, evacuation planning, and official meteorological warnings, always refer directly to bulletins issued by the **India Meteorological Department (IMD / RSMC New Delhi)** at [mausam.imd.gov.in](https://mausam.imd.gov.in).*
