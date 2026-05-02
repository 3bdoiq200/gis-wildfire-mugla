#!/usr/bin/env python3
"""
Generate Jupyter notebooks for GIS Flood Karabük project.
Run from project root: python3 scripts/generate_notebooks.py
"""
import json
import os


def md(text):
    lines = text.split('\n')
    src = [l + '\n' for l in lines[:-1]] + ([lines[-1]] if lines else [])
    return {"cell_type": "markdown", "metadata": {}, "source": src}


def code(text):
    lines = text.split('\n')
    src = [l + '\n' for l in lines[:-1]] + ([lines[-1]] if lines else [])
    return {
        "cell_type": "code", "execution_count": None,
        "metadata": {}, "outputs": [], "source": src
    }


def notebook(cells):
    return {
        "nbformat": 4, "nbformat_minor": 5,
        "metadata": {
            "kernelspec": {"display_name": "Python 3",
                           "language": "python", "name": "python3"},
            "language_info": {"name": "python", "version": "3.10.0"}
        },
        "cells": cells
    }


def save_nb(nb, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=1, ensure_ascii=False)
    print(f"Saved: {path}")


# ============================================================
# NOTEBOOK 01 — DATA PREPARATION
# ============================================================

nb01 = notebook([

    md("""# Notebook 1: Data Preparation

**Flood Susceptibility Mapping — Karabük, Turkey**
CME434, Karabük University

**Purpose:** Load GEE training CSV, clean it, and save `Inputs.txt` + `Label.txt`
**Input:**  `data/raw/Training_Dataset.csv` (downloaded from Google Drive)
**Output:** `data/processed/Inputs.txt`, `data/processed/Label.txt`"""),

    md("## Step 1 — Import Libraries"),

    code(r"""# Run this cell first
# In Google Colab this works out of the box
# Locally: pip install pandas numpy matplotlib seaborn

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os

print("Libraries loaded")
print(f"pandas {pd.__version__}  |  numpy {np.__version__}")"""),

    md("## Step 2 — Load Training CSV from GEE"),

    code(r"""# TODO: Download Training_Dataset.csv from Google Drive folder GIS_Flood_Karabuk
# Place in: data/raw/Training_Dataset.csv

# Colab — mount Drive:
# from google.colab import drive
# drive.mount('/content/drive')
# csv_path = '/content/drive/MyDrive/GIS_Flood_Karabuk/Training_Dataset.csv'

csv_path = '../data/raw/Training_Dataset.csv'
df = pd.read_csv(csv_path)
print(f"Loaded: {df.shape[0]} rows x {df.shape[1]} columns")
print(f"\nColumns: {df.columns.tolist()}")
print(df.head(3))"""),

    md("## Step 3 — Drop GEE Metadata Columns"),

    code(r"""drop_list = ['system:index', '.geo', 'latitude', 'longitude',
             'longitude_1', 'latitude_1', 'geo']
cols_to_drop = [c for c in df.columns
                if c in drop_list or c.startswith('system')]
print(f"Dropping: {cols_to_drop}")
df_clean = df.drop(columns=cols_to_drop, errors='ignore')
print(f"Remaining columns: {df_clean.columns.tolist()}")
print(f"Shape: {df_clean.shape}")"""),

    md("## Step 4 — Handle Missing Values"),

    code(r"""print("Missing values per column:")
missing = df_clean.isnull().sum()
print(missing[missing > 0] if missing.sum() > 0 else "None")
print(f"Total missing cells: {df_clean.isnull().sum().sum()}")
df_clean = df_clean.dropna()
print(f"Shape after dropna: {df_clean.shape}")"""),

    md("## Step 5 — Separate Features (X) and Labels (y)"),

    code(r"""label_col = 'Label'  # 1 = flooded, 0 = non-flooded

if label_col not in df_clean.columns:
    print(f"ERROR: column '{label_col}' not found")
    print(f"Available: {df_clean.columns.tolist()}")
else:
    X = df_clean.drop(columns=[label_col])
    y = df_clean[label_col]
    print(f"X shape: {X.shape}  |  y shape: {y.shape}")
    print(f"\nClass distribution:\n{y.value_counts()}")
    print(f"\n{y.mean()*100:.1f}% flooded points")"""),

    md("## Step 6 — Feature Distributions"),

    code(r"""print(X.describe().round(3))

os.makedirs('../outputs/figures', exist_ok=True)
n = X.shape[1]
ncols, nrows = 5, (n + 4) // 5
fig, axes = plt.subplots(nrows, ncols, figsize=(ncols*3, nrows*2.5))
axes = axes.flatten()

for i, col in enumerate(X.columns):
    axes[i].hist(X[col].dropna(), bins=30, color='steelblue',
                 edgecolor='white', alpha=0.8)
    axes[i].set_title(col, fontsize=8)
    axes[i].tick_params(labelsize=7)

for j in range(i + 1, len(axes)):
    axes[j].set_visible(False)

plt.suptitle('Feature Distributions — Flood Susceptibility', fontsize=12)
plt.tight_layout()
plt.savefig('../outputs/figures/feature_distributions.png',
            dpi=150, bbox_inches='tight')
plt.show()
print("Saved: outputs/figures/feature_distributions.png")"""),

    md("## Step 7 — Correlation Matrix"),

    code(r"""plt.figure(figsize=(12, 10))
corr = X.corr()
mask = np.triu(np.ones_like(corr, dtype=bool))
sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm',
            center=0, square=True, mask=mask,
            annot_kws={'size': 7}, linewidths=0.5)
plt.title('Feature Correlation Matrix', fontsize=13)
plt.tight_layout()
plt.savefig('../outputs/figures/correlation_matrix.png',
            dpi=150, bbox_inches='tight')
plt.show()
print("Saved: outputs/figures/correlation_matrix.png")

print("\nHighly correlated pairs (|r| > 0.8):")
for i in range(len(corr.columns)):
    for j in range(i + 1, len(corr.columns)):
        if abs(corr.iloc[i, j]) > 0.8:
            print(f"  {corr.columns[i]} / {corr.columns[j]}: "
                  f"{corr.iloc[i,j]:.2f}")"""),

    md("## Step 8 — Save Inputs.txt and Label.txt"),

    code(r"""os.makedirs('../data/processed', exist_ok=True)
np.savetxt('../data/processed/Inputs.txt', X.values)
np.savetxt('../data/processed/Label.txt',  y.values)

print("Saved:")
print(f"  data/processed/Inputs.txt  shape={X.shape}")
print(f"  data/processed/Label.txt   shape={y.shape}")
print("\nFeature column order (= column order in Inputs.txt):")
for i, col in enumerate(X.columns):
    print(f"  col {i:2d}: {col}")
print("\nDone. Next: colab/02_model_training.ipynb")"""),

])  # end nb01

