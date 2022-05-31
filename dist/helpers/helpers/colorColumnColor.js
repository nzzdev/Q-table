const colorClassWithLightFontList = require("./colorClassLightFont");
const digitWords = [
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
    const colorScheme = colorOptions.colorScheme;
    const customColor = colorOptions.colorOverwrites.get(index);
    let colorClass = "";
    let textColor = "";
    if (scale === "sequential") {
        colorClass = `s-viz-color-sequential-${colorScheme}-${numberBuckets}-${numberBuckets - index}`;
        textColor = getTextColor(customColor, colorClass);
    }
    else {
        // if we have a diverging scale we deal with two cases:
        // a) diverging value = one of bucket border values,
        //    i.e. we do not have a bucket with a neutral color value
        // b) diverging value = one of the buckets,
        //    i.e. this bucket has a neutral color value
        // scale values could be e.g. border-1, border-2 or bucket-1, bucket-2
        const divergingSpecification = scale.split("-");
        const divergingIndex = parseInt(divergingSpecification[1]);
        // in order to know which diverging scale size we have to use,
        // we have to check which side is bigger first and then calculate
        // the size depending on the number of buckets of the bigger side
        const numberBucketsLeft = divergingIndex;
        let numberBucketsRight = numberBuckets - divergingIndex;
        if (divergingSpecification[0] === "bucket") {
            numberBucketsRight -= 1;
        }
        const numberBucketsBiggerSide = Math.max(numberBucketsLeft, numberBucketsRight);
        let scaleSize = numberBucketsBiggerSide * 2;
        if (divergingSpecification[0] === "bucket") {
            scaleSize += 1;
        }
        // if the left side is smaller we cannot start with scale position 1
        // instead we have to calculate the position depending on scale size
        // and number of buckets
        let scalePosition;
        if (numberBucketsLeft < numberBucketsRight) {
            scalePosition = scaleSize - numberBuckets + index + 1;
        }
        else {
            scalePosition = index + 1;
        }
        colorClass = `s-viz-color-diverging-${colorScheme}-${scaleSize}-${scalePosition}`;
        textColor = getTextColor(customColor, colorClass);
    }
    return {
        colorClass,
        customColor: customColor !== undefined && customColor.color !== undefined
            ? customColor.color
            : "",
        textColor,
    };
}
function getColor(value, legendData) {
    if (value === null || value === undefined) {
        return {
            colorClass: "",
            customColor: "#fff",
            textColor: "s-color-gray-6",
        };
    }
    if (legendData.type === "numerical") {
        const buckets = legendData.buckets;
        const bucket = buckets.find((bucket, index) => {
            if (index === 0) {
                return value <= bucket.to;
            }
            else if (index === buckets.length - 1) {
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
                textColor: bucket.color.textColor,
            };
        }
        else {
            return {
                colorClass: "s-color-gray-4",
                customColor: "",
                textColor: "s-color-gray-6",
            };
        }
    }
    else {
        const categories = legendData.categories;
        const category = categories.find((category) => category.label === value);
        if (category) {
            return {
                colorClass: category.color.colorClass,
                customColor: category.color.customColor,
                textColor: category.color.textColor,
            };
        }
        else {
            return {
                colorClass: "s-color-gray-4",
                customColor: "",
            };
        }
    }
}
function getCustomColorMap(colorOverwrites) {
    if (colorOverwrites === undefined) {
        colorOverwrites = [];
    }
    return new Map(colorOverwrites.map(({ position, color, textColor }) => [
        position - 1,
        { color, textColor },
    ]));
}
function getCategoryColor(index, customColorMap) {
    const customColor = customColorMap.get(index);
    const colorScheme = digitWords[index];
    const colorClass = `s-viz-color-${colorScheme}-5`;
    return {
        colorClass,
        customColor: customColor !== undefined && customColor.color !== undefined
            ? customColor.color
            : "",
        textColor: getTextColor(customColor, colorClass),
    };
}
module.exports = {
    digitWords,
    getBucketColor,
    getColor,
    getCategoryColor,
    getCustomColorMap,
};
