const fs = require("fs");

fs.readFile("./data/crashes.csv", "utf8", function(err, csvRaw) {
  if (err) throw err;
  const csv = csvRaw.split("\n");
  const headers = csv[0];
  const data = csv.slice(1);

  const testDataCount = 10e3;

  const shuffled = data.sort(() => 0.5 - Math.random());

  let selected = shuffled.slice(0, testDataCount);

  fs.writeFile(
    "./data/devCrashes.csv",
    [headers, ...selected].join("\n"),
    function(err) {
      if (err) throw err;
      console.log("Dev data prepared");
    }
  );
});
