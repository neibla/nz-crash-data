const fs = require("fs");

const sourceFile = process.argv[2] || "./data/crashDataRaw.csv";
const outputFile = process.argv[3] || "./data/crashes.csv";

const fileOutputStream = fs.createWriteStream(outputFile);

//ignore these fields for compression/simplicity
const ignoreFields = new Set([
  "urban",
  "outdatedLocationDescription",
  "crashDirectionDescription",
  "roadSurface",
  "meshblockId",
  "areaUnitID",
  "northing",
  "easting",
  "directionRoleDescription",
  "tlaId",
  "tlaName",
  "crashFinancialYear"
]);

//rounding for some compression
const valueTransformer = {
  X: val => Number(val).toFixed(6),
  Y: val => Number(val).toFixed(6)
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
  const result = [];
  if (row === 0) {
    let index = 0;

    for (const rawColumn of line.split(",")) {
      //cleaning column
      let column = rawColumn.trim();
      column = fieldTransformer[column] || column;
      if (!ignoreFields.has(column)) {
        csvColumnMappings[column] = index;
        result.push(column);
      }
      index++;
    }
  } else {
    const data = line.split(",");
    // ignoring non-injury crashes for now.
    if (data[csvColumnMappings.crashSeverity] === "Non-Injury Crash") {
      return;
    }
    for (const column of Object.keys(csvColumnMappings)) {
      const index = csvColumnMappings[column];
      let cell = ignoreItems.has(data[index]) ? "" : data[index];
      if (cell && valueTransformer[column]) {
        cell = valueTransformer[column](cell);
      }
      result.push(cell);
    }
  }
  row++;
  fileOutputStream.write(result.join(",") + "\n");
});
