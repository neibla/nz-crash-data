const fs = require("fs");
const request = require("request");
const JSONStream = require("JSONStream");
const es = require("event-stream");

const outputFile = process.argv[2] || "crashes.json";
const crashLimit = process.argv[3] || 1e10;

//remapping some fields for convenience...
const propertyMappings = {
  OBJECTID: "id",
  crashYear: "year",
  crashSever: "severity",
  fatalCount: "fatalities",
  seriousInj: "seriousInjuries",
  minorInjur: "minorInjuries",
  multiVehic: "type",
  carStation: "carStationWagons",
  otherVehic: "otherVehicles",
  vanOrUtili: "vanOrUtility",
  unknownVeh: "unknownVehicles",
  Pedestrian: "pedestrians"
};

const dataTransforms = {
  holiday: data => data.holiday !== "None" && data.holiday
};

const propertiesNotRenamed = [
  "holiday",
  "speedLimit",
  "light",
  "weatherA",
  "train",
  "vehicle",
  "bicycle",
  "bus",
  "moped",
  "motorcycle",
  "schoolBus",
  "suv",
  "taxi",
  "truck"
];

function roundCoordinates(coordinates) {
  return {
    latitude: Number(coordinates[0].toFixed(6)),
    longitude: Number(coordinates[1].toFixed(6))
  };
}

const includedProperties = new Set([
  ...propertiesNotRenamed,
  ...Object.keys(propertyMappings)
]);

const fileOutputStream = fs.createWriteStream(outputFile);

let index = 0;
let crashLimitWarningTriggered = false;

const transformer = data => {
  if (index >= crashLimit) {
    if (!crashLimitWarningTriggered) {
      console.warn(`configured crashLimit exceeded - ${crashLimit}`);
      crashLimitWarningTriggered = true;
    }
    return;
  }

  const countAtLeastWithMinorInjuries =
    data.properties.minorInjur +
    data.properties.seriousInj +
    data.properties.fatalCount;

  if (countAtLeastWithMinorInjuries === 0) {
    // ignoring data with less than at least 1 minor injury
    return;
  }
  const prepared = roundCoordinates(data.geometry.coordinates);
  for (let key of Object.keys(data.properties)) {
    const value = dataTransforms[key]
      ? dataTransforms[key](data.properties)
      : data.properties[key];

    if (!includedProperties.has(key) || !value) {
      //skipping unused fields + ignoring 0/null/undefined values
      continue;
    }
    //make use of renamed field if present
    if (propertyMappings[key]) {
      prepared[propertyMappings[key]] = value;
    } else {
      prepared[key] = value;
    }
  }
  let result = JSON.stringify(prepared);
  if (index === 0) {
    result = "[" + result;
  } else {
    result = "," + result;
  }
  fileOutputStream.write(result);

  index++;
};

const end = () => {
  const finish = "]";
  fileOutputStream.write(finish, () => {
    fileOutputStream.close();
  });
};

request({
  url:
    "https://opendata.arcgis.com/datasets/a163c5addf2c4b7f9079f08751bd2e1a_0.geojson",
  gzip: true
})
  .pipe(JSONStream.parse("features.*"))
  .pipe(es.through(transformer, end));
