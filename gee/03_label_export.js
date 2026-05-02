// QUOTA LEVEL: MEDIUM
// PURPOSE: SAR flood mask display and guide for manual digitizing of sample points
// EXPORTS: Flooded_Points, NonFlooded_Points, samplepoints_merged
//          (export block is commented out — uncomment after digitizing)
// GEE PROJECT: causal-bison-488813-q1

var aoi = ee.FeatureCollection('FAO/GAUL/2015/level1')
  .filter(ee.Filter.eq('ADM1_NAME', 'Karabuk'))
  .geometry();

Map.centerObject(aoi, 10);

var s1After = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterDate('2021-08-01', '2021-08-31')
  .filterBounds(aoi)
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .select('VV')
  .mean()
  .clip(aoi);

var s2After = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterDate('2021-08-01', '2021-08-31')
  .filterBounds(aoi)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
  .map(function(img) {
    var qa = img.select('QA60');
    var mask = qa.bitwiseAnd(1 << 10).eq(0)
      .and(qa.bitwiseAnd(1 << 11).eq(0));
    return img.updateMask(mask).divide(10000).clip(aoi);
  })
  .mean();

var floodMask = s1After.lt(-18);

Map.addLayer(s2After, {min:0, max:0.3, bands:['B4','B3','B2']},
  'S2 After Flood reference');
Map.addLayer(s1After, {min:-25, max:0, palette:['black','white']},
  'SAR VV After Flood');
Map.addLayer(floodMask.selfMask(), {palette:['0000FF']},
  'Flood Mask blue = likely flooded VV less than -18dB');

print('=== LABEL PREPARATION GUIDE ===');
print('Blue areas = likely flooded based on SAR threshold');
print('Read the comments below for digitizing instructions');

// ============================================================
// HOW TO DIGITIZE SAMPLE POINTS:
//
// PART A — FLOODED POINTS (Label = 1):
// 1. In Geometry Imports panel top-left, click: + new layer
// 2. Name it EXACTLY: FloodedPoints
// 3. Select the point tool (dot icon in map toolbar)
// 4. Place ~500 points on:
//    - Blue flood mask areas
//    - Low valley floors along Filyos River and Arac Cayi
//    - Flat low-elevation areas near rivers
//
// PART B — NON-FLOODED POINTS (Label = 0):
// 1. Add another new layer named EXACTLY: NonFloodedPoints
// 2. Place ~500 points on:
//    - High elevation hillsides and ridgelines
//    - Forested mountain slopes
//    - Areas clearly away from rivers
//
// PART C — AFTER DIGITIZING:
// 1. Select the export block below
// 2. Press Ctrl+/ to uncomment
// 3. Click Run again
// 4. Go to Tasks tab, click RUN on all 3 exports
// ============================================================

/*
var floodedFC = ee.FeatureCollection(FloodedPoints).map(function(f) {
  return f.set('Label', 1);
});
var nonFloodedFC = ee.FeatureCollection(NonFloodedPoints).map(function(f) {
  return f.set('Label', 0);
});
var merged = floodedFC.merge(nonFloodedFC);

print('Flooded points:', floodedFC.size());
print('Non-flooded points:', nonFloodedFC.size());
print('Total:', merged.size());

Export.table.toDrive({
  collection: floodedFC,
  description: 'Flooded_Points',
  folder: 'GIS_Flood_Karabuk',
  fileFormat: 'SHP'
});
Export.table.toDrive({
  collection: nonFloodedFC,
  description: 'NonFlooded_Points',
  folder: 'GIS_Flood_Karabuk',
  fileFormat: 'SHP'
});
Export.table.toDrive({
  collection: merged,
  description: 'samplepoints_merged',
  folder: 'GIS_Flood_Karabuk',
  fileFormat: 'CSV'
});
print('3 exports ready — go to Tasks tab');
*/
