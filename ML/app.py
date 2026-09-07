"""
Cyclone Scope ML Microservice - Main Entrypoint
Run this file directly via:
    python app.py
Or via uvicorn:
    uvicorn app:app --port 8000 --reload
"""
import sys
from pathlib import Path
import uvicorn

# Ensure ML root is on path
ML_ROOT = Path(__file__).resolve().parent
sys.path.append(str(ML_ROOT))

from serving.app.main import app
from serving.app.core.config import settings

if __name__ == "__main__":
    print(f"Starting {settings.PROJECT_NAME} on http://localhost:{settings.PORT}")
    print(f"Interactive Swagger Documentation: http://localhost:{settings.PORT}/docs")
    uvicorn.run("serving.app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
