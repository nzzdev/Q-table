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

function getBucketTextColor(customColor, colorClassData) {
  if (customColor !== undefined && customColor.textColor !== undefined) {
    return customColor.textColor === "light"
      ? "s-color-gray-1"
      : "s-color-gray-9";
  } else {
    if (colorClassData.scale === "sequential") {
      if (["three"].includes(colorClassData.colorScheme)) {
        return colorClassData.scalePosition === 1
          ? "s-color-gray-1"
          : "s-color-gray-9";
      }
      if (["one", "female"].includes(colorClassData.colorScheme)) {
        if (colorClassData.scaleSize < 5) {
          return colorClassData.scalePosition === 1
            ? "s-color-gray-1"
            : "s-color-gray-9";
        } else {
          return colorClassData.scalePosition < 3
            ? "s-color-gray-1"
            : "s-color-gray-9";
        }
      }
    } else {
      if (["one", "gender"].includes(colorClassData.colorScheme)) {
        if (colorClassData.scaleSize < 8) {
          return colorClassData.scalePosition === colorClassData.scaleSize
            ? "s-color-gray-1"
            : "s-color-gray-9";
        } else {
          return colorClassData.scalePosition >= colorClassData.scaleSize - 1
            ? "s-color-gray-1"
            : "s-color-gray-9";
        }
      }
      if (["two"].includes(colorClassData.colorScheme)) {
        if (colorClassData.scaleSize < 9) {
          return colorClassData.scalePosition === 1
            ? "s-color-gray-1"
            : "s-color-gray-9";
        } else {
          return colorClassData.scalePosition < 3
            ? "s-color-gray-1"
            : "s-color-gray-9";
        }
      }
    }
    return "s-color-gray-9";
  }
}

function getCategoryTextColor(colorScheme, customColor) {
  if (customColor !== undefined && customColor.textColor !== undefined) {
    return customColor.textColor === "light"
      ? "s-color-gray-1"
      : "s-color-gray-9";
  } else {
    if (["one", "five", "seven", "nine", "eleven"].includes(colorScheme)) {
      return "s-color-gray-1";
    }
  }
  return "s-color-gray-9";
}

function getBucketColor(numberBuckets, index, scale, colorOptions) {
  const colorScheme = colorOptions.colorScheme;
  const customColor = colorOptions.colorOverwrites.get(index);
  let colorClass = "";
  let textColor = "";

  if (scale === "sequential") {
    colorClass = `s-viz-color-sequential-${colorScheme}-${numberBuckets}-${
      numberBuckets - index
    }`;

    textColor = getBucketTextColor(customColor, {
      scale,
      colorScheme,
      scaleSize: numberBuckets,
      scalePosition: numberBuckets - index,
    });
  } else {
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

    const numberBucketsBiggerSide = Math.max(
      numberBucketsLeft,
      numberBucketsRight
    );

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
    } else {
      scalePosition = index + 1;
    }

    colorClass = `s-viz-color-diverging-${colorScheme}-${scaleSize}-${scalePosition}`;

    textColor = getBucketTextColor(customColor, {
      scale,
      colorScheme,
      scaleSize,
      scalePosition,
    });
  }
  return {
    colorClass,
    customColor:
      customColor !== undefined && customColor.color !== undefined
        ? customColor.color
        : "",
    textColor,
  };
}

function getCategoryColor(index, customColorMap) {
  const customColor = customColorMap.get(index);
  const colorScheme = digitWords[index];
  const colorClass = `s-viz-color-${colorScheme}-5`;
  return {
    colorClass,
    customColor:
      customColor !== undefined && customColor.color !== undefined
        ? customColor.color
        : "",
    textColor: getCategoryTextColor(colorScheme, customColor),
  };
}

module.exports = {
  digitWords,
  getBucketColor,
  getCategoryColor,
};
