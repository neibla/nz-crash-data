# NZ Crash Data Extractor

NZ crash data is available in a number of formats from https://opendata-nzta.opendata.arcgis.com/datasets/crash-analysis-system-cas-data

The GeoJson source was streamed, filtered, transformed, and mapped to required fields for the map visualization with only entries with at least one injury with a category of minor or greater included.

To inspect:

GeoJson
```
 curl --request  GET  --compressed --url  https://opendata.arcgis.com/datasets/a163c5addf2c4b7f9079f08751bd2e1a_0.geojson > crashes.geojson
```
CSV
```
curl --request  GET  --compressed --url https://opendata.arcgis.com/datasets/a163c5addf2c4b7f9079f08751bd2e1a_0.csv > crashes.csv
```

