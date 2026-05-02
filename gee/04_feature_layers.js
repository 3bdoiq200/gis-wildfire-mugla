// QUOTA LEVEL: HEAVY
// PURPOSE: Export all 15 flood susceptibility feature rasters at 100m
// EXPORTS: 15 GeoTIFF files to GIS_Flood_Karabuk on Google Drive
// GEE PROJECT: causal-bison-488813-q1
// WARNING: Run only after scripts 01 02 03 are confirmed working
// TIP: Comment out completed exports and run remaining ones next day if quota runs out

var aoi = ee.FeatureCollection('FAO/GAUL/2015/level1')
  .filter(ee.Filter.eq('ADM1_NAME', 'Karabuk'))
  .geometry();

Map.centerObject(aoi, 9);

// ---- TERRAIN FEATURES ----
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
  .filterDate('2015-01-01', '2020-12-31')
  .filterBounds(aoi)
  .mean().multiply(365).clip(aoi).rename('Rainfall');

// ---- VEGETATION FEATURE ----
var s2ndvi = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterDate('2020-01-01', '2021-12-31')
  .filterBounds(aoi)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
  .map(function(img) {
    return img.normalizedDifference(['B8','B4']).rename('NDVI').clip(aoi);
  })
  .median()
  .rename('NDVI');

// ---- LAND SURFACE FEATURES ----
var lulc = ee.ImageCollection('ESA/WorldCover/v200')
  .first().clip(aoi).rename('LULC');

var jrc = ee.Image('JRC/GSW1_4/GlobalSurfaceWater')
  .select('occurrence').clip(aoi).rename('SurfaceWater');

var curv = slope.convolve(ee.Kernel.laplacian8())
  .clip(aoi).rename('Curvature');

var pop = ee.ImageCollection('WorldPop/GP/100m/pop')
  .filterDate('2020-01-01', '2020-12-31')
  .filterBounds(aoi).mean().clip(aoi).rename('PopDensity');

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
Map.addLayer(dem, {
  min:0, max:2000,
  palette:['313695','4575b4','abd9e9','ffffbf','fdae61','d73027']
}, 'Elevation');
Map.addLayer(dRivers, {
  min:0, max:5000,
  palette:['blue','cyan','green','yellow','red']
}, 'Distance to Rivers');
Map.addLayer(lulc, {}, 'Land Cover ESA WorldCover');

// ---- INDIVIDUAL EXPORTS — no Object.assign ----
var folder = 'GIS_Flood_Karabuk';
var sc     = 100;
var proj   = 'EPSG:4326';
var px     = 1e13;

Export.image.toDrive({image:dem,          description:'Feature_Elevation',    folder:folder, region:aoi, scale:sc, crs:proj, maxPixels:px});
Export.image.toDrive({image:slope,        description:'Feature_Slope',        folder:folder, region:aoi, scale:sc, crs:proj, maxPixels:px});
Export.image.toDrive({image:aspect,       description:'Feature_Aspect',       folder:folder, region:aoi, scale:sc, crs:proj, maxPixels:px});
Export.image.toDrive({image:hillshade,    description:'Feature_Hillshade',    folder:folder, region:aoi, scale:sc, crs:proj, maxPixels:px});
Export.image.toDrive({image:flowAcc,      description:'Feature_FlowAcc',      folder:folder, region:aoi, scale:sc, crs:proj, maxPixels:px});
Export.image.toDrive({image:dRivers,      description:'Feature_D_Rivers',     folder:folder, region:aoi, scale:sc, crs:proj, maxPixels:px});
Export.image.toDrive({image:twi,          description:'Feature_TWI',          folder:folder, region:aoi, scale:sc, crs:proj, maxPixels:px});
Export.image.toDrive({image:drainDensity, description:'Feature_DrainDensity', folder:folder, region:aoi, scale:sc, crs:proj, maxPixels:px});
Export.image.toDrive({image:chirps,       description:'Feature_Rainfall',     folder:folder, region:aoi, scale:sc, crs:proj, maxPixels:px});
Export.image.toDrive({image:s2ndvi,       description:'Feature_NDVI',         folder:folder, region:aoi, scale:sc, crs:proj, maxPixels:px});
Export.image.toDrive({image:lulc,         description:'Feature_LULC',         folder:folder, region:aoi, scale:sc, crs:proj, maxPixels:px});
Export.image.toDrive({image:jrc,          description:'Feature_SurfaceWater', folder:folder, region:aoi, scale:sc, crs:proj, maxPixels:px});
Export.image.toDrive({image:curv,         description:'Feature_Curvature',    folder:folder, region:aoi, scale:sc, crs:proj, maxPixels:px});
Export.image.toDrive({image:pop,          description:'Feature_PopDensity',   folder:folder, region:aoi, scale:sc, crs:proj, maxPixels:px});
Export.image.toDrive({image:dRoads,       description:'Feature_D_Roads',      folder:folder, region:aoi, scale:sc, crs:proj, maxPixels:px});

print('=== 15 export tasks created ===');
print('Go to Tasks tab — click RUN on each export');
print('TIP: If quota runs out, comment out completed exports and resume tomorrow');

// ---- TRAINING DATASET — uncomment after sample points are exported ----
/*
var samplePoints = ee.FeatureCollection('users/boodymoh2004/GIS-Flood-Karabuk-Scripts/Flooded_Points')
  .merge(ee.FeatureCollection('users/boodymoh2004/GIS-Flood-Karabuk-Scripts/NonFlooded_Points'));

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
