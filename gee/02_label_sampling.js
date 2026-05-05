// ============================================================
// Script 02 — Auto-Sample Burned/Unburned Labels via dNBR
// GIS-Wildfire-Mugla | CME434 | Karabuk University
// GitHub: git@github.com:3bdOIQ200/GIS-Wildfire-Mugla.git
// ============================================================
// SAMPLING PHILOSOPHY:
// Labels derived from dNBR (differenced Normalized Burn Ratio),
// the USGS standard index for burn severity mapping.
// Burned = dNBR > 0.15 (low-moderate severity threshold for Mugla 2025)
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
  .filterBounds(aoi).filterDate("2025-07-01","2025-09-30")
  .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE",30))
  .map(maskS2clouds)
  .sort("CLOUDY_PIXEL_PERCENTAGE")
  .median()
  .clip(aoi);

var nbrBefore = s2before.normalizedDifference(["B8","B12"]).rename("NBR_before");
var nbrAfter  = s2after.normalizedDifference(["B8","B12"]).rename("NBR_after");
var dNBR = nbrBefore.subtract(nbrAfter).rename("dNBR");

print("=== dNBR Statistics ===");
print("dNBR min/max/mean:", dNBR.reduceRegion({
  reducer: ee.Reducer.minMax().combine(ee.Reducer.mean(), null, true),
  geometry: aoi, scale: 100, maxPixels: 1e9
}));

var BURN_THRESHOLD = 0.10;
var UNBURN_MIN = -0.1;
var UNBURN_MAX =  0.1;

var burnedMask   = dNBR.gt(BURN_THRESHOLD).selfMask();
var unburnedMask = dNBR.gt(UNBURN_MIN).and(dNBR.lt(UNBURN_MAX)).selfMask();

print("=== Available Pixels ===");
print("Burned (dNBR > 0.15):", burnedMask.reduceRegion({
  reducer: ee.Reducer.count(), geometry: aoi, scale: 100, maxPixels: 1e9
}));
print("Unburned (-0.1 < dNBR < 0.1):", unburnedMask.reduceRegion({
  reducer: ee.Reducer.count(), geometry: aoi, scale: 100, maxPixels: 1e9
}));

var burnedPoints = burnedMask
  .sample({region: aoi, scale: 20, numPixels: 500, seed: 42, geometries: true})
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
