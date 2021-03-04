const Joi = require("@hapi/joi");
const dataHelpers = require("../../helpers/heatmap.js");

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
            item.data = dataHelpers.getDataWithoutHeaderRow(item.data);

            if (
                item.options.choroplethType === "numerical" &&
                item.options.numericalOptions.bucketType === "custom"
            ) {
                const bucketBorders = dataHelpers.getCustomBucketBorders(
                    item.options.numericalOptions.customBuckets
                );
                const values = dataHelpers.getNumericalValues(item.data);
                const numberValues = dataHelpers.getNonNullNumericalValues(values);
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
