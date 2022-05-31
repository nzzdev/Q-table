var fixtureDataDirectory = "../../../resources/fixtures/data";
// provide every fixture data file present in ../../resources/fixtures/data
var fixtureData = [
    require("".concat(fixtureDataDirectory, "/two-column.json")),
    require("".concat(fixtureDataDirectory, "/four-column.json")),
    require("".concat(fixtureDataDirectory, "/four-column-no-header.json")),
    require("".concat(fixtureDataDirectory, "/dates-in-data.json")),
    require("".concat(fixtureDataDirectory, "/mixed-numbers-and-text-in-cell.json")),
    require("".concat(fixtureDataDirectory, "/hyphen-sign-as-number.json")),
    require("".concat(fixtureDataDirectory, "/multiline-text.json")),
    require("".concat(fixtureDataDirectory, "/show-more-button.json")),
    require("".concat(fixtureDataDirectory, "/disappearing-columns.json")),
    require("".concat(fixtureDataDirectory, "/column-spacing.json")),
    require("".concat(fixtureDataDirectory, "/minibars-mixed.json")),
    require("".concat(fixtureDataDirectory, "/minibars-positive.json")),
    require("".concat(fixtureDataDirectory, "/minibars-negative.json")),
    require("".concat(fixtureDataDirectory, "/minibars-header-with-numbers.json")),
    require("".concat(fixtureDataDirectory, "/minibars-custom-className.json")),
    require("".concat(fixtureDataDirectory, "/minibars-custom-colorCode.json")),
    require("".concat(fixtureDataDirectory, "/display-footnotes.json")),
    require("".concat(fixtureDataDirectory, "/display-merged-footnotes.json")),
    require("".concat(fixtureDataDirectory, "/display-merged-footnotes-multiple.json")),
    require("".concat(fixtureDataDirectory, "/display-footnotes-before-minibar.json")),
    require("".concat(fixtureDataDirectory, "/display-alot-of-footnotes.json")),
    require("".concat(fixtureDataDirectory, "/hide-footnotes-in-header.json")),
    require("".concat(fixtureDataDirectory, "/display-footnotes-in-cardlayout.json")),
    require("".concat(fixtureDataDirectory, "/footnotes-positive-minibars.json")),
    require("".concat(fixtureDataDirectory, "/footnotes-negative-minibars.json")),
    require("".concat(fixtureDataDirectory, "/footnotes-mixed-minibars.json")),
    require("".concat(fixtureDataDirectory, "/cardlayout.json")),
    require("".concat(fixtureDataDirectory, "/cardlayout-mobile.json")),
    require("".concat(fixtureDataDirectory, "/lots-of-data.json")),
    require("".concat(fixtureDataDirectory, "/special-characters.json")),
    require("".concat(fixtureDataDirectory, "/formatted-numbers.json")),
    require("".concat(fixtureDataDirectory, "/formatted-numbers-mixed.json")),
    require("".concat(fixtureDataDirectory, "/formatted-numbers-negative.json")),
    require("".concat(fixtureDataDirectory, "/table-search-hidden.json")),
    require("".concat(fixtureDataDirectory, "/table-search-show.json")),
    require("".concat(fixtureDataDirectory, "/table-search-with-multiple-columns.json")),
    require("".concat(fixtureDataDirectory, "/colorColumn-numerical.json")),
    require("".concat(fixtureDataDirectory, "/colorColumn-numerical-no-label.json")),
    require("".concat(fixtureDataDirectory, "/colorColumn-numerical-no-data.json")),
    require("".concat(fixtureDataDirectory, "/colorColumn-numerical-footnotes.json")),
    require("".concat(fixtureDataDirectory, "/colorColumn-numerical-custom-colors.json")),
    require("".concat(fixtureDataDirectory, "/colorColumn-categorical.json")),
    require("".concat(fixtureDataDirectory, "/colorColumn-categorical-footnotes.json")),
    require("".concat(fixtureDataDirectory, "/colorColumn-categorical-custom-order.json")),
    require("".concat(fixtureDataDirectory, "/colorColumn-categorical-custom-colors.json")),
];
module.exports = {
    path: "/fixtures/data",
    method: "GET",
    options: {
        tags: ["api"]
    },
    handler: function (request, h) {
        return fixtureData;
    }
};
