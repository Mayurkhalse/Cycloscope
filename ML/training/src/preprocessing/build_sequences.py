import pandas as pd
from typing import List, Dict, Any

def build_sequences(metadata_df: pd.DataFrame, window: int = 8, horizon_steps=(2, 4, 8)) -> List[Dict[str, Any]]:
    """
    Builds temporal sequences from storm metadata track fixes.
    - window: 8 prior 3-hourly frames (~24h of history)
    - horizon_steps: 2 (+6h), 4 (+12h), 8 (+24h)
    """
    sequences = []
    for storm_id, group in metadata_df.groupby("storm_id"):
        group = group.sort_values("timestamp").reset_index(drop=True)
        max_h = max(horizon_steps)
        if len(group) <= window + max_h:
            continue
            
        for i in range(window, len(group) - max_h):
            past = group.iloc[i - window:i]
            targets = {h: group.iloc[i + h] for h in horizon_steps}
            sequences.append({
                "storm_id": storm_id,
                "past": past,
                "targets": targets
            })
            
    return sequences
