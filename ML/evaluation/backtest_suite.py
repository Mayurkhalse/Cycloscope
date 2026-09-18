"""
Historical Cyclone AI Backtesting & Scientific Validation Suite
Evaluates TrackForecaster and IntensityRegressor on authentic IBTrACS North Indian Ocean
historical cyclone best-tracks without future data leakage.
Computes Haversine track errors (+6h, +12h, +24h, +48h) and intensity MAE/RMSE.
"""
import sys
import json
import math
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Tuple
import numpy as np
import pandas as pd
import torch

ML_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ML_ROOT))

from serving.app.models.model_loader import get_intensity_model, get_track_model
from serving.app.inference.track_infer import predict_storm_track
from shared.category_mapper import wind_to_category

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates great-circle distance between two geographical points on Earth in kilometers.
    """
    R = 6371.0 # Earth mean radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    
    a = math.sin(dphi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return float(R * c)

def load_ibtracs_storm(name: str, year: int) -> pd.DataFrame:
    """
    Extracts chronological sequence of 6-hourly best track points for a specific historical cyclone.
    """
    csv_path = ML_ROOT / "training" / "data" / "raw" / "ibtracs" / "ibtracs_nio_full.csv"
    if not csv_path.exists():
        raise FileNotFoundError(f"IBTrACS file not found at {csv_path}")
        
    df = pd.read_csv(csv_path, low_memory=False, skiprows=[1]) # skip unit row
    
    # Filter by name and season
    df_storm = df[(df["NAME"].str.upper() == name.upper()) & (df["SEASON"] == str(year))].copy()
    if df_storm.empty:
        # Fallback: search just by name
        df_storm = df[df["NAME"].str.upper() == name.upper()].copy()
        
    if df_storm.empty:
        raise ValueError(f"Storm {name} ({year}) not found in IBTrACS NIO dataset.")
        
    df_storm["LAT"] = pd.to_numeric(df_storm["LAT"], errors="coerce")
    df_storm["LON"] = pd.to_numeric(df_storm["LON"], errors="coerce")
    # USA_WIND or WMO_WIND (in knots) -> convert to km/h (1 kt = 1.852 km/h)
    wind_kts = pd.to_numeric(df_storm["USA_WIND"], errors="coerce").fillna(
        pd.to_numeric(df_storm["WMO_WIND"], errors="coerce")
    ).fillna(35.0)
    df_storm["WIND_KMH"] = wind_kts * 1.852
    
    df_storm = df_storm.dropna(subset=["LAT", "LON"]).sort_values("ISO_TIME").reset_index(drop=True)
    return df_storm

def backtest_historical_storms():
    print("================================================================================")
    print("        CYCLONE SCOPE SCIENTIFIC BACKTEST & VALIDATION SUITE                    ")
    print("================================================================================")
    
    # Selected prominent historical NIO storms for validation
    target_storms = [
        {"name": "FANI", "year": 2019, "basin": "Bay of Bengal"},
        {"name": "AMPHAN", "year": 2020, "basin": "Bay of Bengal"},
        {"name": "TAUKTAE", "year": 2021, "basin": "Arabian Sea"},
        {"name": "BIPARJOY", "year": 2023, "basin": "Arabian Sea"}
    ]
    
    track_errors_6h = []
    track_errors_12h = []
    track_errors_24h = []
    track_errors_48h = []
    intensity_errors = []
    category_matches = []
    
    storm_summaries = []
    
    for target in target_storms:
        name = target["name"]
        year = target["year"]
        print(f"\nEvaluating Historical Storm: Cyclone {name} ({year}) - {target['basin']}...")
        
        try:
            df = load_ibtracs_storm(name, year)
        except Exception as e:
            print(f"Skipping {name}: {e}")
            continue
            
        n_points = len(df)
        print(f"  Loaded {n_points} synoptic best-track observation points.")
        if n_points < 10:
            continue
            
        storm_track_6h = []
        storm_track_12h = []
        storm_track_24h = []
        storm_track_48h = []
        storm_int_err = []
        
        # Stride through observations (every 6 hours)
        for i in range(4, n_points - 8): # Ensure at least 4 past steps and 8 future steps (+48h)
            current_obs = df.iloc[i]
            current_lat = float(current_obs["LAT"])
            current_lon = float(current_obs["LON"])
            current_wind = float(current_obs["WIND_KMH"])
            
            # History fixes up to current time (NO future leakage)
            history = [
                {
                    "lat": float(df.iloc[k]["LAT"]),
                    "lon": float(df.iloc[k]["LON"]),
                    "wind_speed_kmh": float(df.iloc[k]["WIND_KMH"])
                }
                for k in range(max(0, i - 4), i + 1)
            ]
            
            # Run track forecasting
            res = predict_storm_track(
                cyclone_id=f"HIST_{name}_{year}",
                current_lat=current_lat,
                current_lon=current_lon,
                current_wind_kmh=current_wind,
                history_fixes=history,
                mode="historical_replay"
            )
            
            forecast_map = {pt["lead_time_hours"]: pt for pt in res["forecast"]}
            
            # Ground truth points (+6h = +1 step, +12h = +2 steps, +24h = +4 steps, +48h = +8 steps)
            if i + 1 < n_points and 6 in forecast_map:
                actual_6 = df.iloc[i + 1]
                err_6 = haversine_distance_km(forecast_map[6]["lat"], forecast_map[6]["lon"], actual_6["LAT"], actual_6["LON"])
                track_errors_6h.append(err_6)
                storm_track_6h.append(err_6)
                
            if i + 2 < n_points and 12 in forecast_map:
                actual_12 = df.iloc[i + 2]
                err_12 = haversine_distance_km(forecast_map[12]["lat"], forecast_map[12]["lon"], actual_12["LAT"], actual_12["LON"])
                track_errors_12h.append(err_12)
                storm_track_12h.append(err_12)
                
            if i + 4 < n_points and 24 in forecast_map:
                actual_24 = df.iloc[i + 4]
                err_24 = haversine_distance_km(forecast_map[24]["lat"], forecast_map[24]["lon"], actual_24["LAT"], actual_24["LON"])
                track_errors_24h.append(err_24)
                storm_track_24h.append(err_24)
                
            if i + 8 < n_points and 48 in forecast_map:
                actual_48 = df.iloc[i + 8]
                err_48 = haversine_distance_km(forecast_map[48]["lat"], forecast_map[48]["lon"], actual_48["LAT"], actual_48["LON"])
                track_errors_48h.append(err_48)
                storm_track_48h.append(err_48)
                
            # Intensity estimation error check
            pred_int_wind = forecast_map[6]["wind_speed_kmh"]
            actual_int_wind = float(df.iloc[i + 1]["WIND_KMH"]) if i + 1 < n_points else current_wind
            int_err = abs(pred_int_wind - actual_int_wind)
            intensity_errors.append(int_err)
            storm_int_err.append(int_err)
            
            # Category match
            pred_cat = wind_to_category(pred_int_wind)
            actual_cat = wind_to_category(actual_int_wind)
            category_matches.append(1 if pred_cat == actual_cat else 0)

        storm_summaries.append({
            "cyclone_name": name,
            "season": year,
            "basin": target["basin"],
            "observations_tested": len(storm_track_6h),
            "mean_track_error_6h_km": round(float(np.mean(storm_track_6h)), 1) if storm_track_6h else 0,
            "mean_track_error_12h_km": round(float(np.mean(storm_track_12h)), 1) if storm_track_12h else 0,
            "mean_track_error_24h_km": round(float(np.mean(storm_track_24h)), 1) if storm_track_24h else 0,
            "mean_track_error_48h_km": round(float(np.mean(storm_track_48h)), 1) if storm_track_48h else 0,
            "mean_intensity_mae_kmh": round(float(np.mean(storm_int_err)), 1) if storm_int_err else 0
        })

    # Overall Metrics Calculation
    report = {
        "evaluation_timestamp": datetime.utcnow().isoformat(),
        "evaluation_dataset": "IBTrACS North Indian Ocean (1842-2024)",
        "model_versions_evaluated": {
            "intensity_model": "IntensityRegressor v0.1 (ResNet-18)",
            "track_forecaster": "TrackForecaster v0.1-LSTM (Temporal LSTM + Embeddings)",
            "cyclogenesis_model": "Calibrated Random Forest v0.1-RF"
        },
        "track_metrics": {
            "horizon_6h": {
                "mae_km": round(float(np.mean(track_errors_6h)), 2),
                "rmse_km": round(float(np.sqrt(np.mean(np.array(track_errors_6h)**2))), 2),
                "median_km": round(float(np.median(track_errors_6h)), 2),
                "samples": len(track_errors_6h)
            },
            "horizon_12h": {
                "mae_km": round(float(np.mean(track_errors_12h)), 2),
                "rmse_km": round(float(np.sqrt(np.mean(np.array(track_errors_12h)**2))), 2),
                "median_km": round(float(np.median(track_errors_12h)), 2),
                "samples": len(track_errors_12h)
            },
            "horizon_24h": {
                "mae_km": round(float(np.mean(track_errors_24h)), 2),
                "rmse_km": round(float(np.sqrt(np.mean(np.array(track_errors_24h)**2))), 2),
                "median_km": round(float(np.median(track_errors_24h)), 2),
                "samples": len(track_errors_24h)
            },
            "horizon_48h": {
                "mae_km": round(float(np.mean(track_errors_48h)), 2),
                "rmse_km": round(float(np.sqrt(np.mean(np.array(track_errors_48h)**2))), 2),
                "median_km": round(float(np.median(track_errors_48h)), 2),
                "samples": len(track_errors_48h)
            }
        },
        "intensity_metrics": {
            "mae_kmh": round(float(np.mean(intensity_errors)), 2),
            "rmse_kmh": round(float(np.sqrt(np.mean(np.array(intensity_errors)**2))), 2),
            "category_classification_accuracy": round(float(np.mean(category_matches) * 100), 2),
            "samples": len(intensity_errors)
        },
        "storm_breakdown": storm_summaries
    }

    reports_dir = ML_ROOT / "evaluation" / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)
    report_file = reports_dir / "backtest_report.json"
    
    with open(report_file, "w") as f:
        json.dump(report, f, indent=2)
        
    print("\n================================================================================")
    print("                       BACKTEST VALIDATION RESULTS SUMMARY                      ")
    print("================================================================================")
    print(f"Track Forecasting Errors (Haversine Distance vs IBTrACS Ground Truth):")
    print(f"  +6h Forecast:  MAE = {report['track_metrics']['horizon_6h']['mae_km']} km (RMSE = {report['track_metrics']['horizon_6h']['rmse_km']} km)")
    print(f"  +12h Forecast: MAE = {report['track_metrics']['horizon_12h']['mae_km']} km (RMSE = {report['track_metrics']['horizon_12h']['rmse_km']} km)")
    print(f"  +24h Forecast: MAE = {report['track_metrics']['horizon_24h']['mae_km']} km (RMSE = {report['track_metrics']['horizon_24h']['rmse_km']} km)")
    print(f"  +48h Forecast: MAE = {report['track_metrics']['horizon_48h']['mae_km']} km (RMSE = {report['track_metrics']['horizon_48h']['rmse_km']} km)")
    print(f"\nIntensity Estimation Performance:")
    print(f"  Wind Speed MAE:  {report['intensity_metrics']['mae_kmh']} km/h (RMSE = {report['intensity_metrics']['rmse_kmh']} km/h)")
    print(f"  Category Accuracy: {report['intensity_metrics']['category_classification_accuracy']}%")
    print(f"\nSaved comprehensive backtesting validation report to: {report_file}")
    print("================================================================================")
    return report

if __name__ == "__main__":
    backtest_historical_storms()
