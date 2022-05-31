var rootDir = __dirname + '/../../../';
var distDir = rootDir + 'dist/';
var helpersDir = distDir + "helpers";
var Joi = require("joi");
var colorColumnHelpers = require("".concat(helpersDir, "/colorColumn.js"));
var sequentialScaleMax = 7;
var divergingScaleMax = sequentialScaleMax * 2;
module.exports = {
    method: "POST",
    path: "/notification/numberBucketsOutOfColorScale",
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
            if (item.options.colorColumn.colorColumnType === "numerical") {
                var scale = item.options.colorColumn.numericalOptions.scale;
                var numberBuckets = colorColumnHelpers.getNumberBuckets(item.options.colorColumn);
                if (scale === "sequential") {
                    if (numberBuckets > sequentialScaleMax) {
                        return {
                            message: {
                                title: "notifications.numberBucketsOutOfColorScale.title",
                                body: "notifications.numberBucketsOutOfColorScale.body"
                            }
                        };
                    }
                }
                else {
                    var divergingSpecification = scale.split("-");
                    var divergingIndex = parseInt(divergingSpecification[1]);
                    var numberBucketsLeft = divergingIndex;
                    var numberBucketsRight = numberBuckets - divergingIndex;
                    if (divergingSpecification[0] === "bucket") {
                        numberBucketsRight -= 1;
                    }
                    var numberBucketsBiggerSide = Math.max(numberBucketsLeft, numberBucketsRight);
                    var scaleSize = numberBucketsBiggerSide * 2;
                    if (divergingSpecification[0] === "bucket") {
                        scaleSize += 1;
                    }
                    if (scaleSize > divergingScaleMax) {
                        return {
                            message: {
                                title: "notifications.numberBucketsOutOfColorScale.title",
                                body: "notifications.numberBucketsOutOfColorScale.body"
                            }
                        };
                    }
                }
            }
            return null;
        }
        catch (err) {
            return null;
        }
    }
};
