"""
IMD (India Meteorological Department) Cyclone Classification Standard.
Wind speeds in km/h.
"""

IMD_CATEGORIES = [
    (0.0, 31.0, "Depression"),
    (31.0, 49.0, "Deep Depression"),
    (49.0, 62.0, "Cyclonic Storm"),
    (62.0, 88.0, "Severe Cyclonic Storm"),
    (88.0, 118.0, "Very Severe Cyclonic Storm"),
    (118.0, 166.0, "Extremely Severe Cyclonic Storm"),
    (166.0, 999.0, "Super Cyclonic Storm"),
]

def wind_to_category(wind_kmh: float) -> str:
    """
    Maps continuous wind speed in km/h to official IMD cyclone intensity category.
    """
    for low, high, label in IMD_CATEGORIES:
        if low <= wind_kmh < high:
            return label
    return "Super Cyclonic Storm" if wind_kmh >= 166.0 else "Depression"