# ============================================================
# NOTEBOOK 02 — MODEL TRAINING
# ============================================================

nb02 = notebook([

    md("""# Notebook 2: Machine Learning Model Training

**Flood Susceptibility Mapping — Karabük, Turkey**
CME434, Karabük University

**Purpose:** Train RF, XGBoost, SVM (2 param sets each), compare, save best model
**Input:**  `data/processed/Inputs.txt`, `data/processed/Label.txt`
**Output:** `outputs/models/best_flood_model.pkl`, `outputs/models/scaler.pkl`,
figures in `outputs/figures/`"""),

    code(r"""# !pip install xgboost --quiet  # uncomment in Colab if needed

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score, classification_report, f1_score,
    roc_auc_score, ConfusionMatrixDisplay, RocCurveDisplay)
import xgboost as xgb
import joblib
import os

os.makedirs('../outputs/models',  exist_ok=True)
os.makedirs('../outputs/figures', exist_ok=True)
print("All libraries loaded")"""),

    md("## Step 1 — Load Data"),

    code(r"""X = np.loadtxt('../data/processed/Inputs.txt')
y = np.loadtxt('../data/processed/Label.txt')
print(f"X: {X.shape}  |  y: {y.shape}")
vals, cnts = np.unique(y, return_counts=True)
print(f"Classes: {dict(zip(vals.astype(int), cnts))}")"""),

    md("## Step 2 — Train/Test Split and Scaling"),

    code(r"""X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42, stratify=y)

scaler    = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s  = scaler.transform(X_test)

print(f"Train: {X_train.shape}  |  Test: {X_test.shape}")
print(f"Flooded in test set: {int(y_test.sum())} / {len(y_test)}")"""),

    md("## Step 3 — Classifier 1: Random Forest"),

    code(r"""print("RF Run 1 — default...")
rf1 = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
rf1.fit(X_train, y_train)

print("RF Run 2 — tuned...")
rf2 = RandomForestClassifier(
    n_estimators=200, max_depth=15, min_samples_split=4,
    max_features='sqrt', random_state=42, n_jobs=-1)
rf2.fit(X_train, y_train)

for name, m in [('RF Default', rf1), ('RF Tuned', rf2)]:
    yp = m.predict(X_test)
    print(f"\n--- {name} ---")
    print(classification_report(y_test, yp,
          target_names=['Non-Flooded', 'Flooded']))
    print(f"AUC: {roc_auc_score(y_test, m.predict_proba(X_test)[:,1]):.4f}")"""),

    md("## Step 4 — Classifier 2: XGBoost"),

    code(r"""print("XGB Run 1 — default...")
xgb1 = xgb.XGBClassifier(
    n_estimators=100, learning_rate=0.1, max_depth=5,
    random_state=42, eval_metric='logloss')
xgb1.fit(X_train, y_train)

print("XGB Run 2 — tuned...")
xgb2 = xgb.XGBClassifier(
    n_estimators=200, learning_rate=0.05, max_depth=7,
    colsample_bytree=0.8, subsample=0.8, min_child_weight=3,
    random_state=42, eval_metric='logloss')
xgb2.fit(X_train, y_train)

for name, m in [('XGB Default', xgb1), ('XGB Tuned', xgb2)]:
    yp = m.predict(X_test)
    print(f"\n--- {name} ---")
    print(classification_report(y_test, yp,
          target_names=['Non-Flooded', 'Flooded']))
    print(f"AUC: {roc_auc_score(y_test, m.predict_proba(X_test)[:,1]):.4f}")"""),

    md("## Step 5 — Classifier 3: SVM (scaled features)"),

    code(r"""print("SVM Run 1 — default (may take 1-2 min)...")
svm1 = SVC(kernel='rbf', C=1.0, probability=True, random_state=42)
svm1.fit(X_train_s, y_train)

print("SVM Run 2 — tuned...")
svm2 = SVC(kernel='rbf', C=10.0, gamma=0.01,
           probability=True, random_state=42)
svm2.fit(X_train_s, y_train)

for name, m in [('SVM Default', svm1), ('SVM Tuned', svm2)]:
    yp = m.predict(X_test_s)
    print(f"\n--- {name} ---")
    print(classification_report(y_test, yp,
          target_names=['Non-Flooded', 'Flooded']))
    print(f"AUC: {roc_auc_score(y_test, m.predict_proba(X_test_s)[:,1]):.4f}")"""),

    md("## Step 6 — Full Model Comparison Table"),

    code(r"""models = {
    'RF Default':  (rf1,  X_test,   X_test),
    'RF Tuned':    (rf2,  X_test,   X_test),
    'XGB Default': (xgb1, X_test,   X_test),
    'XGB Tuned':   (xgb2, X_test,   X_test),
    'SVM Default': (svm1, X_test_s, X_test_s),
    'SVM Tuned':   (svm2, X_test_s, X_test_s),
}

rows = []
for name, (m, _, Xte) in models.items():
    yp    = m.predict(Xte)
    yprob = m.predict_proba(Xte)[:, 1]
    rep   = classification_report(y_test, yp, output_dict=True)
    rows.append({
        'Model':     name,
        'Accuracy':  round(accuracy_score(y_test, yp), 4),
        'F1':        round(f1_score(y_test, yp), 4),
        'AUC':       round(roc_auc_score(y_test, yprob), 4),
        'Precision': round(float(rep['1']['precision']), 4),
        'Recall':    round(float(rep['1']['recall']),    4),
    })

results_df = pd.DataFrame(rows).sort_values('AUC', ascending=False)
print(results_df.to_string(index=False))
print(f"\nBest model: {results_df.iloc[0]['Model']}")"""),

    md("## Step 7 — Confusion Matrices"),

    code(r"""fig, axes = plt.subplots(2, 3, figsize=(15, 9))
for i, (name, (m, _, Xte)) in enumerate(models.items()):
    yp = m.predict(Xte)
    ConfusionMatrixDisplay.from_predictions(
        y_test, yp, ax=axes[i // 3][i % 3],
        display_labels=['Non-Flooded', 'Flooded'],
        colorbar=False)
    axes[i // 3][i % 3].set_title(name, fontsize=11)
plt.suptitle('Confusion Matrices — All Models', fontsize=13)
plt.tight_layout()
plt.savefig('../outputs/figures/confusion_matrices.png',
            dpi=150, bbox_inches='tight')
plt.show()
print("Saved: outputs/figures/confusion_matrices.png")"""),

    md("## Step 8 — ROC Curves"),

    code(r"""fig, ax = plt.subplots(figsize=(8, 6))
palette = ['#2196F3','#1565C0','#FF9800','#E65100','#4CAF50','#1B5E20']
for (name, (m, _, Xte)), col in zip(models.items(), palette):
    RocCurveDisplay.from_predictions(
        y_test, m.predict_proba(Xte)[:, 1],
        ax=ax, name=name, color=col)
ax.plot([0, 1], [0, 1], 'k--', linewidth=0.8, label='Random')
ax.set_title('ROC Curves — Flood Susceptibility Models', fontsize=13)
ax.legend(fontsize=9)
plt.tight_layout()
plt.savefig('../outputs/figures/roc_curves.png', dpi=150, bbox_inches='tight')
plt.show()
print("Saved: outputs/figures/roc_curves.png")"""),

    md("## Step 9 — Feature Importance (Random Forest)"),

    code(r"""rf_rows   = results_df[results_df['Model'].str.startswith('RF')]
best_rf   = rf2 if rf_rows.iloc[0]['Model'] == 'RF Tuned' else rf1

# Replace generic names with actual band names after confirming GEE export order:
# feat_names = ['Elevation','Slope','Aspect','Hillshade','FlowAcc',
#               'D_Rivers','TWI','DrainDensity','Rainfall','NDVI',
#               'LULC','SurfaceWater','Curvature','PopDensity','D_Roads']
feat_names = [f'Feature_{i+1}' for i in range(X.shape[1])]

imp = pd.Series(best_rf.feature_importances_, index=feat_names).sort_values()
fig, ax = plt.subplots(figsize=(8, 7))
bars = ax.barh(imp.index, imp.values, color='steelblue', edgecolor='white')
ax.set_xlabel('Importance (Gini)', fontsize=11)
ax.set_title('Feature Importance — Random Forest', fontsize=13)
for b, v in zip(bars, imp.values):
    ax.text(v + 0.001, b.get_y() + b.get_height() / 2,
            f'{v:.3f}', va='center', fontsize=8)
plt.tight_layout()
plt.savefig('../outputs/figures/feature_importance.png',
            dpi=150, bbox_inches='tight')
plt.show()
print("Saved: outputs/figures/feature_importance.png")"""),

    md("## Step 10 — Save Best Model"),

    code(r"""best_name  = results_df.iloc[0]['Model']
best_model = models[best_name][0]

joblib.dump(best_model, '../outputs/models/best_flood_model.pkl')
joblib.dump(scaler,     '../outputs/models/scaler.pkl')

print(f"Best model : {best_name}")
print(f"AUC        : {results_df.iloc[0]['AUC']}")
print(f"F1         : {results_df.iloc[0]['F1']}")
print(f"Accuracy   : {results_df.iloc[0]['Accuracy']}")
print("\nSaved: outputs/models/best_flood_model.pkl")
print("Saved: outputs/models/scaler.pkl")

results_df.to_csv('../outputs/figures/model_comparison.csv', index=False)
print("Saved: outputs/figures/model_comparison.csv")
print("\nDone. Next: colab/03_susceptibility_mapping.ipynb")"""),

])  # end nb02

