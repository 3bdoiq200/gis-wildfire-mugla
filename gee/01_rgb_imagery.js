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
