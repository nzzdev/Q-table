var rootDir = __dirname + "/../../../";
var distDir = rootDir + 'dist/';
var helpersDir = distDir + "helpers";
var Joi = require("joi");
var dataHelpers = require("".concat(helpersDir, "/data.js"));
var numberMainColors = require("".concat(helpersDir, "/colorColumnColor.js")).digitWords.length;
module.exports = {
    method: "POST",
    path: "/notification/numberCategoriesOutOfColorScale",
    options: {
        validate: {
            options: {
                allowUnknown: true
            },
            payload: Joi.object().required()
        },
        tags: ["api"]
    },
    handler: function (request, h) {
        try {
            var item = request.payload.item;
            if (item.options.colorColumn.colorColumnType === "categorical") {
                // removing the header row first
                item.data = dataHelpers.getDataWithoutHeaderRow(item.data);
                var numberUniqueValues = dataHelpers.getUniqueCategoriesCount(item.data.table, item.options.colorColumn);
                if (numberCategories > numberMainColors) {
                    return {
                        message: {
                            title: "notifications.numberCategoriesOutOfColorScale.title",
                            body: "notifications.numberCategoriesOutOfColorScale.body"
                        }
                    };
                }
            }
            return null;
        }
        catch (err) {
            return null;
        }
    }
};
