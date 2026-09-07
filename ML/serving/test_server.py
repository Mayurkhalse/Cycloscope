import sys
from pathlib import Path
from fastapi.testclient import TestClient

ML_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ML_ROOT))

from serving.app.main import app

def run_comprehensive_tests():
    client = TestClient(app)
    print("=================================================================")
    print("      Testing Full Cyclone Scope ML FastAPI Microservice         ")
    print("=================================================================\n")
    
    # 1. Root & Health
    res_root = client.get("/")
    print(f"[+] GET / -> {res_root.status_code} | {res_root.json()}")
    assert res_root.status_code == 200
    
    res_health = client.get("/health")
    print(f"[+] GET /health -> {res_health.status_code} | {res_health.json()}")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "ok"
    
    # 2. Intensity Prediction
    res_intensity = client.post("/predict/intensity", json={"cyclone_id": "TEST_001", "channel": "IR"})
    print(f"[+] POST /predict/intensity -> {res_intensity.status_code} | {res_intensity.json()}")
    assert res_intensity.status_code == 200
    assert "wind_speed_kmh" in res_intensity.json()
    assert "category" in res_intensity.json()
    
    # 3. Detection
    res_detection = client.post("/predict/detection", json={"region": "bay_of_bengal"})
    print(f"[+] POST /predict/detection -> {res_detection.status_code} | {res_detection.json()}")
    assert res_detection.status_code == 200
    assert "system_detected" in res_detection.json()
    
    # 4. Track Forecasting
    res_track = client.post("/predict/track", json={"cyclone_id": "TEST_001", "current_lat": 15.0, "current_lon": 88.0, "current_wind_kmh": 65.0})
    print(f"[+] POST /predict/track -> {res_track.status_code} | {res_track.json()}")
    assert res_track.status_code == 200
    assert len(res_track.json()["forecast"]) == 3
    
    # 5. Cyclogenesis Probability
    res_genesis = client.post("/predict/cyclogenesis", json={"region": "bay_of_bengal", "sea_surface_temp_c": 29.0, "vertical_wind_shear_knots": 10.0})
    print(f"[+] POST /predict/cyclogenesis -> {res_genesis.status_code} | {res_genesis.json()}")
    assert res_genesis.status_code == 200
    assert "probability_48h" in res_genesis.json()
    
    # 6. Live Region Scan & Storm Update
    res_scan = client.post("/live/scan-regions")
    print(f"[+] POST /live/scan-regions -> {res_scan.status_code} | {res_scan.json()}")
    assert res_scan.status_code == 200
    
    res_update = client.post("/live/update-cyclone/TEST_001", json={"lastKnownLat": 15.0, "lastKnownLon": 88.0})
    print(f"[+] POST /live/update-cyclone/TEST_001 -> {res_update.status_code} | {res_update.json()}")
    assert res_update.status_code == 200
    
    print("\n=================================================================")
    print("  ALL 6 ROUTERS & MICROSERVICE ENDPOINTS VERIFIED SUCCESSFULLY! ")
    print("=================================================================")

if __name__ == "__main__":
    run_comprehensive_tests()
