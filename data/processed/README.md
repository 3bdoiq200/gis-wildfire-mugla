# data/processed/

Stores Python-cleaned outputs derived from files in `data/raw/`.

Expected contents:
- `Inputs.txt` — 15-column feature matrix, no header, one row per sample point
- `Label.txt`  — 1-column label vector (1 = flooded, 0 = non-flooded), no header
- Any intermediate cleaned CSVs produced during data preparation
