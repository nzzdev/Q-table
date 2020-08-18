const fixtureDataDirectory = "../resources/fixtures/data";
var fs = require("fs");

// provide every fixture data file present in ../../resources/fixtures/data
const fixtureData = [
  [
    `${fixtureDataDirectory}/two-column.json`,
    require(`${fixtureDataDirectory}/two-column.json`),
  ],
  [
    `${fixtureDataDirectory}/four-column.json`,
    require(`${fixtureDataDirectory}/four-column.json`),
  ],
  [
    `${fixtureDataDirectory}/four-column-no-header.json`,
    require(`${fixtureDataDirectory}/four-column-no-header.json`),
  ],
  [
    `${fixtureDataDirectory}/dates-in-data.json`,
    require(`${fixtureDataDirectory}/dates-in-data.json`),
  ],
  [
    `${fixtureDataDirectory}/mixed-numbers-and-text-in-cell.json`,
    require(`${fixtureDataDirectory}/mixed-numbers-and-text-in-cell.json`),
  ],
  [
    `${fixtureDataDirectory}/hyphen-sign-as-number.json`,
    require(`${fixtureDataDirectory}/hyphen-sign-as-number.json`),
  ],
  [
    `${fixtureDataDirectory}/multiline-text.json`,
    require(`${fixtureDataDirectory}/multiline-text.json`),
  ],
  [
    `${fixtureDataDirectory}/show-more-button.json`,
    require(`${fixtureDataDirectory}/show-more-button.json`),
  ],
  [
    `${fixtureDataDirectory}/disappearing-columns.json`,
    require(`${fixtureDataDirectory}/disappearing-columns.json`),
  ],
  [
    `${fixtureDataDirectory}/column-spacing.json`,
    require(`${fixtureDataDirectory}/column-spacing.json`),
  ],
  [
    `${fixtureDataDirectory}/minibars-mixed.json`,
    require(`${fixtureDataDirectory}/minibars-mixed.json`),
  ],
  [
    `${fixtureDataDirectory}/minibars-positive.json`,
    require(`${fixtureDataDirectory}/minibars-positive.json`),
  ],
  [
    `${fixtureDataDirectory}/minibars-negative.json`,
    require(`${fixtureDataDirectory}/minibars-negative.json`),
  ],
  [
    `${fixtureDataDirectory}/minibars-header-with-numbers.json`,
    require(`${fixtureDataDirectory}/minibars-header-with-numbers.json`),
  ],
  [
    `${fixtureDataDirectory}/minibars-custom-className.json`,
    require(`${fixtureDataDirectory}/minibars-custom-className.json`),
  ],
  [
    `${fixtureDataDirectory}/minibars-custom-colorCode.json`,
    require(`${fixtureDataDirectory}/minibars-custom-colorCode.json`),
  ],
  [
    `${fixtureDataDirectory}/display-footnotes.json`,
    require(`${fixtureDataDirectory}/display-footnotes.json`),
  ],
  [
    `${fixtureDataDirectory}/display-merged-footnotes.json`,
    require(`${fixtureDataDirectory}/display-merged-footnotes.json`),
  ],
  [
    `${fixtureDataDirectory}/display-merged-footnotes-multiple.json`,
    require(`${fixtureDataDirectory}/display-merged-footnotes-multiple.json`),
  ],
  [
    `${fixtureDataDirectory}/display-footnotes-before-minibar.json`,
    require(`${fixtureDataDirectory}/display-footnotes-before-minibar.json`),
  ],
  [
    `${fixtureDataDirectory}/display-alot-of-footnotes.json`,
    require(`${fixtureDataDirectory}/display-alot-of-footnotes.json`),
  ],
  [
    `${fixtureDataDirectory}/hide-footnotes-in-header.json`,
    require(`${fixtureDataDirectory}/hide-footnotes-in-header.json`),
  ],
  [
    `${fixtureDataDirectory}/display-footnotes-in-cardlayout.json`,
    require(`${fixtureDataDirectory}/display-footnotes-in-cardlayout.json`),
  ],
  [
    `${fixtureDataDirectory}/footnote-positive-minibars.json`,
    require(`${fixtureDataDirectory}/footnote-positive-minibars.json`),
  ],
  [
    `${fixtureDataDirectory}/footnote-negative-minibars.json`,
    require(`${fixtureDataDirectory}/footnote-negative-minibars.json`),
  ],
  [
    `${fixtureDataDirectory}/footnote-mixed-minibars.json`,
    require(`${fixtureDataDirectory}/footnote-mixed-minibars.json`),
  ],
  [
    `${fixtureDataDirectory}/cardlayout.json`,
    require(`${fixtureDataDirectory}/cardlayout.json`),
  ],
  [
    `${fixtureDataDirectory}/cardlayout-mobile.json`,
    require(`${fixtureDataDirectory}/cardlayout-mobile.json`),
  ],
  [
    `${fixtureDataDirectory}/lots-of-data.json`,
    require(`${fixtureDataDirectory}/lots-of-data.json`),
  ],
  [
    `${fixtureDataDirectory}/formatted-number.json`,
    require(`${fixtureDataDirectory}/formatted-number.json`),
  ],
  [
    `${fixtureDataDirectory}/formatted-number-mixed.json`,
    require(`${fixtureDataDirectory}/formatted-number-mixed.json`),
  ],
  [
    `${fixtureDataDirectory}/formatted-number-negative.json`,
    require(`${fixtureDataDirectory}/formatted-number-negative.json`),
  ],
];

// register migration scripts here in order of version,
// i.e. list the smallest version first
const migrationScripts = [
  require("../migration-scripts/to-v2.0.0.js"),
  require("../migration-scripts/to-v3.0.0.js"),
];

fixtureData.forEach((item) => {
  migrationScripts.forEach((script) => {
    if (
      item[1].data !== undefined &&
      (item[1].data !== null) & (item[1].options !== undefined) &&
      item[1].options !== null
    ) {
      script.migrate(item[1]);
      fs.writeFile(
        item[0].split("../")[1],
        JSON.stringify(item[1], null, 2),
        function (err) {
          if (err) {
            return console.log(err);
          }
        }
      );
    }
  });
});
