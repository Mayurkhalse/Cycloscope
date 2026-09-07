import numpy as np

def latlon_to_pixel(full_image: np.ndarray, lat: float, lon: float, 
                    lat_bounds=(0.0, 40.0), lon_bounds=(40.0, 110.0)) -> tuple:
    """
    Converts (lat, lon) coordinates to pixel indices on a full-disk satellite frame.
    """
    h, w = full_image.shape[:2]
    lat_min, lat_max = lat_bounds
    lon_min, lon_max = lon_bounds
    
    row = int((lat_max - lat) / (lat_max - lat_min) * h)
    col = int((lon - lon_min) / (lon_max - lon_min) * w)
    
    row = max(0, min(h - 1, row))
    col = max(0, min(w - 1, col))
    return row, col

def crop_around_center(full_image: np.ndarray, center_lat: float, center_lon: float, 
                       grid_resolution_deg: float = 0.05, radius_deg: float = 7.0) -> np.ndarray:
    """
    Crops a 7-degree radius box (201x201 pixels) centered on the cyclone center.
    Mirrors TCIR conventions for seamless model compatibility.
    """
    half_px = int(radius_deg / grid_resolution_deg)
    center_row, center_col = latlon_to_pixel(full_image, center_lat, center_lon)
    
    row_start = max(0, center_row - half_px)
    row_end = min(full_image.shape[0], center_row + half_px)
    col_start = max(0, center_col - half_px)
    col_end = min(full_image.shape[1], center_col + half_px)
    
    crop = full_image[row_start:row_end, col_start:col_end]
    
    # Pad to 201x201 if near boundary
    target_size = (2 * half_px, 2 * half_px)
    if crop.shape[:2] != target_size:
        padded = np.zeros((*target_size, crop.shape[2] if crop.ndim > 2 else 1), dtype=crop.dtype)
        h, w = min(crop.shape[0], target_size[0]), min(crop.shape[1], target_size[1])
        padded[:h, :w] = crop[:h, :w] if crop.ndim > 2 else crop[:h, :w, np.newaxis]
        return padded
        
    return crop
