import torch
import numpy as np
from typing import Dict

@torch.no_grad()
def run_test_evaluation(model, test_loader, device) -> Dict[str, float]:
    """
    Evaluates final model checkpoint on untouched test split.
    Calculates Test MAE and RMSE.
    """
    model.eval()
    errors = []
    sq_errors = []
    
    for images, targets in test_loader:
        images, targets = images.to(device), targets.to(device)
        preds = model(images)
        
        abs_err = torch.abs(preds - targets)
        sq_err = (preds - targets) ** 2
        
        errors.append(abs_err)
        sq_errors.append(sq_err)
        
    if not errors:
        return {"test_mae_kmh": 0.0, "test_rmse_kmh": 0.0}
        
    mae = torch.cat(errors).mean().item()
    rmse = np.sqrt(torch.cat(sq_errors).mean().item())
    
    print("\n==================================================")
    print(f"  TEST SET EVALUATION RESULTS (Untouched Test Split)")
    print(f"  Test MAE:  {mae:.2f} km/h")
    print(f"  Test RMSE: {rmse:.2f} km/h")
    print("==================================================\n")
    
    return {
        "test_mae_kmh": round(mae, 2),
        "test_rmse_kmh": round(rmse, 2)
    }
