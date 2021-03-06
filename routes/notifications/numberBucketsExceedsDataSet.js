const Joi = require("@hapi/joi");
const dataHelpers = require("../../helpers/data.js");

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
            item.data.table = dataHelpers.getDataWithoutHeaderRow(item.data.table);

            if (
                item.options.bucketType !== "custom"
            ) {
                const numberUniqueValues = dataHelpers.getUniqueCategoriesCount(
                    item.data.table, item.options.colorColumn
                );
                const numberBuckets = item.options.colorColumn.numericalOptions.numberBuckets;

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
