# data/sample_points/

Stores labeled sample point shapefiles used for ML training.

Expected contents:
- `Flooded_Points.shp` (+ .dbf, .prj, .shx) — 500 flooded locations, Label = 1
- `NonFlooded_Points.shp` (+ .dbf, .prj, .shx) — 500 non-flooded locations, Label = 0
- `samplepoints.shp` (+ .dbf, .prj, .shx) — merged dataset with Label column
