import torch
import torch.nn as nn
from torchvision.models import resnet18, ResNet18_Weights

class IntensityRegressor(nn.Module):
    """
    CNN Intensity Regressor based on ResNet-18 backbone.
    Takes satellite imagery tensor (B, C, H, W) and outputs estimated max sustained wind speed (km/h).
    """
    def __init__(self, in_channels: int = 1):
        super().__init__()
        # Use weights=None so we can load custom channel weights cleanly
        self.backbone = resnet18(weights=None)
        
        # Modify first conv layer to accept 'in_channels' (1 for IR, or 4 for multi-spectral)
        self.backbone.conv1 = nn.Conv2d(
            in_channels, 64, kernel_size=7, stride=2, padding=3, bias=False
        )
        
        # Replace final classification head with a single continuous regression output
        num_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Linear(num_features, 1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Returns shape (B,)
        return self.backbone(x).squeeze(-1)
