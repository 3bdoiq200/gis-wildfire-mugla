# Changelog

All major changes to this project are recorded here.

---

## [0.5.0] — 2026-05-02 — Full Implementation Complete

- Created 5 GEE JavaScript scripts (gee/01–05): boundary test, flood imagery,
  label export, all 15 feature layers, full AOI CSV export
- Created 3 Colab ML notebooks (colab/01 data prep, 02 model training, 03 mapping):
  RF + XGBoost + SVM training, ROC curves, confusion matrices, rasterization
- Created Leaflet web GIS app (web/index.html): dark theme, 5-class susceptibility
  layer, popups, legend, layer control, rainfall scenario slider
- Created web/data/README.md with GeoJSON data documentation
- Created report outline (report/CME434_Flood_Report_OUTLINE.md): 11 sections,
  figure list, page targets, all 100-mark components mapped to report sections
- Created scripts/generate_notebooks.py (utility to regenerate notebooks from source)
- No packages installed; no GEE scripts run; no data files generated

## [0.2.0] — 2026-05-02 — Documentation Improvements

- Rewrote `README.md`: added project description paragraph, grading breakdown table,
  technology stack table, and improved folder structure listing
- Created `docs/DATASETS.md`: full dataset table with Priority and Notes columns
  covering all 11 GEE/external sources
- Improved `docs/PROJECT_REQUIREMENTS_DRAFT.md`: added "Flood Event Candidates"
  section (3 candidates; recommends August 2021 Black Sea floods) and
  "Label Strategy" section (Sentinel-1 SAR thresholding method for flooded/non-flooded
  point identification)
- Improved `docs/TODO.md`: added Day-by-day plan table (May 2–19) above existing phases
- Created `docs/GRADING_CHECKLIST.md`: 100-mark checkbox list covering all 7 graded
  components plus report/submission items
- Created placeholder README.md files in: `data/raw/`, `data/processed/`,
  `data/sample_points/`, `outputs/maps/`, `outputs/models/`, `outputs/figures/`
- No code was written; no packages installed; no GEE scripts generated

## [0.1.0] — Environment Setup
- Created project folder: GIS-Flood-Karabuk
- Initialized Git repository
- Created folder structure
- Created initial documentation files
- Created CLAUDE.md with project rules and workflow
