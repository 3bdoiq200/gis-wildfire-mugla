# CME434 Final Report — Outline
# Flood Susceptibility Mapping and Decision Support System for Karabük Province, Turkey
# Karabük University | May 2026
# Target length: 25–35 pages

Labels: [CONFIRMED] = from doctor's materials | [ADAPTED] | [ASSUMPTION]

---

## Cover Page (not counted in page total)
- Title
- Student name and ID
- Course: CME434
- Supervisor name
- Submission date: May 19, 2026
- University logo

---

## Abstract (~0.5 page) [CONFIRMED]
- 1–2 sentences on study area and problem
- 1–2 sentences on method (GEE + ML + Leaflet)
- 1 sentence on best model and key result
- 1 sentence on web app deliverable
- Keywords: flood susceptibility, machine learning, GEE, Leaflet, Karabük

---

## 1. Introduction (~1.5 pages) [ADAPTED]
- Global context: flood hazard as leading natural disaster
- Turkey context: Black Sea region floods, 2021 event reference
- Karabük Province: Filyos River basin, previous flood incidents
- Gap: lack of province-scale flood susceptibility map
- Objectives: (1) generate susceptibility map, (2) compare ML classifiers, (3) build DSS
- Paper structure paragraph

---

## 2. Study Area (~1 page) [CONFIRMED]
- Administrative location: Karabük Province, 41.2°N 32.6°E
- Extent and area (~3,500 km²)
- Topography: Köroğlu Mountains in the west, Filyos and Araç river valleys
- Climate: humid Black Sea influence, mean annual rainfall ~700 mm
- Land use: forested mountains, agricultural river valleys, Karabük city (steel industry)
- Figure: study area locator map with province boundary and major rivers
  → Place Figure 1 here (map exported from QGIS or GEE)

---

## 3. Flood Event Reference (~1.5 pages) [CONFIRMED — 20 marks]
- Describe selected flood event (August 2021 recommended)
- Event date, affected areas, reported casualties and damage (cite AFAD)
- Before/after comparison images:
  → Figure 2: Sentinel-2 RGB before flood (May–June 2021)
  → Figure 3: Sentinel-2 RGB after flood (August 2021)
  → Figure 4: Sentinel-1 SAR before vs. after (VV band comparison)
- Flood extent delineation using SAR backscatter threshold
- Justification for using this event for label preparation

---

## 4. Data and Datasets (~1.5 pages) [CONFIRMED]
- Overview of Google Earth Engine as data platform
- Table: all 11 datasets (name, GEE ID, feature derived, resolution)
  → Reference docs/DATASETS.md for table content
- Note on Distance to Roads (OSM) and Population Density (WorldPop) limitations
- Data access period: archived satellite data, no field collection needed

---

## 5. Methodology (~3 pages) [CONFIRMED]

### 5.1 Label Preparation [ADAPTED]
- SAR-based flood labeling approach
- VV backscatter threshold (< –18 dB) for flooded mask
- JRC GSW mask to exclude permanent water bodies
- 500 flooded points (Label = 1) + 500 non-flooded points (Label = 0)
- Spatial distribution strategy
→ Figure 5: map showing 1000 sample points on top of SAR flood mask

### 5.2 Feature Preparation [CONFIRMED]
- List all 15 features with formula where applicable
  (e.g., TWI = ln(FlowAcc / tan(slope)))
- GEE processing chain for each feature
- Output: 15 rasters at 100 m resolution, EPSG:4326 → reprojected to EPSG:32636
→ Figure 6–8: 3 × 5 grid of all 15 feature maps

### 5.3 Training Dataset Extraction [CONFIRMED]
- Stacking 15 bands in GEE
- Sampling at 1000 labeled points using sampleRegions
- Export CSV, cleaning in Python (drop .geo, system:index)
- Final: Inputs.txt (1000 × 15), Label.txt (1000 × 1)

### 5.4 Machine Learning Workflow [CONFIRMED]
- Train/test split: 70% / 30%, stratified, random_state=42
- StandardScaler for SVM only
- Two parameter sets per classifier
- Evaluation: Accuracy, Precision, Recall, F1, AUC-ROC, confusion matrix

---

## 6. Classifiers (~2 pages) [CONFIRMED]

### 6.1 Random Forest
- Algorithm description (ensemble of decision trees, Gini impurity)
- Why chosen: robust, no scaling, handles multicollinearity, gives feature importance
- Parameter sets (Run 1: n_estimators=100, default; Run 2: n_estimators=200, max_depth=15)

### 6.2 XGBoost
- Algorithm description (gradient boosted trees, regularization)
- Why chosen: state-of-the-art accuracy, handles class imbalance
- Parameter sets (Run 1: default lr=0.1; Run 2: tuned lr=0.05, deeper trees)

### 6.3 SVM
- Algorithm description (maximum-margin hyperplane in feature space)
- Why chosen: strong theoretical foundation, well-calibrated probabilities
- Preprocessing: StandardScaler required (sensitive to feature scale)
- Parameter sets (Run 1: C=1, gamma='scale'; Run 2: C=10, gamma=0.01)

