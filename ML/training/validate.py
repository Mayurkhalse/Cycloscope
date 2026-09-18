import torch

@torch.no_grad()
def validate_epoch(model, dataloader, criterion, device):
    """
    Validates model performance on validation split.
    Returns:
        mean_mae: Mean Absolute Error on wind speed (km/h)
        mean_loss: MSE loss
    """
    model.eval()
    errors = []
    total_loss = 0.0
    count = 0
    
    for images, targets in dataloader:
        images, targets = images.to(device), targets.to(device)
        preds = model(images)
        loss = criterion(preds, targets)
        
        errors.append(torch.abs(preds - targets))
        total_loss += loss.item() * images.size(0)
        count += images.size(0)
        
    if count == 0:
        return 0.0, 0.0
        
    mean_mae = torch.cat(errors).mean().item()
    mean_loss = total_loss / count
    return mean_mae, mean_loss
