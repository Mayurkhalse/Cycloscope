import numpy as np

def clean_channel(array: np.ndarray, strategy: str = "zero") -> np.ndarray:
    """
    Cleans missing values / NaNs in satellite channel arrays.
    """
    if strategy == "zero":
        return np.nan_to_num(array, nan=0.0)
    if strategy == "interpolate":
        mask = np.isnan(array)
        if not np.any(mask):
            return array
        flat = array.flatten()
        flat_mask = np.isnan(flat)
        flat[flat_mask] = np.interp(
            np.flatnonzero(flat_mask), np.flatnonzero(~flat_mask), flat[~flat_mask]
        )
        return flat.reshape(array.shape)
    raise ValueError(f"Unknown strategy: {strategy}")
