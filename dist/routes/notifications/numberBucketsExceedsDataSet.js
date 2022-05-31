var rootDir = __dirname + "/../../../";
var distDir = rootDir + 'dist/';
var helpersDir = distDir + "helpers";
var Joi = require("joi");
var dataHelpers = require("".concat(helpersDir, "/data.js"));
module.exports = {
    method: "POST",
    path: "/notification/numberBucketsExceedsDataSet",
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
            // removing the header row first
            item.data.table = dataHelpers.getDataWithoutHeaderRow(item.data.table);
            if (item.options.bucketType !== "custom") {
                var numberUniqueValues = dataHelpers.getUniqueCategoriesCount(item.data.table, item.options.colorColumn);
                var numberBuckets = item.options.colorColumn.numericalOptions.numberBuckets;
                if (numberBuckets > numberUniqueValues) {
                    return {
                        message: {
                            title: "notifications.numberBucketsExceedsDataSet.title",
                            body: "notifications.numberBucketsExceedsDataSet.body"
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
