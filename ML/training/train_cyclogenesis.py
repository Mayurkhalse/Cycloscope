"""
Train ML Cyclogenesis Prediction Model
Trains a Random Forest Classifier with probability calibration on North Indian Ocean (Bay of Bengal & Arabian Sea)
atmospheric and thermodynamic environmental variables to replace rule-based scoring.
"""
import sys
import json
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, brier_score_loss, precision_score, recall_score, f1_score
import joblib

ML_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ML_ROOT))

def generate_environmental_genesis_dataset(n_samples: int = 5000, seed: int = 42) -> pd.DataFrame:
    """
    Generates synthetic & empirically distributed atmospheric soundings representing NIO cyclogenesis
    ground truth distributions aligned with Gray's Genesis Potential Index (GPI) and IBTrACS observations.
    """
    np.random.seed(seed)
    
    # 0 = Arabian Sea, 1 = Bay of Bengal (BoB historically has higher frequency)
    basin = np.random.choice([0, 1], size=n_samples, p=[0.35, 0.65])
    
    # SST (°C): Tropical NIO waters typically 26.5 - 31.5 °C
    sst = np.where(
        basin == 1,
        np.random.normal(29.4, 1.2, size=n_samples), # BoB
        np.random.normal(28.6, 1.4, size=n_samples)  # AS
    )
    sst = np.clip(sst, 24.0, 32.5)
    
    # Vertical Wind Shear (knots 200-850 hPa): Low shear (< 15 kts) strongly favors genesis
    vws = np.where(
        basin == 1,
        np.random.gamma(shape=3.5, scale=4.0, size=n_samples), # BoB mean ~14 kts
        np.random.gamma(shape=4.2, scale=4.5, size=n_samples)  # AS mean ~19 kts
    )
    vws = np.clip(vws, 3.0, 45.0)
    
    # Mid-troposphere Relative Humidity (% at 700 hPa): High moisture (> 65%) favors genesis
    rh = np.random.normal(68.0, 12.0, size=n_samples)
    rh = np.clip(rh, 30.0, 95.0)
    
    # Low-level Relative Vorticity (10^-5 s^-1 at 850 hPa)
    vorticity = np.random.exponential(scale=4.5, size=n_samples) + 1.0
    vorticity = np.clip(vorticity, 0.5, 25.0)
    
    # Mean Sea Level Pressure (hPa)
    mslp = np.random.normal(1007.0, 4.0, size=n_samples)
    mslp = np.clip(mslp, 992.0, 1018.0)
    
    # Dynamic genesis probability calculation following Emanuel-Nolan Genesis Potential Index formulation
    # GPI ~ |vorticity|^(3/2) * (RH/50)^3 * (SST - 26.5)^2 / (1 + 0.1 * VWS^2)
    sst_term = np.maximum(0.0, sst - 26.0) ** 1.8
    vws_term = 1.0 / (1.0 + (vws / 12.0) ** 2.2)
    rh_term = (rh / 60.0) ** 2.0
    vort_term = (vorticity / 4.0) ** 1.2
    pres_term = np.maximum(0.0, (1012.0 - mslp) / 6.0)
    
    latent_score = 0.30 * sst_term + 0.30 * vws_term * 4.0 + 0.20 * rh_term + 0.10 * vort_term + 0.10 * pres_term
    # Sigmoid link to get true probability
    true_prob = 1.0 / (1.0 + np.exp(-(latent_score - 2.8)))
    
    # Generate binary label
    y = (np.random.uniform(0.0, 1.0, size=n_samples) < true_prob).astype(int)
    
    df = pd.DataFrame({
        "basin": basin,
        "sea_surface_temp_c": sst,
        "vertical_wind_shear_knots": vws,
        "mid_troposphere_rh": rh,
        "vorticity_850hpa": vorticity,
        "sea_level_pressure_hpa": mslp,
        "cyclogenesis_label": y
    })

    # [DATA Persistence Hook] Save raw synthetic dataset
    project_root = Path(__file__).resolve().parents[2]
    raw_syn_dir = project_root / "data" / "raw" / "synthetic"
    raw_syn_dir.mkdir(parents=True, exist_ok=True)
    raw_syn_path = raw_syn_dir / "synthetic_environmental_cyclogenesis.csv"
    df.to_csv(raw_syn_path, index=False)
    print(f"[DATA] Saved synthetic dataset:")
    print(f"       Rows: {len(df):,}")
    print(f"       Columns: {df.shape[1]}")
    print(f"       Path: {raw_syn_path.relative_to(project_root)}")

    return df

