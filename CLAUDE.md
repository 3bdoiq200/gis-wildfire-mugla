# CLAUDE.md — Instructions for Claude Code
# Project: GIS Flood Susceptibility Mapping — Karabük, Turkey
# Course: CME434, Karabük University
# Deadline: May 19, 2026

---

## SAFETY RULES — ALWAYS FOLLOW THESE

1. Work ONLY inside this folder: ~/GIS-Flood-Karabuk/
   Do not read, write, or modify any file outside this folder.

2. Do NOT delete any file unless the user types exactly:
   "DELETE [filename] — confirmed"

3. Do NOT run destructive commands such as:
   rm -rf, git reset --hard, DROP TABLE, truncate, format, mkfs

4. Do NOT use or store real API keys, passwords, tokens, or credentials.
   Use placeholder comments like: # YOUR_GEE_PROJECT_ID_HERE

5. Do NOT install any package without first explaining:
   - What the package does
   - Why it is needed for this project
   - Then wait for user confirmation

6. Do NOT start full code implementation until the user says:
   "Start implementation — [section name]"

7. Do NOT assume dataset files exist. Always check with:
   ls data/raw/ or ls data/processed/
   before referencing any file by name.

8. Before any large change to an existing file:
   - Show the user what will change
   - Wait for confirmation
   - Create a backup: cp file.ext file.ext.bak

9. After every significant session:
   - Update docs/CHANGELOG.md with a summary of changes
   - Keep the entry brief: date, what changed, why

10. Label every piece of content you create with one of:
    [CONFIRMED] — directly from doctor's materials
    [ADAPTED]   — translated from wildfire to flood equivalent
    [ASSUMPTION] — reasonable guess, needs doctor confirmation

---

## PROJECT OVERVIEW

Topic: A GIS and Machine Learning-Based Flood Susceptibility Mapping and
Decision Support System for Karabük Province, Turkey.

This project adapts the doctor's wildfire susceptibility workflow to flood
susceptibility. Every concept has been translated:
- burned points     → flooded / flood-prone points (Label = 1)
- unburned points   → non-flooded / safer points  (Label = 0)
- wildfire features → flood susceptibility factors
- wildfire map      → flood susceptibility map
- fire DSS          → flood decision-support system

Study area: Karabük Province, Turkey (inland, focus on river flooding).
The Filyos River and its tributaries are the primary flood risk system.

---

## FULL PROJECT WORKFLOW

### Step 1 — Project Planning
- Define study area boundary (Karabük Province)
- Identify a real flood event for before/after imagery
- Confirm 15 flood susceptibility features
- Confirm grading requirements with doctor

### Step 2 — Data Collection
Platform: Google Earth Engine (primary)
Backup sources: USGS EarthExplorer, Copernicus Open Access Hub, AFAD

Key datasets:
- Admin boundary: FAO GAUL (GEE)
- DEM: SRTM 30m → USGS/SRTMGL1_003 (GEE)
- Flood reference: Sentinel-1 SAR → COPERNICUS/S1_GRD (GEE)
- Optical imagery: Sentinel-2 → COPERNICUS/S2_SR_HARMONIZED (GEE)
- Rainfall: CHIRPS → UCSB-CHG/CHIRPS/DAILY (GEE)
- Land cover: ESA WorldCover → ESA/WorldCover/v200 (GEE)
- Water history: JRC GSW → JRC/GSW1_4/GlobalSurfaceWater (GEE)
- Rivers: HydroSHEDS → WWF/HydroSHEDS/v1/FreeFlowingRivers (GEE)
- Flow accumulation: WWF/HydroSHEDS/30ACC (GEE)

### Step 3 — Label Preparation [10 marks]
- Load Sentinel-1 SAR flood imagery in GEE
- Identify flooded areas visually or with threshold
- Allocate 500 flooded sample points (Label = 1)
- Allocate 500 non-flooded sample points (Label = 0)
- Export: Flooded_Points.shp, NonFlooded_Points.shp
- Merge into: samplepoints.shp (with Label column)

### Step 4 — Feature Preparation [10 marks]
Prepare 15 flood susceptibility raster layers at 100m resolution:
1.  Elevation          (SRTM DEM)
2.  Slope              (derived from DEM)
3.  Aspect             (derived from DEM)
4.  TWI                (Topographic Wetness Index = ln(flow_acc/tan(slope)))
5.  Flow Accumulation  (HydroSHEDS)
6.  Distance to Rivers (HydroSHEDS + fastDistanceTransform)
7.  Drainage Density   (HydroSHEDS stream density)
8.  Rainfall           (CHIRPS annual mean)
9.  NDVI               (Sentinel-2 normalizedDifference B8/B4)
10. Land Cover         (ESA WorldCover)
11. Curvature          (from DEM)
12. Surface Water      (JRC GSW occurrence)
13. Distance to Roads  (OSM roads rasterized)
14. Hillshade          (from DEM)
15. Population Density (WorldPop or settlements proxy)

