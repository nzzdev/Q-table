const Joi = require("@hapi/joi");
const heatmapHelpers = require("../../helpers/heatmap.js");

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
            item.data.table = heatmapHelpers.getDataWithoutHeaderRow(item.data.table);

            if (
                item.options.bucketType !== "custom"
            ) {
                const numberUniqueValues = heatmapHelpers.getUniqueCategoriesCount(
                    item.data.table
                );
                const numberBuckets = item.options.numberBuckets;

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
