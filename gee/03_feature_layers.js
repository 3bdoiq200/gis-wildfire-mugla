// ============================================================
// Script 03 — 15 Wildfire Feature Rasters
// GIS-Wildfire-Mugla | CME434 | Karabuk University
// GitHub: git@github.com:3bdOIQ200/GIS-Wildfire-Mugla.git
// ============================================================
// Features:
// 01 Elevation      06 NDVI         11 LST
// 02 Slope          07 NDWI         12 Soil Moisture
// 03 Aspect         08 EVI          13 Distance to Roads
// 04 Hillshade      09 NBR          14 Distance to Urban
// 05 TPI            10 Wind Speed   15 Annual Rainfall
// ============================================================

var aoi = ee.FeatureCollection("FAO/GAUL/2015/level1")
  .filter(ee.Filter.eq("ADM1_NAME", "Mugla"))
  .geometry();

Map.centerObject(aoi, 9);

var SCALE  = 100;
var FOLDER = "GIS_Wildfire_Mugla";

// DEM features
var dem       = ee.Image("USGS/SRTMGL1_003").clip(aoi);
var slope     = ee.Terrain.slope(dem).rename("slope");
var aspect    = ee.Terrain.aspect(dem).rename("aspect");
var hillshade = ee.Terrain.hillshade(dem).rename("hillshade");
var tpi       = dem.subtract(dem.focal_mean(3,"square","pixels")).rename("tpi");

// Sentinel-2 spectral indices
function maskS2clouds(image) {
  var qa = image.select("QA60");
  return image.updateMask(
    qa.bitwiseAnd(1<<10).eq(0).and(qa.bitwiseAnd(1<<11).eq(0))
  ).divide(10000);
}
var s2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filterBounds(aoi).filterDate("2025-05-01","2025-06-20")
  .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE",20))
  .map(maskS2clouds).median().clip(aoi);

var ndvi = s2.normalizedDifference(["B8","B4"]).rename("ndvi");
var ndwi = s2.normalizedDifference(["B3","B8"]).rename("ndwi");
var evi  = s2.expression(
  "2.5*(NIR-RED)/(NIR+6*RED-7.5*BLUE+1)",
  {NIR:s2.select("B8"),RED:s2.select("B4"),BLUE:s2.select("B2")}
).rename("evi");
var nbr  = s2.normalizedDifference(["B8","B12"]).rename("nbr");

// LST from Landsat 8
var lst = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
  .filterBounds(aoi).filterDate("2025-05-01","2025-06-20")
  .select("ST_B10").mean()
  .multiply(0.00341802).add(149.0).subtract(273.15)
  .clip(aoi).rename("lst");

// Wind speed from ERA5
var wind = ee.ImageCollection("ECMWF/ERA5_LAND/MONTHLY_AGGR")
  .filterBounds(aoi)
  .filterDate("2023-01-01","2024-12-01")
  .select(["u_component_of_wind_10m","v_component_of_wind_10m"])
  .mean();
var windSpeed = wind.select("u_component_of_wind_10m").pow(2)
  .add(wind.select("v_component_of_wind_10m").pow(2))
  .sqrt().clip(aoi).rename("wind_speed");

// Annual rainfall from CHIRPS
var rainfall = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
  .filterDate("2024-01-01","2024-12-31")
  .sum().clip(aoi).rename("rainfall");

// Soil moisture from SMAP
var soilMoisture = ee.ImageCollection("NASA_USDA/HSL/SMAP10KM_soil_moisture")
  .filterDate("2023-01-01","2024-12-31")
  .select("ssm").mean().clip(aoi).rename("soil_moisture");

// Distance to urban (MODIS land cover)
var urban = ee.ImageCollection("MODIS/006/MCD12Q1")
  .filterDate("2020-01-01","2021-01-01")
  .first().select("LC_Type1").eq(13).clip(aoi);
var distUrban = urban.fastDistanceTransform().sqrt()
  .multiply(ee.Image.pixelArea().sqrt())
  .clip(aoi).rename("dist_urban");

// Distance to roads (OSM via TIGER approximation)
var roads = ee.FeatureCollection("FAO/GAUL/2015/level1")
  .filter(ee.Filter.eq("ADM1_NAME", "Mugla"));
var roadsRaster = ee.Image().toByte().paint(roads, 1);
var distRoads = roadsRaster.fastDistanceTransform().sqrt()
  .multiply(ee.Image.pixelArea().sqrt())
  .clip(aoi).rename("dist_roads");

// Export all 15
var features = [
  {image: dem.rename("elevation"), name: "01_elevation"},
  {image: slope,       name: "02_slope"},
  {image: aspect,      name: "03_aspect"},
  {image: hillshade,   name: "04_hillshade"},
  {image: tpi,         name: "05_tpi"},
  {image: ndvi,        name: "06_ndvi"},
  {image: ndwi,        name: "07_ndwi"},
  {image: evi,         name: "08_evi"},
  {image: nbr,         name: "09_nbr"},
  {image: windSpeed,   name: "10_wind_speed"},
  {image: lst,         name: "11_lst"},
  {image: soilMoisture,name: "12_soil_moisture"},
  {image: distRoads,   name: "13_dist_roads"},
  {image: distUrban,   name: "14_dist_urban"},
  {image: rainfall,    name: "15_rainfall"}
];

features.forEach(function(f) {
  Map.addLayer(f.image, {}, f.name, false);
  Export.image.toDrive({
    image: f.image.toFloat(),
    description: f.name,
    folder: FOLDER,
    fileNamePrefix: f.name,
    region: aoi,
    scale: SCALE,
    maxPixels: 1e10
  });
});

print("All 15 features queued for export — go to Tasks tab");
