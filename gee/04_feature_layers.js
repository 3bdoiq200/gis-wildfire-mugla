// QUOTA LEVEL: HEAVY
// PURPOSE: Export all 15 flood susceptibility feature rasters at 100m
// EXPORTS: 15 GeoTIFFs + 1 training dataset CSV to GIS_Flood_Karabuk
// GEE PROJECT: causal-bison-488813-q1
// WARNING: Run ONLY after scripts 01, 02, 03 confirmed working
// TIP: If quota is low, comment out some exports and run in batches next day

var aoi = ee.FeatureCollection('FAO/GAUL/2015/level1')
  .filter(ee.Filter.eq('ADM1_NAME', 'Karabük'))
  .geometry();
Map.centerObject(aoi, 9);

// ---- TERRAIN FEATURES (from DEM) ----
var dem       = ee.Image('USGS/SRTMGL1_003').clip(aoi).rename('Elevation');
var slope     = ee.Terrain.slope(dem).rename('Slope');
var aspect    = ee.Terrain.aspect(dem).rename('Aspect');
var hillshade = ee.Terrain.hillshade(dem).rename('Hillshade');

// ---- HYDROLOGY FEATURES ----
var flowAcc = ee.Image('WWF/HydroSHEDS/30ACC').clip(aoi).rename('FlowAcc');

var rivers = ee.FeatureCollection('WWF/HydroSHEDS/v1/FreeFlowingRivers')
  .filterBounds(aoi);
var riversRaster = ee.Image().toByte().paint(rivers, 1).unmask(0)
  .reproject({crs: dem.projection(), scale: 30});
var dRivers = riversRaster.fastDistanceTransform(256).sqrt()
  .multiply(30).clip(aoi).rename('D_Rivers');

var slopeRad = slope.multiply(Math.PI / 180).max(0.001);
var twi = flowAcc.add(1).log()
  .subtract(slopeRad.tan().log()).clip(aoi).rename('TWI');

var drainDensity = riversRaster.reduceNeighborhood({
  reducer: ee.Reducer.sum(),
  kernel: ee.Kernel.circle(3000, 'meters')
}).clip(aoi).rename('DrainDensity');

// ---- CLIMATE FEATURE ----
var chirps = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
  .filterDate('2015-01-01','2020-12-31')
  .filterBounds(aoi).mean().multiply(365)
  .clip(aoi).rename('Rainfall');

// ---- VEGETATION FEATURE ----
var s2ndvi = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterDate('2020-01-01','2021-12-31').filterBounds(aoi)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
  .map(function(img){
    return img.normalizedDifference(['B8','B4']).rename('NDVI').clip(aoi);
  }).median().rename('NDVI');

// ---- LAND SURFACE FEATURES ----
var lulc = ee.ImageCollection('ESA/WorldCover/v200')
  .first().clip(aoi).rename('LULC');

var jrc = ee.Image('JRC/GSW1_4/GlobalSurfaceWater')
  .select('occurrence').clip(aoi).rename('SurfaceWater');

var curv = slope.convolve(ee.Kernel.laplacian8())
  .clip(aoi).rename('Curvature');

var pop = ee.ImageCollection('WorldPop/GP/100m/pop')
  .filterDate('2020-01-01','2020-12-31')
  .filterBounds(aoi).mean().clip(aoi).rename('PopDensity');

// ---- PLACEHOLDER FEATURE ----
// D_Roads: requires OSM road data. Using zero placeholder.
// Note in report: Distance to Roads was unavailable in GEE.
// Can be computed in QGIS from OSM shapefiles if needed.
var dRoads = dem.multiply(0).rename('D_Roads');

// ---- STACK ALL 15 FEATURES ----
var featureStack = dem
  .addBands(slope).addBands(aspect).addBands(hillshade)
  .addBands(flowAcc).addBands(dRivers).addBands(twi)
  .addBands(drainDensity).addBands(chirps).addBands(s2ndvi)
  .addBands(lulc).addBands(jrc).addBands(curv)
  .addBands(pop).addBands(dRoads);

print('Feature stack band names:', featureStack.bandNames());
print('Expected 15 bands — check Console');

// Max 3 layers to save quota
Map.addLayer(dem, {min:0,max:2000,
  palette:['313695','4575b4','abd9e9','ffffbf','fdae61','d73027']},
  'Elevation');
Map.addLayer(dRivers, {min:0,max:5000,
  palette:['blue','cyan','green','yellow','red']},
  'Distance to Rivers');
Map.addLayer(lulc, {}, 'Land Cover (ESA WorldCover)');

// ---- EXPORTS — All 15 individual features ----
var exportParams = {folder:'GIS_Flood_Karabuk', region:aoi,
  scale:100, crs:'EPSG:4326', maxPixels:1e13};

Export.image.toDrive(Object.assign({image:dem,
  description:'Feature_Elevation'}, exportParams));
Export.image.toDrive(Object.assign({image:slope,
  description:'Feature_Slope'}, exportParams));
Export.image.toDrive(Object.assign({image:aspect,
  description:'Feature_Aspect'}, exportParams));
Export.image.toDrive(Object.assign({image:hillshade,
  description:'Feature_Hillshade'}, exportParams));
Export.image.toDrive(Object.assign({image:flowAcc,
  description:'Feature_FlowAcc'}, exportParams));
Export.image.toDrive(Object.assign({image:dRivers,
  description:'Feature_D_Rivers'}, exportParams));
Export.image.toDrive(Object.assign({image:twi,
  description:'Feature_TWI'}, exportParams));
Export.image.toDrive(Object.assign({image:drainDensity,
  description:'Feature_DrainDensity'}, exportParams));
Export.image.toDrive(Object.assign({image:chirps,
  description:'Feature_Rainfall'}, exportParams));
Export.image.toDrive(Object.assign({image:s2ndvi,
  description:'Feature_NDVI'}, exportParams));
Export.image.toDrive(Object.assign({image:lulc,
  description:'Feature_LULC'}, exportParams));
Export.image.toDrive(Object.assign({image:jrc,
  description:'Feature_SurfaceWater'}, exportParams));
Export.image.toDrive(Object.assign({image:curv,
  description:'Feature_Curvature'}, exportParams));
Export.image.toDrive(Object.assign({image:pop,
  description:'Feature_PopDensity'}, exportParams));
Export.image.toDrive(Object.assign({image:dRoads,
  description:'Feature_D_Roads'}, exportParams));

print('=== 15 export tasks created ===');
print('Go to Tasks tab — click RUN on each export');
print('TIP: If quota runs out, comment out completed exports and resume tomorrow');

// ---- TRAINING DATASET SAMPLE ----
// Uncomment AFTER Flooded_Points and NonFlooded_Points are exported from script 03
// and re-imported as assets or geometry imports
/*
var samplePoints = ee.FeatureCollection('users/YOUR_USERNAME/Flooded_Points')
  .merge(ee.FeatureCollection('users/YOUR_USERNAME/NonFlooded_Points'));

var stack100m = featureStack.resample('bilinear')
  .reproject({crs:'EPSG:4326', scale:100});

var trainingData = stack100m.sampleRegions({
  collection: samplePoints,
  properties: ['Label'],
  scale: 100,
  geometries: true
});
print('Training samples:', trainingData.size());
Export.table.toDrive({
  collection: trainingData,
  description: 'Training_Dataset',
  folder: 'GIS_Flood_Karabuk',
  fileFormat: 'CSV'
});
*/
