# TODO — GIS Flood Project

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
