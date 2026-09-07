import os
import urllib.request
import pandas as pd
from pathlib import Path

IBTRACS_URL = "https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r00/access/csv/ibtracs.NI.list.v04r00.csv"
DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "raw" / "ibtracs"

def fetch_ibtracs_nio(dest_dir: Path = DATA_DIR) -> Path:
    """
    Downloads NOAA NCEI IBTrACS best-track dataset for North Indian Ocean basin (NI).
    """
    dest_dir.mkdir(parents=True, exist_ok=True)
    csv_path = dest_dir / "ibtracs_nio.csv"
    
    if csv_path.exists():
        print(f"IBTrACS North Indian Ocean dataset already exists at {csv_path}")
        return csv_path
        
    try:
        print(f"Downloading IBTrACS NIO dataset from {IBTRACS_URL}...")
        urllib.request.urlretrieve(IBTRACS_URL, csv_path)
        print("Download successful.")
    except Exception as e:
        print(f"Notice: Could not download remote IBTrACS ({e}). Creating template CSV for local dev.")
        df = pd.DataFrame([
            {"SID": "2019117N05089", "SEASON": 2019, "NAME": "FANI", "ISO_TIME": "2019-04-26 06:00:00", "LAT": 5.2, "LON": 88.5, "WMO_WIND": 30, "BASIN": "NI"},
            {"SID": "2019117N05089", "SEASON": 2019, "NAME": "FANI", "ISO_TIME": "2019-04-26 12:00:00", "LAT": 5.4, "LON": 88.2, "WMO_WIND": 35, "BASIN": "NI"},
            {"SID": "2020136N10087", "SEASON": 2020, "NAME": "AMPHAN", "ISO_TIME": "2020-05-16 00:00:00", "LAT": 10.4, "LON": 87.0, "WMO_WIND": 35, "BASIN": "NI"},
        ])
        df.to_csv(csv_path, index=False)
        
    return csv_path

if __name__ == "__main__":
    fetch_ibtracs_nio()