def train_and_export():
    print("=== Training Machine Learning Cyclogenesis Model ===")
    df = generate_environmental_genesis_dataset()
    
    project_root = Path(__file__).resolve().parents[2]
    processed_dir = project_root / "data" / "processed"
    processed_dir.mkdir(parents=True, exist_ok=True)

    # [DATA Persistence Hook] Save final processed dataset
    processed_path = processed_dir / "cyclogenesis_processed.csv"
    df.to_csv(processed_path, index=False)
    print(f"[DATA] Saved final processed dataset:")
    print(f"       Rows: {len(df):,}")
    print(f"       Columns: {df.shape[1]}")
    print(f"       Path: {processed_path.relative_to(project_root)}")

    feature_cols = [
        "sea_surface_temp_c",
        "vertical_wind_shear_knots",
        "mid_troposphere_rh",
        "vorticity_850hpa",
        "sea_level_pressure_hpa",
        "basin"
    ]
    
    X = df[feature_cols]
    y = df["cyclogenesis_label"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
    
    # [DATA Persistence Hook] Save train and test split datasets
    train_split_df = X_train.copy()
    train_split_df["cyclogenesis_label"] = y_train
    train_split_path = processed_dir / "cyclogenesis_train.csv"
    train_split_df.to_csv(train_split_path, index=False)
    print(f"[DATA] Saved train split dataset:")
    print(f"       Rows: {len(train_split_df):,}")
    print(f"       Columns: {train_split_df.shape[1]}")
    print(f"       Path: {train_split_path.relative_to(project_root)}")

    test_split_df = X_test.copy()
    test_split_df["cyclogenesis_label"] = y_test
    test_split_path = processed_dir / "cyclogenesis_test.csv"
    test_split_df.to_csv(test_split_path, index=False)
    print(f"[DATA] Saved test split dataset:")
    print(f"       Rows: {len(test_split_df):,}")
    print(f"       Columns: {test_split_df.shape[1]}")
    print(f"       Path: {test_split_path.relative_to(project_root)}")
    
    # Train Random Forest
    base_rf = RandomForestClassifier(
        n_estimators=150,
        max_depth=7,
        min_samples_leaf=4,
        random_state=42,
        class_weight="balanced"
    )
    base_rf.fit(X_train, y_train)
    
    # Calibrate probabilities using Sigmoid calibration
    calibrated_rf = CalibratedClassifierCV(base_rf, method="sigmoid", cv=3)
    calibrated_rf.fit(X_train, y_train)
    
    # Predictions & Metrics
    y_pred_proba = calibrated_rf.predict_proba(X_test)[:, 1]
    y_pred = (y_pred_proba >= 0.5).astype(int)
    
    auc = roc_auc_score(y_test, y_pred_proba)
    brier = brier_score_loss(y_test, y_pred_proba)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    
    print(f"Test ROC-AUC:    {auc:.4f}")
    print(f"Test Brier Score:{brier:.4f}")
    print(f"Test Precision:  {prec:.4f}")
    print(f"Test Recall:     {rec:.4f}")
    print(f"Test F1-Score:   {f1:.4f}")
    
    # Feature importances from base RF
    importances = dict(zip(feature_cols, [round(float(v), 4) for v in base_rf.feature_importances_]))
    print(f"Feature Importances: {importances}")
    
    # Artifact directory
    artifact_dir = ML_ROOT / "serving" / "model_artifacts" / "v0.1"
    checkpoints_dir = artifact_dir / "checkpoints"
    checkpoints_dir.mkdir(parents=True, exist_ok=True)
    
    model_path = checkpoints_dir / "cyclogenesis_model.joblib"
    joblib.dump(calibrated_rf, model_path)
    print(f"Exported model to: {model_path}")
    
    metrics = {
        "model_type": "Calibrated Random Forest Classifier",
        "version": "v0.1-RF",
        "dataset_samples": len(df),
        "test_roc_auc": round(float(auc), 4),
        "test_brier_score": round(float(brier), 4),
        "test_precision": round(float(prec), 4),
        "test_recall": round(float(rec), 4),
        "test_f1_score": round(float(f1), 4),
        "feature_importances": importances,
        "features": feature_cols
    }
    
    metrics_path = artifact_dir / "cyclogenesis_metrics.json"
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"Saved metrics report to: {metrics_path}")
    return metrics

if __name__ == "__main__":
    train_and_export()
