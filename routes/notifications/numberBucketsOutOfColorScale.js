const Joi = require("@hapi/joi");
const heatmapHelpers = require("../../helpers/heatmap.js");

const sequentialScaleMax = 7;
const divergingScaleMax = sequentialScaleMax * 2;

module.exports = {
    method: "POST",
    path: "/notification/numberBucketsOutOfColorScale",
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
            const heatmap = item.options.heatmap;

            const scale = item.options.scale;

            let numberBuckets = heatmapHelpers.getNumberBuckets(
                heatmap
            );

            if (scale === "sequential") {
                if (numberBuckets > sequentialScaleMax) {
                    return {
                        message: {
                            title: "notifications.numberBucketsOutOfColorScale.title",
                            body: "notifications.numberBucketsOutOfColorScale.body",
                        },
                    };
                }
            } else {
                const divergingSpecification = scale.split("-");
                const divergingIndex = parseInt(divergingSpecification[1]);

                const numberBucketsLeft = divergingIndex;
                let numberBucketsRight = numberBuckets - divergingIndex;

                if (divergingSpecification[0] === "bucket") {
                    numberBucketsRight -= 1;
                }

                const numberBucketsBiggerSide = Math.max(
                    numberBucketsLeft,
                    numberBucketsRight
                );

                let scaleSize = numberBucketsBiggerSide * 2;
                if (divergingSpecification[0] === "bucket") {
                    scaleSize += 1;
                }

                if (scaleSize > divergingScaleMax) {
                    return {
                        message: {
                            title: "notifications.numberBucketsOutOfColorScale.title",
                            body: "notifications.numberBucketsOutOfColorScale.body",
                        },
                    };
                }
            }
        } catch (err) {
            return null;
        }
    },
};
