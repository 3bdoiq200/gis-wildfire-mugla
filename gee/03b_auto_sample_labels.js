// ============================================================
// Script 03b — Auto-Sample Flood Labels from SAR Difference
// GIS-Flood-Karabuk | CME434 | Karabuk University
// Author: Auto-generated via Claude Code
// Date: 2026-05
// ============================================================
// PURPOSE:
//   Automatically sample 500 flooded and 500 non-flooded
//   ground-truth points based on SAR VV backscatter change.
//   Replaces manual digitizing in GEE.
//   Output: two CSVs exported to Google Drive folder GIS_Flood_Karabuk
// ============================================================

// --- 1. Load AOI (Karabuk province, FAO GAUL spelling) ---
var aoi = ee.FeatureCollection("FAO/GAUL/2015/level1")
  .filter(ee.Filter.eq("ADM1_NAME", "Karabuk"))
  .geometry();

Map.centerObject(aoi, 10);

// --- 2. Load Sentinel-1 SAR (IW, VV, Descending) ---
var s1 = ee.ImageCollection("COPERNICUS/S1_GRD")
  .filterBounds(aoi)
  .filter(ee.Filter.eq("instrumentMode", "IW"))
  .filter(ee.Filter.listContains("transmitterReceiverPolarisation", "VV"))
  .filter(ee.Filter.eq("orbitProperties_pass", "DESCENDING"))
  .select("VV");

// --- 3. Define Before / After date windows ---
// Adjust these dates to match the actual Karabuk flood event
var beforeStart = "2024-10-01";
var beforeEnd   = "2024-11-01";
var afterStart  = "2024-11-01";
var afterEnd    = "2024-12-01";

var before = s1.filterDate(beforeStart, beforeEnd).mean().clip(aoi);
var after  = s1.filterDate(afterStart,  afterEnd ).mean().clip(aoi);

// --- 4. Compute SAR difference ---
// Flooding = significant DROP in VV backscatter (water is dark)
var diff = after.subtract(before).rename("diff");

// --- 5. Define flood / no-flood masks ---
// Tune FLOOD_THRESHOLD if too many / too few points are sampled
var FLOOD_THRESHOLD   = -3;  // dB drop = likely flooded
var NOFLOOD_THRESHOLD =  1;  // dB gain or stable = not flooded

var floodMask   = diff.lt(FLOOD_THRESHOLD).selfMask();
var nofloodMask = diff.gt(NOFLOOD_THRESHOLD).selfMask();

// --- 6. Sample 500 flooded points ---
var floodedPoints = floodMask
  .sample({
    region: aoi,
    scale: 100,
    numPixels: 500,
    seed: 42,
    geometries: true
  })
  .map(function(f) { return f.set("label", 1); });

// --- 7. Sample 500 non-flooded points ---
var nonFloodedPoints = nofloodMask
  .sample({
    region: aoi,
    scale: 100,
    numPixels: 500,
    seed: 42,
    geometries: true
  })
  .map(function(f) { return f.set("label", 0); });

// --- 8. Print counts (check in GEE Console) ---
print("Flooded points count:",    floodedPoints.size());
print("Non-flooded points count:", nonFloodedPoints.size());
print("Total:",                    floodedPoints.merge(nonFloodedPoints).size());

// --- 9. Visualize layers ---
Map.addLayer(before, {min: -25, max: 0}, "SAR Before", false);
Map.addLayer(after,  {min: -25, max: 0}, "SAR After",  false);
Map.addLayer(diff,   {min: -10, max: 5, palette: ["blue","white","brown"]}, "SAR Diff");
Map.addLayer(floodMask,   {palette: ["red"]},   "Flood Mask");
Map.addLayer(nofloodMask, {palette: ["green"]}, "No-Flood Mask");
Map.addLayer(floodedPoints,    {color: "red"},   "Flooded Samples");
Map.addLayer(nonFloodedPoints, {color: "green"}, "Non-Flooded Samples");

// --- 10. Export flooded points to Drive ---
Export.table.toDrive({
  collection: floodedPoints,
  description: "Flooded_Points_500",
  folder: "GIS_Flood_Karabuk",
  fileNamePrefix: "flooded_points_500",
  fileFormat: "CSV"
});

// --- 11. Export non-flooded points to Drive ---
Export.table.toDrive({
  collection: nonFloodedPoints,
  description: "NonFlooded_Points_500",
  folder: "GIS_Flood_Karabuk",
  fileNamePrefix: "nonflooded_points_500",
  fileFormat: "CSV"
});

// ============================================================
// NEXT STEPS after running this script:
//   1. Check Console — confirm counts are close to 500 each
//   2. Click "Run" in Tasks tab for both exports
//   3. Wait for exports to finish in Google Drive
//   4. Then proceed to Colab notebook 01_preprocessing.ipynb
// ============================================================
