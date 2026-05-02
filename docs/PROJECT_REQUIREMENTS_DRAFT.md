# Project Requirements — DRAFT
# CME434 Final Project: Flood Susceptibility Mapping, Karabük

## Grading Structure (100 marks total)
Based on doctor's wildfire standard — adapted to flood.

| Section | Marks | Flood Equivalent |
|---------|-------|-----------------|
| Flood event selection | 20 | Show Sentinel-2 or SAR before/after flood with dates |
| Label preparation | 10 | 500 flooded + 500 non-flooded points → shapefiles |
| Features preparation | 15 | 15 flood susceptibility factors as raster layers |
| Training dataset | 10 | Extract features at points → Inputs.txt + Label.txt |
| Model development | 10 | 3 classifiers: RF + XGBoost + SVM |
| Susceptibility mapping | 10 | Best model → full AOI prediction → 5 risk classes |
| Web GIS app (DSS) | 30 | Leaflet app with interactive flood susceptibility map |

## Deliverables
1. Comprehensive written report (PDF or DOCX)
2. Functional web-based GIS application (index.html)

## Key Definitions
- Flooded point (Label = 1): flood-prone or historically flooded location
- Non-flooded point (Label = 0): elevated, clearly safe location
- Features (X): 15 environmental/terrain factors
- Target (Y): flood susceptibility label

## Confirmed from Doctor's Materials
- Must use Google Earth Engine for data collection [CONFIRMED]
- Must export data as shapefiles and/or GeoTIFF [CONFIRMED]
- Must train 3 different classifiers [CONFIRMED]
- Must compare models and retrain with different params [CONFIRMED]
- Web app: Leaflet, ArcGIS Online, or similar [CONFIRMED]
- Deadline: May 19, 2026 [CONFIRMED]

## Adapted from Wildfire Standard
- "burned points" → "flooded points" [ADAPTED]
- "unburned points" → "non-flooded points" [ADAPTED]
- Wildfire features → flood susceptibility factors [ADAPTED]
- RGB satellite imagery → SAR or optical flood imagery [ADAPTED]

## Still Needs Doctor Confirmation
- Is flood topic acceptable instead of wildfire? [ASK]
- Exact 15 features required [ASK]
- Web app hosting requirement [ASK]
- Report page/format requirements [ASK]

---

## Flood Event Candidates [ASSUMPTION]

The flood event is needed to produce before/after Sentinel imagery (20-mark section).
All three candidates below are in or very near Karabük Province.
Confirm the final choice by checking Sentinel-1 archive availability in GEE before committing.

### Candidate 1 — August 2021 Black Sea Floods (Recommended) [ASSUMPTION]
- **Date:** August 10–13, 2021
- **Area:** Western Black Sea region — Kastamonu, Bartın, Sinop, and Karabük surroundings
- **Scale:** Major catastrophic event; widespread inundation along river valleys
- **Evidence:** Widely reported by AFAD, Copernicus EMS (EMSR517), international media
- **Why useful:** Dense Sentinel-1 SAR coverage available; clear pre/post contrast;
  overlaps with Filyos River catchment draining through Karabük
- **GEE check:** Filter `COPERNICUS/S1_GRD` for VV, IW mode, dates 2021-08-05 to 2021-08-20

### Candidate 2 — July 2018 Karabük Flash Floods [ASSUMPTION]
- **Date:** Approximately July 2018
- **Area:** Karabük city centre and surrounding districts; flash flooding on Filyos tributaries
- **Scale:** Localised but well-documented event in Turkish news sources
- **Evidence:** AFAD incident reports; regional press (search: "Karabük sel 2018")
- **Why useful:** Directly within the province; shows urban flood exposure
- **GEE check:** Filter Sentinel-1 IW around July–August 2018; Sentinel-2 for optical imagery
- **Note:** Sentinel-1 archive from 2017 onwards; verify scene availability first

### Candidate 3 — Spring 2019 / 2020 Snowmelt Flooding [ASSUMPTION]
- **Date:** March–April 2019 or March–April 2020
- **Area:** Filyos River main channel and northern Karabük lowlands
- **Scale:** Seasonal snowmelt events causing riverine flooding; less dramatic than 2021
- **Evidence:** Routine spring high-water; AFAD seasonal bulletins
- **Why useful:** Reliable annual signal; good SAR backscatter contrast on flat floodplains
- **GEE check:** Filter Sentinel-1 IW for March–April of each year; compare water extent to JRC GSW

### Recommendation
Use **Candidate 1 (August 2021)** as primary choice. The event was large-scale, well-archived
in Copernicus EMS, and Sentinel-1 revisit is 6 days over Turkey so pre/post scenes will exist.
If the 2021 AOI clips are too far north of Karabük city, fall back to Candidate 2.

---

## Label Strategy [ADAPTED]

This section explains how 500 flooded (Label = 1) and 500 non-flooded (Label = 0)
sample points will be identified using Sentinel-1 SAR imagery.

### Why Sentinel-1 SAR for flood labeling? [ADAPTED]
- SAR penetrates clouds — critical because flood events are accompanied by heavy rainfall
  and persistent cloud cover that blocks optical (Sentinel-2) imagery
- Open water appears dark in SAR VV backscatter images (low return ≈ calm water surface)
- Method is widely used in peer-reviewed flood mapping literature

### Flooded Point Identification (Label = 1) [ADAPTED]
1. Load Sentinel-1 GRD images (IW mode, VV polarisation) for the flood date window
2. Apply a threshold: pixels with VV dB value below a threshold (typically −15 to −20 dB)
   are classified as flooded surface water
3. Mask permanent water bodies using JRC GSW (exclude pixels with occurrence > 80%)
   so that we label *newly flooded* areas, not permanent rivers/lakes
4. Randomly allocate 500 sample points within the flooded mask
5. Visually verify a subset of points in GEE before export

### Non-Flooded Point Identification (Label = 0) [ADAPTED]
1. Identify clearly safe zones: high-elevation areas (slope > 10°, elevation > 800m),
   and areas with near-zero JRC surface water occurrence (< 5%)
2. Exclude any area within 200m of a river channel
3. Randomly allocate 500 sample points within the safe zone mask
4. Visually verify a subset of points to avoid misclassification

### Output Files [CONFIRMED]
- `data/sample_points/Flooded_Points.shp` — 500 points, Label = 1
- `data/sample_points/NonFlooded_Points.shp` — 500 points, Label = 0
- `data/sample_points/samplepoints.shp` — merged, with Label column
