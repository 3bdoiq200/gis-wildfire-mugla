# GIS Flood Susceptibility Mapping — Karabük, Turkey

**Course:** CME434 — Geographic Information Systems  
**University:** Karabük University  
**Topic:** A GIS and Machine Learning-Based Flood Susceptibility Mapping and Decision Support System  
**Study Area:** Karabük Province, Turkey  
**Deadline:** May 19, 2026  

---

## Project Description [CONFIRMED]

This project develops a flood susceptibility map for Karabük Province, Turkey,
combining Google Earth Engine (GEE), machine learning, and an interactive web
GIS application. Terrain and environmental features are extracted from satellite
datasets in GEE; flooded and non-flooded sample points are labeled using
Sentinel-1 SAR flood imagery; three classifiers (Random Forest, XGBoost, SVM)
are trained and compared; and the best model generates a province-wide flood
probability surface classified into five risk levels. Results are delivered
through a browser-based Leaflet.js Decision Support System (DSS) that requires
no server to run.

The primary flood risk system is the **Filyos River** and its tributaries
flowing through Karabük Province. All outputs use **EPSG:32636** (UTM Zone 36N)
at **100 m raster resolution**.

---

## Grading Breakdown [CONFIRMED]

| # | Component | Marks |
|---|-----------|------:|
| 1 | Flood event selection (before/after Sentinel imagery) | 20 |
| 2 | Label preparation (500 flooded + 500 non-flooded points) | 10 |
| 3 | Feature preparation (15 flood susceptibility rasters) | 10 |
| 4 | Training dataset (Inputs.txt + Label.txt) | 10 |
| 5 | Model development (RF + XGBoost + SVM, 2 param sets each) | 10 |
| 6 | Flood susceptibility mapping (5 risk classes, GeoTIFF) | 10 |
| 7 | Web GIS Decision-Support System (Leaflet app) | 30 |
| | **Total** | **100** |

---

## Technology Stack [CONFIRMED]

| Layer | Tool | Purpose |
|-------|------|---------|
| Data collection | Google Earth Engine (JavaScript) | Export DEM, SAR, Sentinel-2, CHIRPS, HydroSHEDS, land cover |
| Machine learning | Python — scikit-learn, XGBoost | Train and evaluate RF, XGBoost, SVM classifiers |
| Spatial processing | Python — GeoPandas, Rasterio | Rasterize flood probability map, classify risk levels |
| Web GIS | Leaflet.js 1.9.4 | Interactive DSS (single HTML file, no server required) |
| Cartography | QGIS (optional) | Visual verification and final map layout |

---

## Project Status

🟡 Environment setup — in progress

---

## Folder Structure

```
data/
  raw/           → GEE-exported files (CSV, TIF, SHP) — do not modify
  processed/     → cleaned Python outputs (Inputs.txt, Label.txt, etc.)
  sample_points/ → flooded / non-flooded label shapefiles
gee/             → Google Earth Engine JavaScript scripts (.js)
colab/           → Python / Colab ML notebooks (.ipynb)
scripts/         → utility Python scripts
web/             → Leaflet web GIS app (index.html + data/)
report/          → report document and figures
outputs/
  maps/          → exported map images and GeoTIFFs
  models/        → saved ML models (.pkl)
  figures/       → charts, confusion matrices, ROC curves
docs/            → project documentation
```

---

## Quick Start

| Document | Purpose |
|----------|---------|
| [docs/TODO.md](docs/TODO.md) | Day-by-day work plan (May 2–19) |
| [docs/GRADING_CHECKLIST.md](docs/GRADING_CHECKLIST.md) | 100-mark checkbox checklist |
| [docs/DATASETS.md](docs/DATASETS.md) | All GEE datasets with priority and notes |
| [CLAUDE.md](CLAUDE.md) | AI assistant rules and full project workflow |
