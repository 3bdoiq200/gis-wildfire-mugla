// QUOTA LEVEL: MEDIUM
// PURPOSE: SAR flood mask display + manual digitizing guide for 500+500 points
// EXPORTS: Flooded_Points.shp, NonFlooded_Points.shp, samplepoints_merged.csv
//          (exports are COMMENTED OUT — uncomment after manual digitizing)
// GEE PROJECT: causal-bison-488813-q1

var aoi = ee.FeatureCollection('FAO/GAUL/2015/level1')
  .filter(ee.Filter.eq('ADM1_NAME', 'Karabuk'))
  .geometry();
Map.centerObject(aoi, 10);

var s1After = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterDate('2021-08-01','2021-08-31').filterBounds(aoi)
  .filter(ee.Filter.eq('instrumentMode','IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation','VV'))
  .select('VV').mean().clip(aoi);

var s2After = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterDate('2021-08-01','2021-08-31').filterBounds(aoi)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',30))
  .map(function(img){
    var mask = img.select('QA60').bitwiseAnd(1<<10).eq(0)
      .and(img.select('QA60').bitwiseAnd(1<<11).eq(0));
    return img.updateMask(mask).divide(10000).clip(aoi);
  }).mean();

var floodMask = s1After.lt(-18);

Map.addLayer(s2After, {min:0,max:0.3,bands:['B4','B3','B2']},
  'S2 After Flood (reference)');
Map.addLayer(s1After, {min:-25,max:0,palette:['black','white']},
  'SAR VV After Flood');
Map.addLayer(floodMask.selfMask(), {palette:['0000FF']},
  'Flood Mask — blue = likely flooded (VV < -18dB)');

print('=== DIGITIZING INSTRUCTIONS — READ BEFORE PLACING POINTS ===');
print('FLOODED POINTS (Label=1): place on BLUE areas and valley floors');
print('NON-FLOODED POINTS (Label=0): place on hilltops and ridges');
print('Target: 500 points each = 1000 total');
print('After digitizing, uncomment the export block and click Run again');

// ================================================================
// HOW TO DIGITIZE POINTS IN GEE:
//
// FLOODED POINTS (Label = 1):
// 1. In Geometry Imports panel (top left), click: + new layer
// 2. Name it EXACTLY: FloodedPoints
// 3. Select the point tool (dot icon in map toolbar)
// 4. Click ~500 points on:
//    - Blue flood mask areas
//    - Low valley floors along Filyos River and Araç Çayı
//    - Flat low-elevation areas
//    - Areas that look bright/flooded in SAR layer
//
// NON-FLOODED POINTS (Label = 0):
// 1. Add another new layer named EXACTLY: NonFloodedPoints
// 2. Click ~500 points on:
//    - High elevation hillsides and ridgelines
//    - Forested mountain slopes
//    - Areas clearly away from rivers
//    - Areas that look dark/dry in SAR layer
//
// WHEN DONE DIGITIZING:
// - Select lines 80-110 below (the export block)
// - Press Ctrl+/ to uncomment
// - Click Run again
// - Go to Tasks tab and click RUN on all 3 exports
// ================================================================

/*
var floodedFC = ee.FeatureCollection(FloodedPoints).map(function(f){
  return f.set('Label', 1);
});
var nonFloodedFC = ee.FeatureCollection(NonFloodedPoints).map(function(f){
  return f.set('Label', 0);
});
var merged = floodedFC.merge(nonFloodedFC);

print('Flooded points count:', floodedFC.size());
print('Non-flooded points count:', nonFloodedFC.size());
print('Total merged:', merged.size());

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
print('=== 3 exports created — go to Tasks tab, click RUN on each ===');
*/
