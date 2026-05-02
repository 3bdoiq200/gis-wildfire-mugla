# TODO — GIS Flood Project

---

## Day-by-Day Plan (May 2 → May 19, 2026) [ASSUMPTION]

| Date | Focus | Key Output |
|------|-------|-----------|
| May 2–3 | Planning & confirmation | Doctor approval; GEE project created; flood event chosen |
| May 3–4 | GEE setup & boundary | Karabük AOI exported; Sentinel-1 pre/post scenes identified |
| May 4–5 | Flood event documentation | Before/after imagery panels; flood extent screenshot saved |
| May 5–6 | Label preparation | 500 flooded + 500 non-flooded points exported; shapefiles in `data/sample_points/` |
| May 6–7 | Feature preparation (part 1) | Features 1–8 exported from GEE to `data/raw/` |
| May 7–8 | Feature preparation (part 2) | Features 9–15 exported; all 15 rasters verified at 100m |
| May 8–9 | Training dataset | CSV sampled in GEE; cleaned in Python; Inputs.txt + Label.txt saved |
| May 9–11 | ML model training | RF, XGBoost, SVM trained (2 param sets each); metrics computed |
| May 11–12 | Model comparison | ROC curves plotted; best model selected and saved as .pkl |
| May 12–13 | Susceptibility mapping | Full AOI predicted; GeoTIFF classified into 5 risk classes |
| May 13–15 | Web GIS app | Leaflet index.html built; layers, popups, legend working |
| May 15–17 | Report writing | All sections drafted; figures embedded |
| May 17–18 | Cartographic layout | Final map with north arrow, scale bar, legend, neatline |
| May 18–19 | Final review & submission | Grading checklist verified; all files submitted |

---

## Phase 1: Environment & Planning (Now → May 5)
- [ ] Ask doctor: is flood susceptibility topic acceptable?
- [ ] Confirm study area: Karabük Province boundary
- [ ] Identify flood event (search: Karabük sel 2021, AFAD records)
- [ ] Confirm which 15 flood features to use
- [ ] Set up Google Earth Engine project
- [ ] Set up Python virtual environment

## Phase 2: Data Collection (May 3–6)
- [ ] Export Karabük admin boundary from GEE
- [ ] Export DEM (SRTM 30m)
- [ ] Export Sentinel-2 before/after flood imagery
- [ ] Export all 15 feature rasters from GEE
- [ ] Export Sentinel-1 SAR for flood label reference

## Phase 3: Label Preparation (May 5–7)
- [ ] Allocate 500 flooded sample points in GEE
- [ ] Allocate 500 non-flooded sample points in GEE
- [ ] Export Flooded_Points.shp
- [ ] Export NonFlooded_Points.shp
- [ ] Merge into samplepoints.shp

## Phase 4: Training Dataset (May 6–8)
- [ ] Stack all 15 feature rasters
- [ ] Sample features at 1000 label points
- [ ] Export as CSV from GEE
- [ ] Clean CSV in Python
- [ ] Save Inputs.txt and Label.txt

## Phase 5: Machine Learning (May 8–11)
- [ ] Train Random Forest (2 parameter sets)
- [ ] Train XGBoost (2 parameter sets)
- [ ] Train SVM (2 parameter sets)
- [ ] Evaluate all models
- [ ] Compare models and select best

## Phase 6: Susceptibility Mapping (May 11–13)
- [ ] Apply best model to full Karabük grid
- [ ] Generate flood probability raster
- [ ] Classify into 5 risk classes
- [ ] Export GeoTIFF

## Phase 7: Web GIS App (May 12–16)
- [ ] Build Leaflet index.html
- [ ] Add susceptibility layer
- [ ] Add risk legend
- [ ] Add layer toggles
- [ ] Add clickable popups

## Phase 8: Report (May 14–18)
- [ ] Write all report sections
- [ ] Create cartographic map layout
- [ ] Compile figures
- [ ] Final review against grading checklist
- [ ] Submit

## Questions for Doctor
- [ ] Is flood susceptibility topic acceptable instead of wildfire?
- [ ] Does the web app need to be hosted online?
- [ ] Which 15 features specifically?
- [ ] What counts as the flood incident reference?
