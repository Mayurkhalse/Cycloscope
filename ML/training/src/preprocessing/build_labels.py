from shared.category_mapper import wind_to_category, IMD_CATEGORIES

def build_sample_labels(wind_kmh: float):
    """
    Produces both regression targets (wind speed km/h) and classification targets (IMD category).
    """
    return {
        "wind_speed_kmh": float(wind_kmh),
        "imd_category": wind_to_category(wind_kmh)
    }
