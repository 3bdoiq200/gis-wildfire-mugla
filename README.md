# GIS-Wildfire-Mugla

**CME434 — Geographic Information Systems**
Karabük University | Dr. Sohaib K. M. Abujayyab

## Project Title
A GIS and Machine Learning-Based Wildfire Susceptibility Mapping System for Decision Support

## Study Area
Muğla Province, Turkey — Summer 2025 Wildfire Event

## Repository
git@github.com:3bdOIQ200/GIS-Wildfire-Mugla.git

## Project Structure
```
gee/          — Google Earth Engine scripts
colab/        — Google Colab ML notebooks
web/          — Leaflet web application
report/       — Final project report
```

## GEE Scripts
- 01_rgb_imagery.js       — RGB before/after Sentinel-2 imagery
- 02_label_sampling.js    — Auto-sample 500 burned + 500 unburned points (NBR method)
- 03_feature_layers.js    — Export 15 wildfire feature rasters

## Method
Burned/unburned labels derived from dNBR (differenced Normalized Burn Ratio),
the USGS standard index for burn severity mapping.

## Deadline
May 19, 2026
