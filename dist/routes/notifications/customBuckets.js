var rootDir = __dirname + "/../../../";
var distDir = rootDir + 'dist/';
var helpersDir = distDir + "helpers";
var Joi = require("joi");
var dataHelpers = require("".concat(helpersDir, "/data.js"));
module.exports = {
    method: "POST",
    path: "/notification/customBuckets",
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
            if (item.options.colorColumn.bucketType === "custom") {
                var bucketBorders = dataHelpers.getCustomBucketBorders(item.options.colorColumn.customBuckets);
                var values = dataHelpers.getNumericalValuesByColumn(item.data.table, item.options.colorColumn.selectedColumn);
                var numberValues = dataHelpers.getNonNullValues(values);
                var metaData = dataHelpers.getMetaData(values, numberValues);
                if (bucketBorders[0] > metaData.minValue ||
                    bucketBorders[bucketBorders.length - 1] < metaData.maxValue) {
                    return {
                        message: {
                            title: "notifications.customBuckets.title",
                            body: "notifications.customBuckets.body"
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
