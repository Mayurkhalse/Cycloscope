import numpy as np

def clean_channel(array: np.ndarray, strategy: str = "zero") -> np.ndarray:
    """
    Cleans raw image channels by handling NaN and missing data values.
    
    Args:
        array: Input numpy array (spatial or multi-channel).
        strategy: 'zero' to replace NaN with 0.0, or 'interpolate' for linear interpolation.
    """
    array = array.copy()
    if strategy == "zero":
        return np.nan_to_num(array, nan=0.0)
    elif strategy == "interpolate":
        mask = np.isnan(array)
        if not np.any(mask):
            return array
        array[mask] = np.interp(
            np.flatnonzero(mask), np.flatnonzero(~mask), array[~mask]
        )
        return array
    else:
        raise ValueError(f"Unknown cleaning strategy: {strategy}")

def normalize(array: np.ndarray, mean: float = None, std: float = None) -> np.ndarray:
    """
    Performs z-score normalization on input image arrays.
    
    Args:
        array: Input numpy array.
        mean: Mean override (if None, calculated from non-zero elements).
        std: Std override (if None, calculated from non-zero elements).
    """
    array = array.astype(np.float32)
    if mean is None:
        mean = float(np.mean(array))
    if std is None:
        std = float(np.std(array))
        if std == 0.0:
            std = 1.0
            
    return (array - mean) / std
