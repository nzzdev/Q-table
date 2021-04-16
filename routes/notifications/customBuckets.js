const Joi = require("@hapi/joi");
const dataHelpers = require("../../helpers/data.js");
const colorColumnHelpers = require("../../helpers/colorColumn.js");

module.exports = {
    method: "POST",
    path: "/notification/customBuckets",
    options: {
        validate: {
            options: {
                allowUnknown: true,
            },
            payload: Joi.object().required(),
        },
        cors: true,
        tags: ["api"],
    },
    handler: function (request, h) {
        try {
            const item = request.payload.item;
            // removing the header row first
            item.data.table = dataHelpers.getDataWithoutHeaderRow(item.data.table);

            if (item.options.colorColumn.bucketType === "custom") {
                const bucketBorders = colorColumnHelpers.getCustomBucketBorders(
                    item.options.colorColumn.customBuckets
                );
                const values = dataHelpers.getNumericalValuesByColumn(item.data.table, item.options.colorColumn.selectedColumn);
                const numberValues = dataHelpers.getNonNullValues(values);
                const metaData = dataHelpers.getMetaData(values, numberValues);

                if (
                    bucketBorders[0] > metaData.minValue ||
                    bucketBorders[bucketBorders.length - 1] < metaData.maxValue
                ) {
                    return {
                        message: {
                            title: "notifications.customBuckets.title",
                            body: "notifications.customBuckets.body",
                        },
                    };
                }
            }
            return null;
        } catch (err) {
            return null;
        }
    },
};
