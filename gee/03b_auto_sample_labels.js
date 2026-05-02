// ============================================================
// Script 03b — Auto-Sample Flood Labels from SAR Difference
// GIS-Flood-Karabuk | CME434 | Karabuk University
// Author: Auto-generated via Claude Code
// Date: 2026-05
// FIXED: Combined ASCENDING + DESCENDING orbits, looser thresholds
// ============================================================

// --- 1. Load AOI ---
var aoi = ee.FeatureCollection("FAO/GAUL/2015/level1")
  .filter(ee.Filter.eq("ADM1_NAME", "Karabuk"))
  .geometry();

Map.centerObject(aoi, 10);

// --- 2. Load Sentinel-1 SAR — BOTH orbits for better coverage ---
var s1 = ee.ImageCollection("COPERNICUS/S1_GRD")
  .filterBounds(aoi)
  .filter(ee.Filter.eq("instrumentMode", "IW"))
  .filter(ee.Filter.listContains("transmitterReceiverPolarisation", "VV"))
  .select("VV");

// --- 3. Date windows — August 2021 Black Sea flood event ---
var beforeStart = "2021-07-01";
var beforeEnd   = "2021-08-10";
var afterStart  = "2021-08-11";
var afterEnd    = "2021-09-15";

var before = s1.filterDate(beforeStart, beforeEnd).mean().clip(aoi);
var after  = s1.filterDate(afterStart,  afterEnd).mean().clip(aoi);

// --- 4. SAR difference ---
var diff = after.subtract(before).rename("diff");

// --- 5. Very loose thresholds to capture enough pixels ---
var FLOOD_THRESHOLD   = -1.0;
var NOFLOOD_THRESHOLD =  0.3;

var floodMask   = diff.lt(FLOOD_THRESHOLD).selfMask();
var nofloodMask = diff.gt(NOFLOOD_THRESHOLD).selfMask();

// --- 6. Debug: print pixel counts before sampling ---
var floodPixelCount = floodMask.reduceRegion({
  reducer: ee.Reducer.count(),
  geometry: aoi,
  scale: 100,
  maxPixels: 1e9
});
var nofloodPixelCount = nofloodMask.reduceRegion({
  reducer: ee.Reducer.count(),
  geometry: aoi,
  scale: 100,
  maxPixels: 1e9
});
print("Available flood pixels:", floodPixelCount);
print("Available no-flood pixels:", nofloodPixelCount);
print("SAR diff stats:", diff.reduceRegion({
  reducer: ee.Reducer.minMax().combine(ee.Reducer.mean(), null, true),
  geometry: aoi,
  scale: 100,
  maxPixels: 1e9
}));

// --- 7. Sample up to 500 flooded points ---
var floodedPoints = floodMask
  .sample({
    region: aoi,
    scale: 100,
    numPixels: 500,
    seed: 42,
    geometries: true
  })
  .map(function(f) { return f.set("label", 1); });

// --- 8. Sample up to 500 non-flooded points ---
var nonFloodedPoints = nofloodMask
  .sample({
    region: aoi,
    scale: 100,
    numPixels: 500,
    seed: 42,
    geometries: true
  })
  .map(function(f) { return f.set("label", 0); });

// --- 9. Print counts ---
print("Flooded points count:",     floodedPoints.size());
print("Non-flooded points count:", nonFloodedPoints.size());
print("Total:",                    floodedPoints.merge(nonFloodedPoints).size());

// --- 10. Visualize ---
Map.addLayer(before, {min: -25, max: 0}, "SAR Before", false);
Map.addLayer(after,  {min: -25, max: 0}, "SAR After",  false);
Map.addLayer(diff,   {min: -5, max: 5, palette: ["blue","white","brown"]}, "SAR Diff");
Map.addLayer(floodMask,        {palette: ["red"]},   "Flood Mask");
Map.addLayer(nofloodMask,      {palette: ["green"]}, "No-Flood Mask");
Map.addLayer(floodedPoints,    {color: "red"},        "Flooded Samples");
Map.addLayer(nonFloodedPoints, {color: "green"},      "Non-Flooded Samples");

// --- 11. Export flooded points ---
Export.table.toDrive({
  collection: floodedPoints,
  description: "Flooded_Points_500",
  folder: "GIS_Flood_Karabuk",
  fileNamePrefix: "flooded_points_500",
  fileFormat: "CSV"
});

// --- 12. Export non-flooded points ---
Export.table.toDrive({
  collection: nonFloodedPoints,
  description: "NonFlooded_Points_500",
  folder: "GIS_Flood_Karabuk",
  fileNamePrefix: "nonflooded_points_500",
  fileFormat: "CSV"
});
