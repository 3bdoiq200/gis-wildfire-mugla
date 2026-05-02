// ============================================================
// Script 03b — Quality-Controlled Flood Label Sampling
// GIS-Flood-Karabuk | CME434 | Karabuk University
// Author: Auto-generated via Claude Code
// Date: 2026-05
// ============================================================
//
// SAMPLING PHILOSOPHY:
// This script prioritizes label trustworthiness over label count.
// Flood pixels are accepted only where SAR backscatter shows a
// coherent, spatially meaningful decrease consistent with inundation.
// Non-flood pixels are drawn from stable, low-change areas.
// Sample count is a result of signal quality — not a target to hit.
// A model trained on 80 honest points beats one trained on 500 fake
// flood labels. Do not loosen thresholds just to increase count.
//
// ============================================================

// --- 1. Load AOI ---
var aoi = ee.FeatureCollection("FAO/GAUL/2015/level1")
  .filter(ee.Filter.eq("ADM1_NAME", "Karabuk"))
  .geometry();

Map.centerObject(aoi, 10);

// --- 2. Load Sentinel-1 VV — both ASCENDING and DESCENDING orbits ---
var s1 = ee.ImageCollection("COPERNICUS/S1_GRD")
  .filterBounds(aoi)
  .filter(ee.Filter.eq("instrumentMode", "IW"))
  .filter(ee.Filter.listContains("transmitterReceiverPolarisation", "VV"))
  .select("VV");
// No orbit filter — using both passes for maximum coverage

// --- 3. Date windows — August 2021 Black Sea flood event ---
var beforeStart = "2021-07-01";
var beforeEnd   = "2021-08-10";
var afterStart  = "2021-08-11";
var afterEnd    = "2021-09-15";

var before = s1.filterDate(beforeStart, beforeEnd).mean().clip(aoi);
var after  = s1.filterDate(afterStart,  afterEnd ).mean().clip(aoi);

// --- 4. SAR difference (flooding = drop in VV backscatter) ---
var diff = after.subtract(before).rename("diff");

// --- 5. Debug stats — print BEFORE sampling ---
// These tell you whether thresholds are realistic
print("=== SAR Diff Statistics ===");
print("diff min/max/mean/stdDev:", diff.reduceRegion({
  reducer: ee.Reducer.minMax()
    .combine(ee.Reducer.mean(), null, true)
    .combine(ee.Reducer.stdDev(), null, true),
  geometry: aoi,
  scale: 100,
  maxPixels: 1e9
}));

// --- 6. Flood threshold: -1.5 dB (trust-first) ---
// Valid flood pixels appear near river valleys and low-elevation zones.
// If pixels appear on steep mountain slopes, the threshold is too loose.
var FLOOD_THRESHOLD   = -1.5;

// --- 7. Non-flood mask: STABLE pixels only (-0.3 to +0.3 dB) ---
// Stable pixels are the most trustworthy non-flood evidence.
// We do NOT use diff > 0.5 — that can capture noise or sensor artifacts.
var NOFLOOD_MIN = -0.3;
var NOFLOOD_MAX =  0.3;

var floodMask   = diff.lt(FLOOD_THRESHOLD).selfMask();
var nofloodMask = diff.gt(NOFLOOD_MIN).and(diff.lt(NOFLOOD_MAX)).selfMask();

// --- 8. Count available pixels before sampling ---
print("=== Available Pixels Before Sampling ===");
print("Flood pixels (diff < -1.5):", floodMask.reduceRegion({
  reducer: ee.Reducer.count(),
  geometry: aoi,
  scale: 100,
  maxPixels: 1e9
}));
print("Non-flood pixels (-0.3 < diff < 0.3):", nofloodMask.reduceRegion({
  reducer: ee.Reducer.count(),
  geometry: aoi,
  scale: 100,
  maxPixels: 1e9
}));

// --- 9. Sample up to 500 points per class (quality controls above) ---
var floodedPoints = floodMask
  .sample({
    region: aoi,
    scale: 100,
    numPixels: 500,
    seed: 42,
    geometries: true
  })
  .map(function(f) { return f.set("label", 1); });

var nonFloodedPoints = nofloodMask
  .sample({
    region: aoi,
    scale: 100,
    numPixels: 500,
    seed: 42,
    geometries: true
  })
  .map(function(f) { return f.set("label", 0); });

// --- 10. Print final sampled counts ---
print("=== Final Sampled Counts ===");
print("Flooded points:",     floodedPoints.size());
print("Non-flooded points:", nonFloodedPoints.size());
print("Total:",              floodedPoints.merge(nonFloodedPoints).size());

// --- 11. Visualization layers ---
Map.addLayer(before,           {min: -25, max: 0},                              "SAR Before",          false);
Map.addLayer(after,            {min: -25, max: 0},                              "SAR After",           false);
Map.addLayer(diff,             {min: -5,  max: 5, palette: ["blue","white","brown"]}, "SAR Diff",      true);
Map.addLayer(floodMask,        {palette: ["red"]},                              "Flood Mask",          true);
Map.addLayer(nofloodMask,      {palette: ["green"]},                            "Non-Flood Mask",      true);
Map.addLayer(floodedPoints,    {color: "red"},                                  "Flooded Samples",     true);
Map.addLayer(nonFloodedPoints, {color: "green"},                                "Non-Flooded Samples", true);

// --- 12. Export flooded points to Drive ---
Export.table.toDrive({
  collection: floodedPoints,
  description: "Flooded_Points_500",
  folder: "GIS_Flood_Karabuk",
  fileNamePrefix: "flooded_points",
  fileFormat: "CSV"
});

// --- 13. Export non-flooded points to Drive ---
Export.table.toDrive({
  collection: nonFloodedPoints,
  description: "NonFlooded_Points_500",
  folder: "GIS_Flood_Karabuk",
  fileNamePrefix: "nonflooded_points",
  fileFormat: "CSV"
});

// ============================================================
// AFTER RUNNING IN GEE:
// 1. Read Console debug stats — confirm pixel counts are realistic
// 2. Visually inspect Flood Mask — points should align with valleys
// 3. Only if mask looks realistic → go to Tasks tab and click RUN
// 4. Wait for CSVs in Google Drive → proceed to Colab notebook 01
// ============================================================
