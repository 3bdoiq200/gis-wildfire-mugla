// QUOTA LEVEL: MEDIUM
// PURPOSE: Sentinel-2 RGB and Sentinel-1 SAR before and after August 2021 floods
// EXPORTS: Karabuk_Before_Flood_S2, Karabuk_After_Flood_S2,
//          Karabuk_SAR_Before, Karabuk_SAR_After
// GEE PROJECT: causal-bison-488813-q1

var aoi = ee.FeatureCollection('FAO/GAUL/2015/level1')
  .filter(ee.Filter.eq('ADM1_NAME', 'Karabuk'))
  .geometry();

Map.centerObject(aoi, 9);

function maskS2clouds(image) {
  var qa = image.select('QA60');
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
    .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  return image.updateMask(mask).divide(10000).clip(aoi);
}

var rgbVis = {min: 0.0, max: 0.3, bands: ['B4','B3','B2']};

var s2Before = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterDate('2021-05-01', '2021-06-30')
  .filterBounds(aoi)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
  .map(maskS2clouds)
  .mean();
print('S2 Before loaded');

var s2After = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterDate('2021-08-01', '2021-08-31')
  .filterBounds(aoi)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
  .map(maskS2clouds)
  .mean();
print('S2 After loaded');

Map.addLayer(s2Before, rgbVis, 'S2 Before Flood May-Jun 2021');
Map.addLayer(s2After,  rgbVis, 'S2 After Flood Aug 2021');

var s1Before = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterDate('2021-05-01', '2021-06-30')
  .filterBounds(aoi)
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .select('VV')
  .mean()
  .clip(aoi);

var s1After = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterDate('2021-08-01', '2021-08-31')
  .filterBounds(aoi)
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .select('VV')
  .mean()
  .clip(aoi);

print('SAR layers loaded');
print('Go to Tasks tab and click RUN on each of the 4 exports below');

Export.image.toDrive({
  image: s2Before.select(['B4','B3','B2']),
  description: 'Karabuk_Before_Flood_S2',
  folder: 'GIS_Flood_Karabuk',
  region: aoi, scale: 30,
  crs: 'EPSG:4326', maxPixels: 1e9
});

Export.image.toDrive({
  image: s2After.select(['B4','B3','B2']),
  description: 'Karabuk_After_Flood_S2',
  folder: 'GIS_Flood_Karabuk',
  region: aoi, scale: 30,
  crs: 'EPSG:4326', maxPixels: 1e9
});

Export.image.toDrive({
  image: s1Before,
  description: 'Karabuk_SAR_Before',
  folder: 'GIS_Flood_Karabuk',
  region: aoi, scale: 20,
  crs: 'EPSG:4326', maxPixels: 1e9
});

Export.image.toDrive({
  image: s1After,
  description: 'Karabuk_SAR_After',
  folder: 'GIS_Flood_Karabuk',
  region: aoi, scale: 20,
  crs: 'EPSG:4326', maxPixels: 1e9
});

print('=== 4 export tasks ready — go to Tasks tab ===');
