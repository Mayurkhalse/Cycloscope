import torch
import torch.nn as nn

class TrackForecaster(nn.Module):
    """
    Temporal LSTM over sequence of satellite frame embeddings + numeric track fixes [lat, lon, wind_kmh].
    Outputs multi-horizon trajectory predictions (+6h, +12h, +24h).
    """
    def __init__(self, embedding_dim: int = 512, numeric_dim: int = 3, hidden_dim: int = 128, horizons: int = 3):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size=embedding_dim + numeric_dim,
            hidden_size=hidden_dim,
            batch_first=True
        )
        # Multi-horizon output heads for (+6h, +12h, +24h): each outputs [dlat, dlon, dwind]
        self.heads = nn.ModuleList([
            nn.Linear(hidden_dim, 3) for _ in range(horizons)
        ])

    def forward(self, frame_embeddings: torch.Tensor, numeric: torch.Tensor):
        # frame_embeddings: (B, seq_len, 512), numeric: (B, seq_len, 3)
        x = torch.cat([frame_embeddings, numeric], dim=-1)
        _, (h_n, _) = self.lstm(x)
        # h_n[-1] shape: (B, hidden_dim)
        outputs = [head(h_n[-1]) for head in self.heads]
        return outputs
