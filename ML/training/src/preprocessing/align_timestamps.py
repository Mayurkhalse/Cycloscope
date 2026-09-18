import pandas as pd

def align_track_and_satellite(track_df: pd.DataFrame, satellite_df: pd.DataFrame, tolerance_hours: int = 3) -> pd.DataFrame:
    """
    Matches best-track records with the closest satellite frame within +/- tolerance_hours.
    """
    track = track_df.copy()
    sat = satellite_df.copy()
    track["timestamp"] = pd.to_datetime(track["timestamp"])
    sat["timestamp"] = pd.to_datetime(sat["timestamp"])
    
    merged = pd.merge_asof(
        track.sort_values("timestamp"),
        sat.sort_values("timestamp"),
        on="timestamp",
        by="storm_id",
        direction="nearest",
        tolerance=pd.Timedelta(hours=tolerance_hours)
    )
    return merged.dropna(subset=["image_path"] if "image_path" in merged.columns else track.columns)
