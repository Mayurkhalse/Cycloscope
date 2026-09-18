import torch
import torch.nn as nn
from torchvision.models import resnet18

class CycloneDetectionCNN(nn.Module):
    """
    Binary / Multi-class Cyclone Detection CNN for regional scanning.
    Backbone: ResNet-18 with single-channel IR convolution input.
    """
    def __init__(self, in_channels: int = 1):
        super().__init__()
        self.backbone = resnet18(weights=None)
        self.backbone.conv1 = nn.Conv2d(in_channels, 64, kernel_size=7, stride=2, padding=3, bias=False)
        self.backbone.fc = nn.Sequential(
            nn.Linear(self.backbone.fc.in_features, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.backbone(x).squeeze(-1)
