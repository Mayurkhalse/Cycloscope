from pydantic import BaseModel
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    PROJECT_NAME: str = "Cyclone Scope ML Microservice"
    VERSION: str = "0.1.0"
    API_PREFIX: str = ""
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    MODEL_VERSION: str = os.getenv("MODEL_VERSION", "v0.1")
    ML_ROOT_DIR: Path = Path(__file__).resolve().parents[3]
    
    # MOSDAC Configuration
    MOSDAC_USERNAME: str = os.getenv("MOSDAC_USERNAME", "")
    MOSDAC_PASSWORD: str = os.getenv("MOSDAC_PASSWORD", "")
    MOSDAC_PRODUCT_CODE: str = os.getenv("MOSDAC_PRODUCT_CODE", "3D_IMG_L1B_STD")

settings = Settings()
