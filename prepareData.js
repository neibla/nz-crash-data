const fs = require("fs");
const stringify = require("csv-stringify");

const sourceFile = process.argv[2] || "./data/crashDataRaw.csv";
const outputFile = process.argv[3] || "./data/crashes.csv";

const fileOutputStream = fs.createWriteStream(outputFile);

const includeFields = [
  "id",
  "crashYear",
  "crashSeverity",
  "fatalCount",
  "seriousInjuryCount",
  "minorInjuryCount",
  "crashLocation1",
  "crashLocation2",
  "region",
  "holiday",
  "light",
  "speedLimit",
  "advisorySpeed",
  "latitude",
  "longitude",
  "bicycle",
  "bus",
  "carStationWagon",
  "moped",
  "motorcycle",
  "otherVehicleType",
  "pedestrian",
  "schoolBus",
  "suv",
  "taxi",
  "train",
  "truck",
  "vanOrUtility",
  "vehicle"
];

//reordering columns
const includeFieldsIndexMapper = {};
includeFields.forEach((val, index) => {
  includeFieldsIndexMapper[val] = index;
});

//rounding for some compression
const valueTransformer = {
  longitude: val => Number(val).toFixed(6),
  latitude: val => Number(val).toFixed(6)
};

//improving namings from source
const fieldTransformer = {
  Y: "longitude",
  X: "latitude",
  OBJECTID: "id"
};

const ignoreItems = new Set([
  null,
  "Unknown",
  "Nil (Default)",
  "Nil",
  "null",
  "Null",
  "None"
]);

let row = 0;

const lineReader = require("readline").createInterface({
  input: fs.createReadStream(sourceFile)
});

let csvColumnMappings = {};
lineReader.on("line", function(line) {
  let result = new Array(includeFields.length);
  if (row === 0) {
    columnIndex = 0;
    for (const rawColumn of line.split(",")) {
      //cleaning column
      let column = rawColumn.trim();
      column = fieldTransformer[column] || column;
      csvColumnMappings[column] = columnIndex;
      columnIndex++;
    }
    result = [...includeFields];
  } else {
    const data = line.split(",");
    // ignoring non-injury crashes for now.
    if (data[csvColumnMappings.crashSeverity] === "Non-Injury Crash") {
      return;
    }
    for (const column of Object.keys(includeFieldsIndexMapper)) {
      const sourceIndex = csvColumnMappings[column];
      const resultIndex = includeFieldsIndexMapper[column];
      let cell = ignoreItems.has(data[sourceIndex]) ? "" : data[sourceIndex];
      if (cell && valueTransformer[column]) {
        cell = valueTransformer[column](cell);
      }

      result[resultIndex] = cell;
    }
  }
  row++;

  //Need to deal with quotes and commas in strings for csv
  stringify([result], function(err, output) {
    if (err) {
      console.log(
        "Unexpected error stringifying result: ",
        result,
        "error is",
        err
      );
      return;
    }
    fileOutputStream.write(output);
  });
});
