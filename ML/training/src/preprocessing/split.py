import pandas as pd
from pathlib import Path
from typing import Tuple, List

def split_by_year(metadata_df: pd.DataFrame, train_end_year: int = 2014, val_end_year: int = 2016) -> Tuple[List[str], List[str], List[str]]:
    """
    Performs storm-level temporal splitting by year to prevent frame leakage across train/val/test splits.
    """
    train = metadata_df[metadata_df['year'] <= train_end_year]
    val = metadata_df[(metadata_df['year'] > train_end_year) & (metadata_df['year'] <= val_end_year)]
    test = metadata_df[metadata_df['year'] > val_end_year]
    
    return list(train['storm_id'].unique()), list(val['storm_id'].unique()), list(test['storm_id'].unique())

def save_splits(splits_dir: Path, train_ids: List[str], val_ids: List[str], test_ids: List[str]):
    splits_dir.mkdir(parents=True, exist_ok=True)
    with open(splits_dir / "train_storms.txt", "w") as f:
        f.write("\n".join(str(s) for s in train_ids))
    with open(splits_dir / "val_storms.txt", "w") as f:
        f.write("\n".join(str(s) for s in val_ids))
    with open(splits_dir / "test_storms.txt", "w") as f:
        f.write("\n".join(str(s) for s in test_ids))
