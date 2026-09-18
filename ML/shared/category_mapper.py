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

def category_to_risk(category: str) -> str:
    """
    Maps IMD category to user-facing risk level (Low, Moderate, High, Severe).
    """
    cat_lower = (category or "").lower()
    if any(s in cat_lower for s in ["super", "extremely", "very severe", "vscs", "escs", "sucs"]):
        return "Severe"
    if any(s in cat_lower for s in ["severe", "scs"]):
        return "High"
    if any(s in cat_lower for s in ["cyclonic storm", "deep depression", "cs", "dd"]):
        return "Moderate"
    return "Low"

def wind_to_code(wind_kmh: float) -> str:
    """
    Maps continuous wind speed to IMD abbreviation code (D, DD, CS, SCS, VSCS, ESCS, SuCS).
    """
    if wind_kmh >= 166.0:
        return "SuCS"
    if wind_kmh >= 118.0:
        return "ESCS"
    if wind_kmh >= 88.0:
        return "VSCS"
    if wind_kmh >= 62.0:
        return "SCS"
    if wind_kmh >= 49.0:
        return "CS"
    if wind_kmh >= 31.0:
        return "DD"
    return "D"

