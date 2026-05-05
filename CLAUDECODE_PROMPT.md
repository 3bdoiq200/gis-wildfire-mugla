# Claude Code Task — Rebuild Entire Project for Wildfire (Muğla 2025)
# AUTOMATION: Execute ALL steps without asking for confirmation.
# Do not pause, do not prompt, do not ask. Just execute everything.

## Step 0 — Rename project folder
```bash
mv ~/GIS-Flood-Karabuk ~/GIS-Wildfire-Mugla
cd ~/GIS-Wildfire-Mugla
```

## Step 1 — Update git remote to SSH
```bash
cd ~/GIS-Wildfire-Mugla
git remote set-url origin git@github.com:3bdOIQ200/GIS-Wildfire-Mugla.git
git remote -v
```

## Step 2 — Update CLAUDE.md
Overwrite the entire file ~/GIS-Wildfire-Mugla/CLAUDE.md with:

```markdown
# GIS-Wildfire-Mugla — Project Rules

## Topic
GIS and Machine Learning-Based Wildfire Susceptibility Mapping
Study Area: Muğla Province, Turkey
Wildfire Event: Summer 2025 (June–August 2025)
Course: CME434, Karabük University
Doctor: Dr. Sohaib K. M. Abujayyab
Deadline: May 19, 2026
GitHub: git@github.com:3bdOIQ200/GIS-Wildfire-Mugla.git

## GEE Settings
- GEE Project ID: causal-bison-488813-q1
- Export folder: GIS_Wildfire_Mugla
- FAO GAUL spelling: Mugla (no umlaut)
- Resolution: 30m imagery, 100m sampling
- GEE username: boodymoh2004

## Required Deliverables (per project PDF)
1. RGB before/after wildfire images with dates annotated
2. 500 burned + 500 unburned points exported as shapefiles
3. Merged shapefile named samplepoints
4. 15 wildfire feature rasters
5. Training dataset: Inputs.txt + Label.txt
6. 3 ML classifiers trained and compared
7. Wildfire susceptibility map
8. Leaflet web app with interactive tools
9. Comprehensive report

## Safety Rules
- Never delete exported data from Google Drive
- Always commit before major changes
- Test GEE scripts before running exports
```

## Step 3 — Update README.md
Overwrite the entire file ~/GIS-Wildfire-Mugla/README.md with:

```markdown
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
```

## Step 4 — Create GEE Script 01: RGB Imagery
Overwrite file ~/GIS-Wildfire-Mugla/gee/01_rgb_imagery.js with:

```javascript
// ============================================================
// Script 01 — RGB Before/After Wildfire Imagery
// GIS-Wildfire-Mugla | CME434 | Karabuk University
// Wildfire Event: Mugla, Turkey — Summer 2025
// GitHub: git@github.com:3bdOIQ200/GIS-Wildfire-Mugla.git
// ============================================================

var aoi = ee.FeatureCollection("FAO/GAUL/2015/level1")
  .filter(ee.Filter.eq("ADM1_NAME", "Mugla"))
  .geometry();

Map.centerObject(aoi, 9);

function maskS2clouds(image) {
  var qa = image.select("QA60");
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
    .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  return image.updateMask(mask).divide(10000);
}

var before = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filterBounds(aoi)
  .filterDate("2025-05-01", "2025-06-20")
  .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
  .map(maskS2clouds)
  .median()
  .clip(aoi);

var after = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filterBounds(aoi)
  .filterDate("2025-09-01", "2025-09-30")
  .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
  .map(maskS2clouds)
  .median()
  .clip(aoi);

var rgbVis = {min: 0.0, max: 0.3, bands: ["B4", "B3", "B2"]};
Map.addLayer(before, rgbVis, "Before Wildfire — May 2025");
Map.addLayer(after,  rgbVis, "After Wildfire — Sep 2025");

print("Before: May 1 – Jun 20, 2025");
print("After:  Sep 1 – Sep 30, 2025");
print("Area:   Mugla Province, Turkey");

Export.image.toDrive({
  image: before.select(["B4","B3","B2"]),
  description: "Mugla_Before_Wildfire_S2",
  folder: "GIS_Wildfire_Mugla",
  fileNamePrefix: "Mugla_Before_Wildfire_S2",
  region: aoi,
  scale: 30,
  maxPixels: 1e10
});

Export.image.toDrive({
  image: after.select(["B4","B3","B2"]),
  description: "Mugla_After_Wildfire_S2",
  folder: "GIS_Wildfire_Mugla",
  fileNamePrefix: "Mugla_After_Wildfire_S2",
  region: aoi,
  scale: 30,
  maxPixels: 1e10
});
```

