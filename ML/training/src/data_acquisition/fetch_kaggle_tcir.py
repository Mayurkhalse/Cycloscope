import os
import sys
import zipfile
import shutil
from pathlib import Path

DATASET_SLUG = "kbdharun/tropical-cyclone-intensity-regression"
KAGGLE_RAW_DIR = Path(__file__).resolve().parents[2] / "data" / "raw" / "kaggle_tcir"

def setup_kaggle_dataset():
    """
    Downloads and extracts the 'kbdharun/tropical-cyclone-intensity-regression' dataset from Kaggle.
    Uses Kaggle Python API if kaggle.json is configured, or inspects manually downloaded zip/files.
    """
    print("=================================================================")
    print(f"  KAGGLE DATASET FETCHER: {DATASET_SLUG}")
    print("=================================================================\n")
    
    KAGGLE_RAW_DIR.mkdir(parents=True, exist_ok=True)
    
    # Check if files already exist
    existing_files = list(KAGGLE_RAW_DIR.glob("*"))
    if any(f.suffix in [".h5", ".csv", ".npy", ".pt", ".jpg", ".png"] for f in existing_files):
        print(f"[+] Found existing dataset files in {KAGGLE_RAW_DIR}:")
        for f in existing_files[:5]:
            print(f"    - {f.name} ({f.stat().st_size / (1024*1024):.2f} MB)")
        return KAGGLE_RAW_DIR
        
    # Check for zip archive
    zip_files = list(KAGGLE_RAW_DIR.glob("*.zip"))
    if zip_files:
        zip_path = zip_files[0]
        print(f"[+] Extracting {zip_path.name}...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(KAGGLE_RAW_DIR)
        print("[+] Extraction complete!")
        return KAGGLE_RAW_DIR

    # Try downloading via Kaggle API
    print("[*] Attempting automated download via Kaggle API...")
    try:
        import kaggle
        from kaggle.api.kaggle_api_extended import KaggleApi
        
        api = KaggleApi()
        api.authenticate()
        print(f"[+] Authenticated with Kaggle API. Downloading {DATASET_SLUG}...")
        api.dataset_download_files(DATASET_SLUG, path=str(KAGGLE_RAW_DIR), unzip=True)
        print("[+] Successfully downloaded and unzipped Kaggle dataset!")
        return KAGGLE_RAW_DIR
    except Exception as e:
        print(f"\n[-] Automated Kaggle API download note: {e}")
        print("\n-----------------------------------------------------------------")
        print("  HOW TO DOWNLOAD THIS KAGGLE DATASET:                           ")
        print("-----------------------------------------------------------------")
        print(f"Option 1: Using Kaggle CLI:")
        print(f"    kaggle datasets download -d {DATASET_SLUG} -p {KAGGLE_RAW_DIR} --unzip")
        print(f"\nOption 2: Browser Download:")
        print(f"    1. Open: https://www.kaggle.com/datasets/{DATASET_SLUG}")
        print(f"    2. Click 'Download' (archive.zip)")
        print(f"    3. Extract or place the zip file in:")
        print(f"       {KAGGLE_RAW_DIR}")
        print("=================================================================\n")
        
    return KAGGLE_RAW_DIR

if __name__ == "__main__":
    setup_kaggle_dataset()
