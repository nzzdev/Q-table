const Joi = require("@hapi/joi");
const dataHelpers = require("../../helpers/heatmap.js");

module.exports = {
    method: "POST",
    path: "/notification/numberBucketsExceedsDataSet",
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
                item.options.numericalOptions.bucketType !== "custom"
            ) {
                const numberUniqueValues = dataHelpers.getUniqueCategoriesCount(
                    item.data
                );
                const numberBuckets = item.options.numericalOptions.numberBuckets;

                if (numberBuckets > numberUniqueValues) {
                    return {
                        message: {
                            title: "notifications.numberBucketsExceedsDataSet.title",
                            body: "notifications.numberBucketsExceedsDataSet.body",
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
