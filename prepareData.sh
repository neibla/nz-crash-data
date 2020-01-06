RAW_DATA_FILE=./data/crashDataRaw.csv
OUTPUT_FILE=./data/crashes.csv
if [ ! -f "$RAW_DATA_FILE" ]; then
    curl --request GET --compressed --url https://opendata.arcgis.com/datasets/2d591918912b4eb397613190ada392f3_0.csv > $RAW_DATA_FILE
fi

node prepareData.js "$RAW_DATA_FILE" "$OUTPUT_FILE"