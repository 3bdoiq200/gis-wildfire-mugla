// QUOTA LEVEL: LIGHT
// PURPOSE: Verify Karabuk AOI boundary and SRTM DEM load correctly
// EXPORTS: NONE — display and print test only
// GEE PROJECT: causal-bison-488813-q1

var aoi = ee.FeatureCollection('FAO/GAUL/2015/level1')
  .filter(ee.Filter.eq('ADM1_NAME', 'Karabuk'))
  .geometry();

print('=== KARABUK BOUNDARY TEST ===');
print('AOI area (km2):', aoi.area().divide(1e6).round());

Map.centerObject(aoi, 9);

var aoiOutline = ee.Image().byte().paint({
  featureCollection: ee.FeatureCollection([ee.Feature(aoi)]),
  color: 1, width: 2
});
Map.addLayer(aoiOutline, {palette: ['FF0000']}, 'Karabuk Boundary');

var dem = ee.Image('USGS/SRTMGL1_003').clip(aoi);

var demStats = dem.reduceRegion({
  reducer: ee.Reducer.minMax().combine(ee.Reducer.mean(), '', true),
  geometry: aoi,
  scale: 90,
  maxPixels: 1e8
});
print('DEM stats (min/max/mean metres):', demStats);

Map.addLayer(dem, {
  min: 0, max: 2000,
  palette: ['313695','4575b4','74add1','abd9e9',
            'e0f3f8','ffffbf','fee090','fdae61',
            'f46d43','d73027','a50026']
}, 'Elevation (SRTM)');

var slope = ee.Terrain.slope(dem);
Map.addLayer(slope, {
  min: 0, max: 60,
  palette: ['white','yellow','orange','red']
}, 'Slope');

print('=== SUCCESS CRITERIA ===');
print('1. Red boundary outline visible around Karabuk');
print('2. Area should be between 3000-5000 km2');
print('3. Elevation min > 0, max < 3000');
print('4. No red errors in Console');
print('If all pass, open gee/02_flood_imagery next');