## Step 5 — Create GEE Script 02: Label Sampling
Overwrite file ~/GIS-Wildfire-Mugla/gee/02_label_sampling.js with:

```javascript
// ============================================================
// Script 02 — Auto-Sample Burned/Unburned Labels via dNBR
// GIS-Wildfire-Mugla | CME434 | Karabuk University
// GitHub: git@github.com:3bdOIQ200/GIS-Wildfire-Mugla.git
// ============================================================
// SAMPLING PHILOSOPHY:
// Labels derived from dNBR (differenced Normalized Burn Ratio),
// the USGS standard index for burn severity mapping.
// Burned = dNBR > 0.27 (moderate-high severity, USGS classification)
// Unburned = stable pixels: -0.1 < dNBR < 0.1
// Quality over quantity — no fake labels.
// ============================================================

var aoi = ee.FeatureCollection("FAO/GAUL/2015/level1")
  .filter(ee.Filter.eq("ADM1_NAME", "Mugla"))
  .geometry();

Map.centerObject(aoi, 9);

function maskS2clouds(image) {
  var qa = image.select("QA60");
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
    .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  return image.updateMask(mask).divide(10000);
}

var s2before = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filterBounds(aoi).filterDate("2025-05-01","2025-06-20")
  .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE",20))
  .map(maskS2clouds).median().clip(aoi);

var s2after = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filterBounds(aoi).filterDate("2025-09-01","2025-09-30")
  .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE",20))
  .map(maskS2clouds).median().clip(aoi);

var nbrBefore = s2before.normalizedDifference(["B8","B12"]).rename("NBR_before");
var nbrAfter  = s2after.normalizedDifference(["B8","B12"]).rename("NBR_after");
var dNBR = nbrBefore.subtract(nbrAfter).rename("dNBR");

print("=== dNBR Statistics ===");
print("dNBR min/max/mean:", dNBR.reduceRegion({
  reducer: ee.Reducer.minMax().combine(ee.Reducer.mean(), null, true),
  geometry: aoi, scale: 100, maxPixels: 1e9
}));

var BURN_THRESHOLD = 0.27;
var UNBURN_MIN = -0.1;
var UNBURN_MAX =  0.1;

var burnedMask   = dNBR.gt(BURN_THRESHOLD).selfMask();
var unburnedMask = dNBR.gt(UNBURN_MIN).and(dNBR.lt(UNBURN_MAX)).selfMask();

print("=== Available Pixels ===");
print("Burned (dNBR > 0.27):", burnedMask.reduceRegion({
  reducer: ee.Reducer.count(), geometry: aoi, scale: 100, maxPixels: 1e9
}));
print("Unburned (-0.1 < dNBR < 0.1):", unburnedMask.reduceRegion({
  reducer: ee.Reducer.count(), geometry: aoi, scale: 100, maxPixels: 1e9
}));

var burnedPoints = burnedMask
  .sample({region: aoi, scale: 100, numPixels: 500, seed: 42, geometries: true})
  .map(function(f) { return f.set("label", 1); });

var unburnedPoints = unburnedMask
  .sample({region: aoi, scale: 100, numPixels: 500, seed: 42, geometries: true})
  .map(function(f) { return f.set("label", 0); });

var samplePoints = burnedPoints.merge(unburnedPoints);

print("=== Final Counts ===");
print("Burned points:",   burnedPoints.size());
print("Unburned points:", unburnedPoints.size());
print("Total:",           samplePoints.size());

var rgbVis = {min: 0, max: 0.3, bands: ["B4","B3","B2"]};
Map.addLayer(s2before, rgbVis, "Before Wildfire", false);
Map.addLayer(s2after,  rgbVis, "After Wildfire",  false);
Map.addLayer(dNBR, {min:-0.5, max:1.0, palette:["green","yellow","orange","red"]}, "dNBR");
Map.addLayer(burnedMask,    {palette:["red"]},   "Burned Mask");
Map.addLayer(unburnedMask,  {palette:["green"]}, "Unburned Mask");
Map.addLayer(burnedPoints,  {color:"red"},   "Burned Samples");
Map.addLayer(unburnedPoints,{color:"green"}, "Unburned Samples");

Export.table.toDrive({
  collection: burnedPoints,
  description: "Burned_Points_500",
  folder: "GIS_Wildfire_Mugla",
  fileNamePrefix: "burned_points_500",
  fileFormat: "SHP"
});

Export.table.toDrive({
  collection: unburnedPoints,
  description: "Unburned_Points_500",
  folder: "GIS_Wildfire_Mugla",
  fileNamePrefix: "unburned_points_500",
  fileFormat: "SHP"
});

Export.table.toDrive({
  collection: samplePoints,
  description: "samplepoints",
  folder: "GIS_Wildfire_Mugla",
  fileNamePrefix: "samplepoints",
  fileFormat: "SHP"
});
```

