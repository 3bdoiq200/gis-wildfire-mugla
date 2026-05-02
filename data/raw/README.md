# data/raw/

Stores all files exported directly from Google Earth Engine (GEE):
CSV tables, GeoTIFF rasters, and Shapefiles.

**Do not modify files in this folder.**
All cleaning and processing happens in `data/processed/` via Python notebooks.

Expected contents (once exported from GEE):
- `Karabuk_boundary.*` — admin boundary shapefile
- `Sentinel1_*` — SAR imagery for flood labeling
- `Feature_*.tif` — 15 flood susceptibility raster layers
- `SamplePoints_Features.csv` — feature values at 1000 labeled points
- `Full_Point_Dataset_100m.csv` — full AOI grid for susceptibility prediction
