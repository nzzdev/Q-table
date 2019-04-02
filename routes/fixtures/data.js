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
  require(`${fixtureDataDirectory}/disappearing-columns.json`),
  require(`${fixtureDataDirectory}/column-spacing.json`),
  require(`${fixtureDataDirectory}/minibars-mixed.json`),
  require(`${fixtureDataDirectory}/minibars-positive.json`),
  require(`${fixtureDataDirectory}/minibars-negative.json`),
  require(`${fixtureDataDirectory}/minibars-header-with-numbers.json`),
  require(`${fixtureDataDirectory}/minibars-custom-className.json`),
  require(`${fixtureDataDirectory}/minibars-custom-colorCode.json`),
  require(`${fixtureDataDirectory}/display-footnotes.json`),
  require(`${fixtureDataDirectory}/display-footnotes-before-minibar.json`),
  require(`${fixtureDataDirectory}/display-alot-of-footnotes.json`),
  require(`${fixtureDataDirectory}/hide-footnotes-in-header.json`),
  require(`${fixtureDataDirectory}/display-footnotes-in-cardlayout.json`),
  require(`${fixtureDataDirectory}/footnotes-positive-minibars.json`),
  require(`${fixtureDataDirectory}/footnotes-negative-minibars.json`),
  require(`${fixtureDataDirectory}/footnotes-mixed-minibars.json`),
  require(`${fixtureDataDirectory}/cardlayout.json`),
  require(`${fixtureDataDirectory}/cardlayout-mobile.json`),
  require(`${fixtureDataDirectory}/lots-of-data.json`),
  require(`${fixtureDataDirectory}/special-characters.json`),
  require(`${fixtureDataDirectory}/formatted-numbers.json`)
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
