var colorClassWithLightFontList = require("./colorClassLightFont");
var digitWords = [
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
];
function getTextColor(customColor, colorClass) {
    if (customColor !== undefined && customColor.textColor !== undefined) {
        return customColor.textColor === "light"
            ? "s-color-gray-1"
            : "s-color-gray-9";
    }
    if (colorClassWithLightFontList.indexOf(colorClass) > -1) {
        return "s-color-gray-1";
    }
    return "s-color-gray-9";
}
function getBucketColor(numberBuckets, index, scale, colorOptions) {
    var colorScheme = colorOptions.colorScheme;
    var customColor = colorOptions.colorOverwrites.get(index);
    var colorClass = "";
    var textColor = "";
    if (scale === "sequential") {
        colorClass = "s-viz-color-sequential-".concat(colorScheme, "-").concat(numberBuckets, "-").concat(numberBuckets - index);
        textColor = getTextColor(customColor, colorClass);
    }
    else {
        // if we have a diverging scale we deal with two cases:
        // a) diverging value = one of bucket border values,
        //    i.e. we do not have a bucket with a neutral color value
        // b) diverging value = one of the buckets,
        //    i.e. this bucket has a neutral color value
        // scale values could be e.g. border-1, border-2 or bucket-1, bucket-2
        var divergingSpecification = scale.split("-");
        var divergingIndex = parseInt(divergingSpecification[1]);
        // in order to know which diverging scale size we have to use,
        // we have to check which side is bigger first and then calculate
        // the size depending on the number of buckets of the bigger side
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
        // if the left side is smaller we cannot start with scale position 1
        // instead we have to calculate the position depending on scale size
        // and number of buckets
        var scalePosition = void 0;
        if (numberBucketsLeft < numberBucketsRight) {
            scalePosition = scaleSize - numberBuckets + index + 1;
        }
        else {
            scalePosition = index + 1;
        }
        colorClass = "s-viz-color-diverging-".concat(colorScheme, "-").concat(scaleSize, "-").concat(scalePosition);
        textColor = getTextColor(customColor, colorClass);
    }
    return {
        colorClass: colorClass,
        customColor: customColor !== undefined && customColor.color !== undefined
            ? customColor.color
            : "",
        textColor: textColor
    };
}
function getColor(value, legendData) {
    if (value === null || value === undefined) {
        return {
            colorClass: "",
            customColor: "#fff",
            textColor: "s-color-gray-6"
        };
    }
    if (legendData.type === "numerical") {
        var buckets_1 = legendData.buckets;
        var bucket = buckets_1.find(function (bucket, index) {
            if (index === 0) {
                return value <= bucket.to;
            }
            else if (index === buckets_1.length - 1) {
                return bucket.from < value;
            }
            else {
                return bucket.from < value && value <= bucket.to;
            }
        });
        if (bucket) {
            return {
                colorClass: bucket.color.colorClass,
                customColor: bucket.color.customColor,
                textColor: bucket.color.textColor
            };
        }
        else {
            return {
                colorClass: "s-color-gray-4",
                customColor: "",
                textColor: "s-color-gray-6"
            };
        }
    }
    else {
        var categories = legendData.categories;
        var category = categories.find(function (category) { return category.label === value; });
        if (category) {
            return {
                colorClass: category.color.colorClass,
                customColor: category.color.customColor,
                textColor: category.color.textColor
            };
        }
        else {
            return {
                colorClass: "s-color-gray-4",
                customColor: ""
            };
        }
    }
}
function getCustomColorMap(colorOverwrites) {
    if (colorOverwrites === undefined) {
        colorOverwrites = [];
    }
    return new Map(colorOverwrites.map(function (_a) {
        var position = _a.position, color = _a.color, textColor = _a.textColor;
        return [
            position - 1,
            { color: color, textColor: textColor },
        ];
    }));
}
function getCategoryColor(index, customColorMap) {
    var customColor = customColorMap.get(index);
    var colorScheme = digitWords[index];
    var colorClass = "s-viz-color-".concat(colorScheme, "-5");
    return {
        colorClass: colorClass,
        customColor: customColor !== undefined && customColor.color !== undefined
            ? customColor.color
            : "",
        textColor: getTextColor(customColor, colorClass)
    };
}
module.exports = {
    digitWords: digitWords,
    getBucketColor: getBucketColor,
    getColor: getColor,
    getCategoryColor: getCategoryColor,
    getCustomColorMap: getCustomColorMap
};
