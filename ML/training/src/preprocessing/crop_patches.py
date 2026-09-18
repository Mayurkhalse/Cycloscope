import numpy as np

def crop_around_center(full_image: np.ndarray, center_lat: float, center_lon: float, grid_resolution_deg: float = 0.05, radius_deg: float = 7.0) -> np.ndarray:
    """
    Mirrors TCIR's convention: 7-degree radius box centered on the storm.
    Keeping this consistent with TCIR ensures models remain compatible with serving preprocessing.
    """
    half_px = int(radius_deg / grid_resolution_deg)
    h, w = full_image.shape[:2]
    center_y, center_x = h // 2, w // 2
    
    y_min = max(0, center_y - half_px)
    y_max = min(h, center_y + half_px)
    x_min = max(0, center_x - half_px)
    x_max = min(w, center_x + half_px)
    
    return full_image[y_min:y_max, x_min:x_max]
