# Grading Checklist — 100 Marks
# CME434 — GIS Flood Susceptibility Mapping, Karabük
# Deadline: May 19, 2026

Check off each item as it is completed and verified.

---

## 1. Flood Event Selection — 20 marks [CONFIRMED]

- [ ] Identify a real flood event in or near Karabük Province with documented dates
- [ ] Record event date range and source (AFAD records, news, or COPERNICUS EMS)
- [ ] Load Sentinel-1 SAR pre-flood image in GEE for the chosen event window
- [ ] Load Sentinel-1 SAR post-flood image in GEE for the chosen event window
- [ ] Load Sentinel-2 optical pre-flood image in GEE (cloud-filtered)
- [ ] Load Sentinel-2 optical post-flood image in GEE (cloud-filtered)
- [ ] Visually document flood extent comparison (export or screenshot)
- [ ] Include annotated before/after imagery panels in report

---

## 2. Label Preparation — 10 marks [ADAPTED]

- [ ] Define 500 flooded sample point locations (Label = 1) in GEE
- [ ] Define 500 non-flooded sample point locations (Label = 0) in GEE
- [ ] Verify points are spatially distributed across the study area (not clustered)
- [ ] Export `Flooded_Points.shp` to Google Drive
- [ ] Export `NonFlooded_Points.shp` to Google Drive
- [ ] Merge into `samplepoints.shp` with a `Label` column (1 or 0)
- [ ] Move all shapefiles to `data/sample_points/`

---

## 3. Feature Preparation — 10 marks [ADAPTED]

- [ ] Feature 1: Elevation — exported at 100m resolution
- [ ] Feature 2: Slope — derived from SRTM DEM
- [ ] Feature 3: Aspect — derived from SRTM DEM
- [ ] Feature 4: TWI — ln(flow_acc / tan(slope))
- [ ] Feature 5: Flow Accumulation — from HydroSHEDS 30ACC
- [ ] Feature 6: Distance to Rivers — fastDistanceTransform from HydroSHEDS
- [ ] Feature 7: Drainage Density — stream density from HydroSHEDS
- [ ] Feature 8: Rainfall — CHIRPS annual mean
- [ ] Feature 9: NDVI — Sentinel-2 normalizedDifference(B8, B4)
- [ ] Feature 10: Land Cover — ESA WorldCover v2
- [ ] Feature 11: Curvature — derived from SRTM DEM
- [ ] Feature 12: Surface Water — JRC GSW occurrence band
- [ ] Feature 13: Distance to Roads — rasterized OSM roads
- [ ] Feature 14: Hillshade — derived from SRTM DEM
- [ ] Feature 15: Population Density — WorldPop 100m
- [ ] All 15 rasters exported at 100m resolution in EPSG:32636
- [ ] All rasters clipped to Karabük Province AOI
- [ ] Rasters moved to `data/raw/`

---

## 4. Training Dataset Preparation — 10 marks [CONFIRMED]

- [ ] Stack all 15 feature rasters into one image in GEE
- [ ] Sample feature values at all 1000 labeled points
- [ ] Export combined CSV from GEE to Google Drive
- [ ] Move CSV to `data/raw/`
- [ ] Open CSV in Python; inspect columns and null counts
- [ ] Drop `.geo`, `system:index` columns
- [ ] Handle NaN / missing values (drop or impute)
- [ ] Save `data/processed/Inputs.txt` (15 columns, no header, space/comma-delimited)
- [ ] Save `data/processed/Label.txt` (1 column: 1 or 0, no header)
- [ ] Verify row counts match between Inputs.txt and Label.txt

---

## 5. Model Development — 10 marks [CONFIRMED]

- [ ] Split data into train / test sets (e.g., 80/20)
- [ ] Train Random Forest — parameter set 1 (baseline)
- [ ] Train Random Forest — parameter set 2 (tuned)
- [ ] Train XGBoost — parameter set 1 (baseline)
- [ ] Train XGBoost — parameter set 2 (tuned)
- [ ] Train SVM — parameter set 1 (baseline, with StandardScaler)
- [ ] Train SVM — parameter set 2 (tuned, with StandardScaler)
- [ ] Compute train accuracy and test accuracy for all 6 runs
- [ ] Compute Precision, Recall, F1-score for all 6 runs
- [ ] Compute AUC-ROC for all 6 runs
- [ ] Generate confusion matrix for each run
- [ ] Build comparison DataFrame with all metrics
- [ ] Plot ROC curves for all 3 best models on one figure
- [ ] Select best model based on AUC-ROC and F1; justify selection in report
- [ ] Save best model: `outputs/models/best_flood_model.pkl`

---

## 6. Flood Susceptibility Mapping — 10 marks [ADAPTED]

- [ ] Export full Karabük AOI feature grid at 100m to `Full_Point_Dataset_100m.csv`
- [ ] Apply same cleaning steps to full dataset as to training data
- [ ] Load `best_flood_model.pkl`
- [ ] Predict: `FloodProb = model.predict_proba(X)[:, 1]`
- [ ] Create GeoDataFrame with point geometry and FloodProb column
- [ ] Save `outputs/maps/Karabuk_Flood_Probability.shp`
- [ ] Rasterize to `outputs/maps/Karabuk_Flood_Susceptibility_100m.tif` (EPSG:32636, 100m)
- [ ] Classify into 5 risk classes (Very Low 0.0–0.2, Low 0.2–0.4, Medium 0.4–0.6, High 0.6–0.8, Very High 0.8–1.0)
- [ ] Create cartographic map with: title, legend, scale bar, north arrow, neatline, locator map
- [ ] Export map figure to `outputs/figures/`

---

## 7. Web GIS Decision-Support System — 30 marks [CONFIRMED]

- [ ] Create `web/index.html` as a single self-contained file
- [ ] App opens correctly by double-clicking the file (no local server needed)
- [ ] Leaflet map initializes centered on Karabük (lat: 41.2, lng: 32.6, zoom: 10)
- [ ] Flood susceptibility GeoJSON layer loaded from `web/data/`
- [ ] Features colored by risk class (green → yellow → red, 5 classes)
- [ ] Risk legend displayed (5 classes with color swatches and labels)
- [ ] Layer control panel with susceptibility on/off, rivers on/off, admin boundary on/off
- [ ] Clickable popups show: risk class name, FloodProb %, coordinates
- [ ] Title bar and info/description panel visible on page
- [ ] Web app screenshots included in report

---

## Report & Submission [CONFIRMED]

- [ ] All sections written (introduction, study area, data, methods, results, discussion, conclusion)
- [ ] All figures included (feature maps, confusion matrices, ROC curves, susceptibility map)
- [ ] Cartographic map layout meets Chapter 8 standard
- [ ] All code included in appendix
- [ ] Final file submitted by May 19, 2026