### Step 5 — Training Dataset Preparation [10 marks]
- Stack all 15 feature rasters in GEE
- Sample feature values at 1000 labeled points
- Export as CSV
- Clean in Python: drop .geo, system:index, latitude, longitude
- Save: Inputs.txt (15 columns, no header)
- Save: Label.txt  (1 column: 1 or 0, no header)

### Step 6 — Machine Learning [10 marks]
Train 3 classifiers, each with 2 parameter sets:

Classifier 1: Random Forest
- Why: robust, no scaling needed, gives feature importance
- Library: sklearn.ensemble.RandomForestClassifier
- Key params: n_estimators, max_depth, min_samples_split

Classifier 2: XGBoost
- Why: state-of-the-art accuracy, handles imbalance well
- Library: xgboost.XGBClassifier
- Key params: n_estimators, learning_rate, max_depth

Classifier 3: Support Vector Machine (SVM)
- Why: strong theoretical foundation, works well with scaled features
- Library: sklearn.svm.SVC (probability=True)
- Key params: C, gamma, kernel
- Note: requires StandardScaler preprocessing

Evaluation metrics per model:
- Accuracy (train + test)
- Precision, Recall, F1-score
- AUC-ROC
- Confusion matrix

### Step 7 — Model Comparison and Selection
- Build comparison table (DataFrame)
- Plot ROC curves for all 3 models
- Select best model based on AUC-ROC and F1
- Justify selection in report
- Save best model: joblib.dump(model, 'outputs/models/best_flood_model.pkl')

### Step 8 — Flood Susceptibility Mapping [10 marks]
- Load Full_Point_Dataset_100m.csv (full Karabük AOI)
- Clean (same drops as training data)
- Load best model
- Predict: flood_prob = model.predict_proba(X)[:,1]
- Save: Karabuk_Flood_Probability.shp (GeoDataFrame)
- Rasterize: Karabuk_Flood_Susceptibility_100m.tif
  CRS: EPSG:32636, resolution: 100m
- Classify into 5 risk classes:
  1 = Very Low  (prob 0.0–0.2) — green
  2 = Low       (prob 0.2–0.4) — light green
  3 = Medium    (prob 0.4–0.6) — yellow
  4 = High      (prob 0.6–0.8) — orange
  5 = Very High (prob 0.8–1.0) — red

### Step 9 — Web GIS Decision-Support System [30 marks]
Platform: Leaflet.js (single HTML file, no server needed)
File: web/index.html

Required features:
- Interactive Leaflet map centered on Karabük (lat: 41.2, lng: 32.6, zoom: 10)
- Flood susceptibility layer (color by risk class)
- Risk legend (5 classes with color swatches)
- Layer control (susceptibility on/off, rivers, admin boundary)
- Clickable popups (risk class, probability %, coordinates)
- Title and info panel

Optional features (bonus):
- Rainfall scenario slider
- Area-of-interest drawing tool

### Step 10 — Report and Submission
- Comprehensive written report (all methodology, results, discussion)
- Cartographic map layout following Chapter 8 standards:
  north arrow, scale bar, legend, neatline, locator map
- All figures: feature maps, confusion matrices, ROC curves, susceptibility map
- Web app screenshots
- All code in appendix

---

## FOLDER PURPOSE REFERENCE

data/raw/          → GEE-exported files (CSV, TIF, SHP) — do not modify
data/processed/    → cleaned Python outputs (Inputs.txt, Label.txt, etc.)
data/sample_points/→ label shapefiles (Flooded_Points.shp, etc.)
gee/               → GEE JavaScript scripts (.js files)
colab/             → Python/Jupyter notebooks (.ipynb files)
scripts/           → utility Python scripts
web/               → Leaflet web app (index.html + data/)
report/            → report document and figures
outputs/maps/      → exported map images and GeoTIFFs
outputs/models/    → saved ML models (.pkl files)
outputs/figures/   → charts, confusion matrices, ROC curves
docs/              → project documentation

---

## WHEN IMPLEMENTING CODE

GEE scripts (.js files):
- Use JavaScript syntax
- Always define 'aoi' as Karabük Province boundary
- Use same Export.table.toDrive / Export.image.toDrive pattern
- Add clear TODO comments for user-specific values
- Never hardcode project IDs

Python notebooks (.ipynb):
- Use markdown cells for section headers
- Include expected output in comments
- Handle NaN and missing values explicitly
- Save all outputs to correct subfolders

Web app (index.html):
- Must work by opening directly in browser (no server)
- Use Leaflet 1.9.4 from cdnjs.cloudflare.com
- Load GeoJSON from data/ subfolder
- All CSS and JS in one file

---

## TERMINOLOGY GUIDE

Always use flood terminology, never wildfire terminology:

| Never write      | Always write          |
|------------------|-----------------------|
| burned points    | flooded points        |
| unburned points  | non-flooded points    |
| fire probability | flood probability     |
| fire risk        | flood susceptibility  |
| wildfire map     | flood susceptibility map |
| Propability      | FloodProb (correct spelling) |
