# CLAUDE.md — Instructions for Claude Code
# Project: GIS Flood Susceptibility Mapping — Karabük, Turkey
# Course: CME434, Karabük University
# Deadline: May 19, 2026

---

## CONFIRMED PROJECT SETTINGS
- GEE Cloud Project ID: causal-bison-488813-q1
- GEE Tier: Community (noncommercial academic)
- GEE login: manual browser only — never automated
- Export resolution: 100m default, 30m only for final outputs if quota allows
- GIS software: GEE + Google Colab first, QGIS optional later
- ML platform: Google Colab (Python)
- Web app: Leaflet (single HTML file)
- Project folder: ~/GIS-Flood-Karabuk
- Google Drive export folder: GIS_Flood_Karabuk

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

9. Always use Auto permission mode.
   Write and execute all changes automatically without prompting.
   Only pause if a change would violate rules 1-8 above.

10. After every significant session:
    - Update docs/CHANGELOG.md with a summary of changes
    - Keep the entry brief: date, what changed, why

11. Label every piece of content you create with one of:
    [CONFIRMED] — directly from doctor's materials
    [ADAPTED]   — translated from wildfire to flood equivalent
    [ASSUMPTION] — reasonable guess, needs doctor confirmation

---

## GEE QUOTA RULES — APPLY TO EVERY GEE SCRIPT

GEE tier is Community (noncommercial). Quota is LIMITED.
Break these rules and exports will fail or quota will be exhausted.

Q1. First 5 lines of every script: define AOI as Karabük Province from FAO GAUL
Q2. Clip every image to AOI immediately after loading
Q3. Use .filterBounds(aoi) on every ImageCollection
Q4. Date ranges: max 1 year for imagery, max 5 years for climate averages
Q5. Every script starts with a print() test before any export
Q6. Default export scale: 100m (30m only for report-quality imagery)
Q7. Maximum 3 Map.addLayer() calls per script
Q8. Never call .sample() or sampleRegions() until all rasters confirmed loaded
Q9. Every script must start with this exact header comment:
    // QUOTA LEVEL: [LIGHT / MEDIUM / HEAVY]
    // PURPOSE: [one sentence]
    // EXPORTS: [list exports or NONE]
    // GEE PROJECT: causal-bison-488813-q1

---

## PROJECT OVERVIEW

Topic: A GIS and Machine Learning-Based Flood Susceptibility Mapping and
Decision Support System for Karabük Province, Turkey.

Doctor approval: CONFIRMED — flood topic accepted.

This project adapts the doctor's wildfire susceptibility workflow to flood.
Terminology translation — always use flood terms, never wildfire terms:

| Never write        | Always write            |
|--------------------|-------------------------|
| burned points      | flooded points          |
| unburned points    | non-flooded points      |
| fire probability   | flood probability       |
| fire risk          | flood susceptibility    |
| wildfire map       | flood susceptibility map|
| Propability        | FloodProb               |

Study area: Karabük Province, Turkey (inland — river flooding focus).
Main river system: Filyos Nehri and Araç Çayı tributaries.
Reference flood event: August 2021 Black Sea floods.

---

## FULL PROJECT WORKFLOW

### Step 1 — GEE Test Script [LIGHT]
File: gee/01_boundary_dem_test.js
Goal: Confirm AOI boundary and DEM load correctly. No exports.
Success: Red boundary on map, area ~4000 km², elevation stats in Console.

### Step 2 — Flood Imagery [MEDIUM]
File: gee/02_flood_imagery.js
Goal: Load Sentinel-2 RGB and Sentinel-1 SAR before/after August 2021 flood.
Exports: 4 GeoTIFFs to GIS_Flood_Karabuk on Google Drive.
Run after: Step 1 confirmed.

### Step 3 — Label Preparation [MEDIUM]
File: gee/03_label_export.js
Goal: SAR flood mask display + guide for manual digitizing of sample points.
User action required: manually digitize 500 flooded + 500 non-flooded points.
Exports: Flooded_Points.shp, NonFlooded_Points.shp, samplepoints_merged.csv
Run after: Step 2 confirmed. Exports only after manual digitizing is done.

### Step 4 — Feature Layers [HEAVY]
File: gee/04_feature_layers.js
Goal: Export all 15 flood susceptibility feature rasters at 100m.
15 features:
  1.  Elevation      (SRTM DEM)
  2.  Slope          (from DEM)
  3.  Aspect         (from DEM)
  4.  Hillshade      (from DEM)
  5.  Flow Accumulation (HydroSHEDS)
  6.  Distance to Rivers (HydroSHEDS + fastDistanceTransform)
  7.  TWI            (ln(FlowAcc / tan(Slope)))
  8.  Drainage Density (HydroSHEDS kernel)
  9.  Rainfall       (CHIRPS 2015-2020 annual mean)
  10. NDVI           (Sentinel-2 median 2020-2021)
  11. Land Cover     (ESA WorldCover 2021)
  12. Surface Water  (JRC GSW occurrence)
  13. Curvature      (Laplacian of slope)
  14. Population Density (WorldPop 2020)
  15. Distance to Roads (placeholder — see TODO.md)
Run after: Steps 1-3 confirmed. Run exports in batches if quota is low.

### Step 5 — Full AOI Export [HEAVY]
File: gee/05_full_aoi_export.js
Goal: Sample full Karabük Province at 100m (~40,000 points) for prediction.
Exports: Full_AOI_100m.csv to GIS_Flood_Karabuk.
Run after: ALL 15 feature exports from Step 4 confirmed Done.
Run alone on a fresh quota day.

### Step 6 — Data Preparation [Colab]
File: colab/01_data_preparation.ipynb
Goal: Load GEE CSV, clean, save Inputs.txt and Label.txt.
Labels: 1 = flooded, 0 = non-flooded.

### Step 7 — Machine Learning [Colab]
File: colab/02_model_training.ipynb
Goal: Train 3 classifiers, evaluate, compare, save best model.
Classifiers: Random Forest, XGBoost, SVM.
Metrics: Accuracy, Precision, Recall, F1, AUC-ROC, Confusion Matrix.

### Step 8 — Susceptibility Mapping [Colab]
File: colab/03_susceptibility_mapping.ipynb
Goal: Apply best model to full AOI, generate flood probability raster.
Output: Karabuk_Flood_Susceptibility_100m.tif
Risk classes: 1=Very Low, 2=Low, 3=Medium, 4=High, 5=Very High

### Step 9 — Web GIS App [Leaflet]
File: web/index.html
Goal: Interactive flood susceptibility map for Karabük.
Platform: Leaflet 1.9.4, single HTML file, no server needed.
Features: susceptibility layer, legend, layer toggles, popups, rainfall slider.

### Step 10 — Report
File: report/CME434_Flood_Report.docx
Goal: Comprehensive report covering all methodology, results, discussion.
Standard: Follow doctor's Chapter 8 cartographic standards for maps.

---

## FOLDER PURPOSE REFERENCE

data/raw/           → GEE-exported files — do not modify
data/processed/     → Inputs.txt, Label.txt, cleaned CSVs
data/sample_points/ → Flooded_Points.shp, NonFlooded_Points.shp
data/output/        → Probability shp and tif outputs
gee/                → GEE JavaScript scripts (.js) — paste into GEE manually
colab/              → Python Jupyter notebooks (.ipynb)
scripts/            → Utility Python scripts
web/                → Leaflet web app (index.html)
report/             → Report document and figures
outputs/maps/       → Exported map images and GeoTIFFs
outputs/models/     → Saved ML models (.pkl files)
outputs/figures/    → Charts, confusion matrices, ROC curves
docs/               → All project documentation