# ============================================================
# NOTEBOOK 03 — SUSCEPTIBILITY MAPPING
# ============================================================

nb03 = notebook([

    md("""# Notebook 3: Flood Susceptibility Mapping

**Flood Susceptibility Mapping — Karabük, Turkey**
CME434, Karabük University

**Purpose:** Apply best model to full Karabük AOI, generate susceptibility raster
**Input:**  `data/raw/Full_AOI_100m.csv`, `outputs/models/best_flood_model.pkl`
**Output:** `outputs/maps/Karabuk_Flood_Susceptibility_100m.tif`,
`outputs/figures/flood_susceptibility_map.png`,
`web/data/flood_susceptibility.geojson`"""),

    code(r"""import pandas as pd
import numpy as np
import geopandas as gpd
import rasterio
from rasterio.features import rasterize
from rasterio.transform import from_origin
from shapely.geometry import Point
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.colors import ListedColormap, BoundaryNorm
import json
import joblib
import os

os.makedirs('../data/output',    exist_ok=True)
os.makedirs('../outputs/maps',   exist_ok=True)
os.makedirs('../outputs/figures',exist_ok=True)
print("Libraries loaded")"""),

    md("## Step 1 — Load Full AOI Dataset"),

    code(r"""# TODO: Download Full_AOI_100m.csv from Google Drive folder GIS_Flood_Karabuk
# Place in: data/raw/Full_AOI_100m.csv

full_path = '../data/raw/Full_AOI_100m.csv'
full_df   = pd.read_csv(full_path)
print(f"Full AOI shape: {full_df.shape}")
print(f"First 8 columns: {full_df.columns.tolist()[:8]}")"""),

    md("## Step 2 — Clean Data (same drops as Notebook 1)"),

    code(r"""geo_col   = full_df['.geo']
drop_list = ['system:index', '.geo', 'latitude', 'longitude',
             'latitude_1', 'longitude_1']
drop_cols = [c for c in full_df.columns
             if c in drop_list or c.startswith('system')]
features_df = full_df.drop(columns=drop_cols, errors='ignore')
print(f"Feature columns ({features_df.shape[1]}): {features_df.columns.tolist()}")"""),

    md("## Step 3 — Load Best Model and Predict"),

    code(r"""model      = joblib.load('../outputs/models/best_flood_model.pkl')
model_type = type(model).__name__
print(f"Model loaded: {model_type}")

if 'SVC' in model_type:
    scaler = joblib.load('../outputs/models/scaler.pkl')
    X_pred = scaler.transform(features_df.values)
    print("Using scaled features (SVM)")
else:
    X_pred = features_df.values
    print("Using raw features (tree-based)")

flood_prob = model.predict_proba(X_pred)[:, 1]
print(f"\nPredictions: {len(flood_prob):,} pixels")
print(f"Range : {flood_prob.min():.3f} — {flood_prob.max():.3f}")
print(f"Mean  : {flood_prob.mean():.3f}")"""),

    md("## Step 4 — Build GeoDataFrame"),

    code(r"""def parse_geo(json_str):
    try:
        coords = json.loads(json_str.replace('""', '"'))['coordinates']
        return Point(coords)
    except Exception:
        return None

final_df             = pd.DataFrame({'FloodProb': flood_prob, '.geo': geo_col})
final_df['geometry'] = final_df['.geo'].apply(parse_geo)
final_df             = final_df.dropna(subset=['geometry'])

gdf = gpd.GeoDataFrame(
    final_df[['FloodProb', 'geometry']],
    geometry='geometry', crs='EPSG:4326')
print(f"GeoDataFrame ready: {len(gdf):,} points")"""),

    md("## Step 5 — Classify into 5 Flood Risk Classes"),

    code(r"""RISK_COLORS  = ['#1a9641', '#a6d96a', '#ffffbf', '#fdae61', '#d7191c']
RISK_LABELS  = {1: 'Very Low', 2: 'Low', 3: 'Medium', 4: 'High', 5: 'Very High'}

def classify_risk(p):
    if   p < 0.20: return 1
    elif p < 0.40: return 2
    elif p < 0.60: return 3
    elif p < 0.80: return 4
    else:          return 5

gdf['RiskClass'] = gdf['FloodProb'].apply(classify_risk)
gdf['RiskLabel'] = gdf['RiskClass'].map(RISK_LABELS)
gdf['FloodPct']  = (gdf['FloodProb'] * 100).round(1)

print("Risk class distribution:")
print(gdf['RiskLabel'].value_counts().sort_index())
pct_high = (gdf['RiskClass'] >= 4).mean() * 100
print(f"\nHigh + Very High: {pct_high:.1f}% of Karabük")"""),

    md("## Step 6 — Save Shapefile"),

    code(r"""shp_path = '../data/output/Karabuk_Flood_Probability.shp'
gdf.to_file(shp_path)
print(f"Saved: {shp_path}  ({len(gdf):,} points, CRS={gdf.crs.to_epsg()})"""),

    md("## Step 7 — Rasterize to GeoTIFF"),

    code(r"""gdf_utm    = gdf.to_crs(epsg=32636)
px         = 100
minx, miny, maxx, maxy = gdf_utm.total_bounds
width      = int((maxx - minx) / px) + 1
height     = int((maxy - miny) / px) + 1
transform  = from_origin(minx, maxy, px, px)
meta_base  = dict(driver='GTiff', height=height, width=width,
                  count=1, crs=gdf_utm.crs, transform=transform)

# Probability raster (float)
prob_shapes = ((g, v) for g, v in zip(gdf_utm.geometry, gdf_utm['FloodProb']))
prob_arr    = rasterize(prob_shapes, out_shape=(height, width),
                        transform=transform, fill=np.nan, dtype='float32')
prob_path   = '../outputs/maps/Karabuk_Flood_Susceptibility_100m.tif'
with rasterio.open(prob_path, 'w', **meta_base,
                   dtype='float32', nodata=np.nan) as dst:
    dst.write(prob_arr, 1)
print(f"Saved: {prob_path}")

# Classified raster (int16, 1-5)
cls_shapes  = ((g, v) for g, v in zip(gdf_utm.geometry, gdf_utm['RiskClass']))
cls_arr     = rasterize(cls_shapes, out_shape=(height, width),
                        transform=transform, fill=0, dtype='int16')
cls_path    = '../outputs/maps/Karabuk_Flood_Susceptibility_Classified.tif'
with rasterio.open(cls_path, 'w', **meta_base,
                   dtype='int16', nodata=0) as dst:
    dst.write(cls_arr, 1)
print(f"Saved: {cls_path}")"""),

    md("## Step 8 — Visualize Flood Susceptibility Map"),

    code(r"""cmap   = ListedColormap(RISK_COLORS)
bounds = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5]
norm   = BoundaryNorm(bounds, cmap.N)

with rasterio.open(cls_path) as src:
    data   = src.read(1).astype(float)
    data[data == 0] = np.nan
    extent = [src.bounds.left, src.bounds.right,
              src.bounds.bottom, src.bounds.top]

fig, ax = plt.subplots(figsize=(10, 9))
ax.imshow(data, cmap=cmap, norm=norm, extent=extent)

patches = [mpatches.Patch(color=c, label=f'Class {i+1}: {RISK_LABELS[i+1]}')
           for i, c in enumerate(RISK_COLORS)]
ax.legend(handles=patches, loc='lower right',
          title='Flood Susceptibility', fontsize=9, framealpha=0.9)
ax.set_title('Karabuk Province — Flood Susceptibility Map\n'
             'CME434 | Karabuk University | 2026',
             fontsize=13, fontweight='bold', pad=12)
ax.set_xlabel('Easting (m, UTM 36N)')
ax.set_ylabel('Northing (m, UTM 36N)')
ax.grid(alpha=0.3, linestyle='--', linewidth=0.5)
plt.tight_layout()

fig_path = '../outputs/figures/flood_susceptibility_map.png'
plt.savefig(fig_path, dpi=200, bbox_inches='tight')
plt.show()
print(f"Saved: {fig_path}")"""),

    md("## Step 9 — Export GeoJSON for Leaflet Web App"),

    code(r"""os.makedirs('../web/data', exist_ok=True)
gdf_web  = gdf.iloc[::3].reset_index(drop=True)  # every 3rd point
web_path = '../web/data/flood_susceptibility.geojson'

gdf_web[['FloodProb', 'RiskClass', 'RiskLabel',
         'FloodPct', 'geometry']].to_file(web_path, driver='GeoJSON')

size_mb = os.path.getsize(web_path) / 1e6
print(f"Saved: {web_path}")
print(f"  Points : {len(gdf_web):,} (every 3rd point)")
print(f"  Size   : ~{size_mb:.1f} MB")
print("\nGeoJSON ready. Open web/index.html in browser.")"""),

])  # end nb03

# ============================================================
# WRITE ALL NOTEBOOKS
# ============================================================

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
save_nb(nb01, os.path.join(base, 'colab', '01_data_preparation.ipynb'))
save_nb(nb02, os.path.join(base, 'colab', '02_model_training.ipynb'))
save_nb(nb03, os.path.join(base, 'colab', '03_susceptibility_mapping.ipynb'))
print("All 3 notebooks generated successfully.")
