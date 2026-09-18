import pandas as pd
from typing import Tuple

def persistence_forecast(past_sequence: pd.DataFrame, horizon_hours: int) -> Tuple[float, float, float]:
    """
    Naive baseline: assumes the cyclone continues at its current bearing and translation speed.
    Calculates velocity vector from the two most recent track fixes.
    
    Returns:
        (predicted_lat, predicted_lon, predicted_wind_kmh)
    """
    if len(past_sequence) < 2:
        last = past_sequence.iloc[-1]
        return float(last['lat']), float(last['lon']), float(last['wind_kmh'])
        
    last = past_sequence.iloc[-1]
    second_last = past_sequence.iloc[-2]
    
    # Calculate time delta in hours
    try:
        t_last = pd.to_datetime(last['timestamp'])
        t_prev = pd.to_datetime(second_last['timestamp'])
        dt_hours = max(1.0, (t_last - t_prev).total_seconds() / 3600.0)
    except Exception:
        dt_hours = 3.0  # standard synoptic timestep
        
    dlat = (float(last['lat']) - float(second_last['lat'])) / dt_hours * horizon_hours
    dlon = (float(last['lon']) - float(second_last['lon'])) / dt_hours * horizon_hours
    
    pred_lat = float(last['lat']) + dlat
    pred_lon = float(last['lon']) + dlon
    pred_wind = float(last['wind_kmh'])
    
    return round(pred_lat, 2), round(pred_lon, 2), round(pred_wind, 1)
