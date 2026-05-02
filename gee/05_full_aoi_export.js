// QUOTA LEVEL: HEAVY
// PURPOSE: Sample full Karabük Province at 100m for ML prediction (~40,000 points)
// EXPORTS: Full_AOI_100m.csv to GIS_Flood_Karabuk
// GEE PROJECT: causal-bison-488813-q1
// WARNING: Run ONLY after ALL 15 exports from script 04 are confirmed Done in Drive
// WARNING: Run this script ALONE on a fresh quota day

var aoi = ee.FeatureCollection('FAO/GAUL/2015/level1')
  .filter(ee.Filter.eq('ADM1_NAME', 'Karabük'))
  .geometry();

// Copy all feature definitions from script 04 here
var dem       = ee.Image('USGS/SRTMGL1_003').clip(aoi).rename('Elevation');
var slope     = ee.Terrain.slope(dem).rename('Slope');
var aspect    = ee.Terrain.aspect(dem).rename('Aspect');
var hillshade = ee.Terrain.hillshade(dem).rename('Hillshade');
var flowAcc   = ee.Image('WWF/HydroSHEDS/30ACC').clip(aoi).rename('FlowAcc');
var rivers    = ee.FeatureCollection('WWF/HydroSHEDS/v1/FreeFlowingRivers').filterBounds(aoi);
var riversRaster = ee.Image().toByte().paint(rivers,1).unmask(0)
  .reproject({crs:dem.projection(), scale:30});
var dRivers = riversRaster.fastDistanceTransform(256).sqrt()
  .multiply(30).clip(aoi).rename('D_Rivers');
var slopeRad = slope.multiply(Math.PI/180).max(0.001);
var twi = flowAcc.add(1).log().subtract(slopeRad.tan().log())
  .clip(aoi).rename('TWI');
var drainDensity = riversRaster.reduceNeighborhood({
  reducer:ee.Reducer.sum(), kernel:ee.Kernel.circle(3000,'meters')
}).clip(aoi).rename('DrainDensity');
var chirps = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
  .filterDate('2015-01-01','2020-12-31').filterBounds(aoi)
  .mean().multiply(365).clip(aoi).rename('Rainfall');
var s2ndvi = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterDate('2020-01-01','2021-12-31').filterBounds(aoi)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
  .map(function(img){return img.normalizedDifference(['B8','B4'])
    .rename('NDVI').clip(aoi);}).median().rename('NDVI');
var lulc = ee.ImageCollection('ESA/WorldCover/v200').first()
  .clip(aoi).rename('LULC');
var jrc = ee.Image('JRC/GSW1_4/GlobalSurfaceWater')
  .select('occurrence').clip(aoi).rename('SurfaceWater');
var curv = slope.convolve(ee.Kernel.laplacian8()).clip(aoi).rename('Curvature');
var pop = ee.ImageCollection('WorldPop/GP/100m/pop')
  .filterDate('2020-01-01','2020-12-31').filterBounds(aoi)
  .mean().clip(aoi).rename('PopDensity');
var dRoads = dem.multiply(0).rename('D_Roads');

var featureStack = dem
  .addBands(slope).addBands(aspect).addBands(hillshade)
  .addBands(flowAcc).addBands(dRivers).addBands(twi)
  .addBands(drainDensity).addBands(chirps).addBands(s2ndvi)
  .addBands(lulc).addBands(jrc).addBands(curv)
  .addBands(pop).addBands(dRoads);

var lonLat   = ee.Image.pixelLonLat();
var fullStack = featureStack.addBands(lonLat)
  .resample('bilinear')
  .reproject({crs:'EPSG:4326', scale:100});

var fullPoints = fullStack.sample({
  region: aoi, scale: 100,
  projection: 'EPSG:4326',
  geometries: true, tileScale: 4
});

print('Estimated point count (may take a moment):', fullPoints.size());
print('If count is between 30000-60000 — this is correct for Karabük at 100m');

Export.table.toDrive({
  collection: fullPoints,
  description: 'Full_AOI_100m',
  folder: 'GIS_Flood_Karabuk',
  fileFormat: 'CSV'
});

print('=== 1 export created — go to Tasks tab, click RUN ===');
print('After export completes:');
print('1. Download Full_AOI_100m.csv from Google Drive');
print('2. Place in: data/raw/Full_AOI_100m.csv');
print('3. Open colab/03_susceptibility_mapping.ipynb in Google Colab');
