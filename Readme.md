# NZ Crash Data Extractor

NZ crash data is available in a number of formats from https://opendata-nzta.opendata.arcgis.com/datasets/crash-analysis-system-cas-data

The CSV source was streamed, filtered, transformed, and mapped to required fields for the map visualization with only entries with at least one injury with a category of minor or greater included.

To inspect:
```
CSV
```
curl --request  GET  --compressed --url https://opendata.arcgis.com/datasets/2d591918912b4eb397613190ada392f3_0.csv > crashes.csv
```