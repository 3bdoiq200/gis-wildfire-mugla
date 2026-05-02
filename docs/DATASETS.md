# Datasets Reference
# CME434 — GIS Flood Susceptibility Mapping, Karabük

All datasets are accessed through Google Earth Engine (GEE) unless stated otherwise.

Labels:
- [CONFIRMED]  — directly from doctor's materials
- [ADAPTED]    — translated from wildfire workflow to flood equivalent
- [ASSUMPTION] — reasonable guess; confirm with doctor before use

---

| # | Dataset | GEE Collection ID | Features Derived | Priority | Notes |
|---|---------|-------------------|-----------------|----------|-------|
| 1 | Admin Boundary (FAO GAUL) | `FAO/GAUL/2015/level2` | Study area AOI | **High** | Filter by `ADM1_NAME == 'Karabük'`; defines all export extents [CONFIRMED] |
| 2 | SRTM DEM 30m | `USGS/SRTMGL1_003` | Elevation, Slope, Aspect, TWI, Curvature, Hillshade | **High** | Six features derived from one source; resample to 100m [CONFIRMED] |
| 3 | Sentinel-1 SAR | `COPERNICUS/S1_GRD` | Flood label reference | **High** | Use VV polarization; backscatter threshold identifies flooded areas [ADAPTED] |
| 4 | Sentinel-2 SR | `COPERNICUS/S2_SR_HARMONIZED` | NDVI, before/after flood imagery | **High** | B8/B4 normalizedDifference for NDVI; also used in flood event documentation [CONFIRMED] |
| 5 | CHIRPS Daily Rainfall | `UCSB-CHG/CHIRPS/DAILY` | Rainfall (annual mean) | **High** | Aggregate to annual mean; critical flood driver [ADAPTED] |
| 6 | ESA WorldCover v2 | `ESA/WorldCover/v200` | Land Cover | **High** | 10m native resolution; resample to 100m [CONFIRMED] |
| 7 | JRC Global Surface Water | `JRC/GSW1_4/GlobalSurfaceWater` | Surface Water occurrence | Medium | Use `occurrence` band (% of time water is present) [ADAPTED] |
| 8 | HydroSHEDS Rivers | `WWF/HydroSHEDS/v1/FreeFlowingRivers` | Distance to Rivers, Drainage Density | **High** | Vector layer; rasterize then apply `fastDistanceTransform` [ADAPTED] |
| 9 | HydroSHEDS Flow Accumulation | `WWF/HydroSHEDS/30ACC` | Flow Accumulation (also TWI input) | **High** | 30 arc-sec; combined with slope for TWI = ln(flow_acc / tan(slope)) [ADAPTED] |
| 10 | OpenStreetMap Roads | External — Geofabrik Turkey extract | Distance to Roads | Medium | No GEE collection available; download OSM PBF and rasterize externally [ASSUMPTION] |
| 11 | WorldPop Population | `WorldPop/GP/100m/pop` | Population Density | Low | Proxy for settlement exposure; confirm dataset availability with doctor [ASSUMPTION] |

---

## Notes on Priority

- **High**: Required for core graded deliverables; must be exported before ML work begins.
- **Medium**: Needed for completeness of the 15 features; can be prepared in parallel.
- **Low**: Optional or uncertain; confirm approach with doctor before spending time.