---

## 7. Results (~3 pages) [CONFIRMED]

### 7.1 Model Performance Table
→ Table 1: comparison of all 6 runs (Accuracy, Precision, Recall, F1, AUC)
→ Figure 9: confusion_matrices.png (2 × 3 grid)
→ Figure 10: roc_curves.png (all 6 ROC curves)

### 7.2 Best Model Selection
- State selected model name and parameter set
- Justification: highest AUC-ROC + balanced F1
- Brief comparison with runner-up

### 7.3 Feature Importance
→ Figure 11: feature_importance.png (horizontal bar chart)
- Discuss top 5 most important features
- Relate to flood physics (e.g., if D_Rivers or TWI rank high — explains why)

---

## 8. Flood Susceptibility Map (~1.5 pages) [CONFIRMED — 10 marks]
- How predictions were generated for full Karabük AOI (~40,000 pixels)
- Five risk class thresholds and color scheme
- Coverage statistics (% area per class)
→ Figure 12: flood_susceptibility_map.png (main cartographic output)
  - Must include: north arrow, scale bar, legend, neatline, locator inset map
- Discussion: which areas are most susceptible? (river valleys, low elevations)
- Cross-check with known 2021 flood extent

---

## 9. Web GIS Decision Support System (~2 pages) [CONFIRMED — 30 marks]

### 9.1 System Design
- Platform choice: Leaflet.js 1.9.4, single HTML file, no server required
- Target users: civil protection, municipal planners, public
- Data flow: GEE → Python → GeoJSON → Leaflet

### 9.2 Application Features
- Interactive map (OSM basemap, Karabük center, zoom 10)
- Flood susceptibility layer with 5-class color scheme
- Clickable popups: risk class, flood probability %, coordinates
- Layer control (toggle susceptibility, rivers, boundary)
- Risk legend with 5 color swatches
- Info panel (study area description for non-specialist users)
- Rainfall scenario slider (display control, future scenario ready)
→ Figure 13: screenshot of web app overview
→ Figure 14: screenshot of popup on a High-risk point
→ Figure 15: screenshot of layer control open

### 9.3 How to Access
- Open web/index.html in any modern browser (Chrome, Firefox, Edge)
- No internet connection required after initial basemap tile caching
- GeoJSON data bundled in web/data/ subfolder

---

## 10. Discussion (~1.5 pages) [ASSUMPTION]
- Comparison of results with regional flood risk literature
- Limitations:
  - Distance to Roads uses zero-value placeholder (OSM not in GEE)
  - SAR-based labels may miss cloud-obscured flood pixels
  - 100 m resolution may miss narrow valley flooding
  - Web app slider is display-only, no live prediction
- Future improvements:
  - Integrate real-time AFAD alerts
  - Add multi-temporal analysis (flood recurrence)
  - Host on GitHub Pages for public access

---

## 11. Conclusion (~0.5 page) [ASSUMPTION]
- Summary of workflow and results
- Best model achieved AUC = [fill from results] on Karabük flood data
- Web DSS provides a practical tool for municipal emergency planning
- Methodology is transferable to other provinces

---

## References (~0.5 page) [CONFIRMED]
Cite at minimum:
- Gorelick et al. 2017 — Google Earth Engine
- Breiman 2001 — Random Forests
- Chen & Guestrin 2016 — XGBoost
- Vapnik 1995 — SVM
- Copernicus EMS for the 2021 flood event
- AFAD (Disaster and Emergency Management Authority, Turkey)
- Sentinel-1 and Sentinel-2 mission papers (ESA)

---

## Appendix A — GEE Scripts (~3–4 pages) [CONFIRMED]
- Full code listing for gee/01 through gee/05
- One section per script with brief description

## Appendix B — Python Code (~4–5 pages) [CONFIRMED]
- Key code blocks from colab/01, colab/02, colab/03
- Not necessary to include all boilerplate — focus on core ML sections

## Appendix C — Web App Code (~2 pages) [CONFIRMED]
- Full listing of web/index.html (or key JS sections)

---

## Figure List (for reference while writing)

| # | File | Section | Description |
|---|------|---------|-------------|
| 1 | — | 2 | Study area locator map |
| 2 | Karabuk_Before_Flood_S2.tif | 3 | Sentinel-2 RGB before flood |
| 3 | Karabuk_After_Flood_S2.tif | 3 | Sentinel-2 RGB after flood |
| 4 | Karabuk_SAR_Before/After | 3 | SAR VV before vs. after |
| 5 | — | 5.1 | Sample points on SAR flood mask |
| 6-8 | Feature_*.tif | 5.2 | 15 feature maps (3-panel figure) |
| 9 | confusion_matrices.png | 7.1 | All 6 confusion matrices |
| 10 | roc_curves.png | 7.1 | ROC curves for all models |
| 11 | feature_importance.png | 7.3 | RF feature importance |
| 12 | flood_susceptibility_map.png | 8 | Main susceptibility map |
| 13-15 | web app screenshots | 9.2 | Web DSS screenshots |
