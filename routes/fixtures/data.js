const fixtureDataDirectory = "../../resources/fixtures/data";

// provide every fixture data file present in ../../resources/fixtures/data
const fixtureData = [
  require(`${fixtureDataDirectory}/two-column.json`),
  require(`${fixtureDataDirectory}/four-column.json`),
  require(`${fixtureDataDirectory}/four-column-no-header.json`),
  require(`${fixtureDataDirectory}/dates-in-data.json`),
  require(`${fixtureDataDirectory}/mixed-numbers-and-text-in-cell.json`),
  require(`${fixtureDataDirectory}/hyphen-sign-as-number.json`),
  require(`${fixtureDataDirectory}/multiline-text.json`),
  require(`${fixtureDataDirectory}/show-more-button.json`),
  require(`${fixtureDataDirectory}/disappearing-columns.json`)
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