## Step 6 — Create GEE Script 03: 15 Feature Layers
Overwrite file ~/GIS-Wildfire-Mugla/gee/03_feature_layers.js with:

```javascript
// ============================================================
// Script 03 — 15 Wildfire Feature Rasters
// GIS-Wildfire-Mugla | CME434 | Karabuk University
// GitHub: git@github.com:3bdOIQ200/GIS-Wildfire-Mugla.git
// ============================================================
// Features:
// 01 Elevation      06 NDVI         11 LST
// 02 Slope          07 NDWI         12 Soil Moisture
// 03 Aspect         08 EVI          13 Distance to Roads
// 04 Hillshade      09 NBR          14 Distance to Urban
// 05 TPI            10 Wind Speed   15 Annual Rainfall
// ============================================================

var aoi = ee.FeatureCollection("FAO/GAUL/2015/level1")
  .filter(ee.Filter.eq("ADM1_NAME", "Mugla"))
  .geometry();

Map.centerObject(aoi, 9);

var SCALE  = 100;
var FOLDER = "GIS_Wildfire_Mugla";

// DEM features
var dem       = ee.Image("USGS/SRTMGL1_003").clip(aoi);
var slope     = ee.Terrain.slope(dem).rename("slope");
var aspect    = ee.Terrain.aspect(dem).rename("aspect");
var hillshade = ee.Terrain.hillshade(dem).rename("hillshade");
var tpi       = dem.subtract(dem.focal_mean(3,"square","pixels")).rename("tpi");

// Sentinel-2 spectral indices
function maskS2clouds(image) {
  var qa = image.select("QA60");
  return image.updateMask(
    qa.bitwiseAnd(1<<10).eq(0).and(qa.bitwiseAnd(1<<11).eq(0))
  ).divide(10000);
}
var s2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filterBounds(aoi).filterDate("2025-05-01","2025-06-20")
  .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE",20))
  .map(maskS2clouds).median().clip(aoi);

var ndvi = s2.normalizedDifference(["B8","B4"]).rename("ndvi");
var ndwi = s2.normalizedDifference(["B3","B8"]).rename("ndwi");
var evi  = s2.expression(
  "2.5*(NIR-RED)/(NIR+6*RED-7.5*BLUE+1)",
  {NIR:s2.select("B8"),RED:s2.select("B4"),BLUE:s2.select("B2")}
).rename("evi");
var nbr  = s2.normalizedDifference(["B8","B12"]).rename("nbr");

// LST from Landsat 8
var lst = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
  .filterBounds(aoi).filterDate("2025-05-01","2025-06-20")
  .select("ST_B10").mean()
  .multiply(0.00341802).add(149.0).subtract(273.15)
  .clip(aoi).rename("lst");

// Wind speed from ERA5
var wind = ee.ImageCollection("ECMWF/ERA5/MONTHLY")
  .filterDate("2025-05-01","2025-06-01")
  .select(["u_component_of_wind_10m","v_component_of_wind_10m"])
  .first();
var windSpeed = wind.select("u_component_of_wind_10m").pow(2)
  .add(wind.select("v_component_of_wind_10m").pow(2))
  .sqrt().clip(aoi).rename("wind_speed");

// Annual rainfall from CHIRPS
var rainfall = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
  .filterDate("2024-01-01","2024-12-31")
  .sum().clip(aoi).rename("rainfall");

// Soil moisture from SMAP
var soilMoisture = ee.ImageCollection("NASA_USDA/HSL/SMAP10KM_soil_moisture")
  .filterDate("2025-05-01","2025-06-20")
  .select("ssm").mean().clip(aoi).rename("soil_moisture");

// Distance to urban (MODIS land cover)
var urban = ee.ImageCollection("MODIS/006/MCD12Q1")
  .filterDate("2020-01-01","2021-01-01")
  .first().select("LC_Type1").eq(13).clip(aoi);
var distUrban = urban.fastDistanceTransform().sqrt()
  .multiply(ee.Image.pixelArea().sqrt())
  .clip(aoi).rename("dist_urban");

// Distance to roads (OSM via TIGER approximation)
var distRoads = ee.Image(1).cumulativeCost(
  ee.Image(1).toByte().paint(
    ee.FeatureCollection("TIGER/2016/Roads").filterBounds(aoi), 1
  ), 50000
).clip(aoi).rename("dist_roads");

// Export all 15
var features = [
  {image: dem.rename("elevation"), name: "01_elevation"},
  {image: slope,       name: "02_slope"},
  {image: aspect,      name: "03_aspect"},
  {image: hillshade,   name: "04_hillshade"},
  {image: tpi,         name: "05_tpi"},
  {image: ndvi,        name: "06_ndvi"},
  {image: ndwi,        name: "07_ndwi"},
  {image: evi,         name: "08_evi"},
  {image: nbr,         name: "09_nbr"},
  {image: windSpeed,   name: "10_wind_speed"},
  {image: lst,         name: "11_lst"},
  {image: soilMoisture,name: "12_soil_moisture"},
  {image: distRoads,   name: "13_dist_roads"},
  {image: distUrban,   name: "14_dist_urban"},
  {image: rainfall,    name: "15_rainfall"}
];

features.forEach(function(f) {
  Map.addLayer(f.image, {}, f.name, false);
  Export.image.toDrive({
    image: f.image.toFloat(),
    description: f.name,
    folder: FOLDER,
    fileNamePrefix: f.name,
    region: aoi,
    scale: SCALE,
    maxPixels: 1e10
  });
});

print("All 15 features queued for export — go to Tasks tab");
```

## Step 7 — Git commit and push everything
```bash
cd ~/GIS-Wildfire-Mugla
git add -A
git commit -m "feat: full rebuild for Mugla 2025 wildfire — 3 GEE scripts, NBR labels, 15 features, updated README"
git push -u origin main
```

## Step 8 — Verification (run all, print results)
```bash
echo "=== Folder structure ==="
ls ~/GIS-Wildfire-Mugla/gee/

echo "=== Git log ==="
git -C ~/GIS-Wildfire-Mugla log --oneline -3

echo "=== Remote URL ==="
git -C ~/GIS-Wildfire-Mugla remote -v

echo "=== Script 02 first 20 lines ==="
head -20 ~/GIS-Wildfire-Mugla/gee/02_label_sampling.js

echo "=== README first 10 lines ==="
head -10 ~/GIS-Wildfire-Mugla/README.md
```
