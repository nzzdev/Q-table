const fixtureDataDirectory = "../../resources/fixtures/data";

// provide every fixture data file present in ../../resources/fixtures/data
const fixtureData = [
  require(`${fixtureDataDirectory}/two-column.json`),
  require(`${fixtureDataDirectory}/four-column.json`),
  require(`${fixtureDataDirectory}/four-column-no-header.json`),
  require(`${fixtureDataDirectory}/dates-in-data.json`),
  require(`${fixtureDataDirectory}/mixed-numbers-and-text-in-cell.json`),
<<<<<<< HEAD
  require(`${fixtureDataDirectory}/hyphen-sign-as-number.json`),
||||||| merged common ancestors
=======
  require(`${fixtureDataDirectory}/multiline-text.json`),
>>>>>>> added fixture for displaying multiline-text in table (#13)
  require(`${fixtureDataDirectory}/long.json`)
];

module.exports = {
  path: "/fixtures/data",
  method: "GET",
  options: {
    tags: ["api"],
    cors: true
  },
  handler: (request, h) => {
    return fixtureData;
  }
};
