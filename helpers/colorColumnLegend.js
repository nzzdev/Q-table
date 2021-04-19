const dataHelpers = require("./data.js");
const colorHelpers = require("./colorColumnColor.js");
const simpleStatistics = require("simple-statistics");

const ckmeans = simpleStatistics.ckmeans;
const quantile = simpleStatistics.quantile;

function getBucketsForLegend(
  filteredValues,
  colorColumn,
  minValue,
  maxValue,
  customColorMap
) {
  const bucketType = colorColumn.numericalOptions.bucketType;
  const numberBuckets = colorColumn.numericalOptions.numberBuckets;
  const scale = colorColumn.numericalOptions.scale;
  const colorOptions = {
    colorScheme: colorColumn.numericalOptions.colorScheme,
    colorOverwrites: customColorMap,
  };

  if (bucketType === "ckmeans") {
    return getCkMeansBuckets(
      filteredValues,
      numberBuckets,
      scale,
      colorOptions
    );
  } else if (bucketType === "quantile") {
    return getQuantileBuckets(
      filteredValues,
      numberBuckets,
      minValue,
      scale,
      colorOptions
    );
  } else if (bucketType === "equal") {
    return getEqualBuckets(
      numberBuckets,
      minValue,
      maxValue,
      scale,
      colorOptions
    );
  } else if (bucketType === "custom") {
    return getCustomBuckets(colorColumn, scale, colorOptions);
  }
  return [];
}

function getCkMeansBuckets(filteredValues, numberBuckets, scale, colorOptions) {
  const ckmeansBuckets = ckmeans(filteredValues, numberBuckets);

  return ckmeansBuckets.map((bucket, index) => {
    const from =
      index === 0
        ? Math.min(...bucket)
        : Math.max(...ckmeansBuckets[index - 1]);
    const to = Math.max(...bucket);
    return {
      from,
      to,
      color: colorHelpers.getBucketColor(
        numberBuckets,
        index,
        scale,
        colorOptions
      ),
    };
  });
}

function getQuantileBuckets(
  filteredValues,
  numberBuckets,
  minValue,
  scale,
  colorOptions
) {
  const quantilePortion = 1 / numberBuckets;
  let quantiles = [];
  for (let i = 1; i <= numberBuckets; i++) {
    quantiles.push(i * quantilePortion);
  }
  const quantileUpperBorders = quantile(filteredValues, quantiles);
  return quantileUpperBorders.map((quantileBorder, index) => {
    const from = index === 0 ? minValue : quantileUpperBorders[index - 1];
    return {
      from,
      to: quantileBorder,
      color: colorHelpers.getBucketColor(
        numberBuckets,
        index,
        scale,
        colorOptions
      ),
    };
  });
}

function getEqualBuckets(
  numberBuckets,
  minValue,
  maxValue,
  scale,
  colorOptions
) {
  const portion = 1 / numberBuckets;
  const range = maxValue - minValue;
  let equalBuckets = [];
  for (let i = 0; i < numberBuckets; i++) {
    let from = i === 0 ? minValue : minValue + range * portion * i;
    let to = minValue + range * portion * (i + 1);
    equalBuckets.push({
      from,
      to,
      color: colorHelpers.getBucketColor(numberBuckets, i, scale, colorOptions),
    });
  }
  return equalBuckets;
}

function getCustomBuckets(colorColumn, scale, colorOptions) {
  if (colorColumn.numericalOptions.customBuckets !== undefined) {
    const customBorderValues = getCustomBucketBorders(
      colorColumn.numericalOptions.customBuckets
    );

    const numberBuckets = customBorderValues.length - 1;

    const minBorder = customBorderValues.shift();
    let customBuckets = [];
    customBorderValues.forEach((borderValue, index) => {
      customBuckets.push({
        from: index === 0 ? minBorder : customBorderValues[index - 1],
        to: borderValue,
        color: colorHelpers.getBucketColor(
          numberBuckets,
          index,
          scale,
          colorOptions
        ),
      });
    });
    return customBuckets;
  }
}

function getCustomBucketBorders(customBuckets) {
  const customBorderStrings = customBuckets.split(",");
  return customBorderStrings.map((borderValue) => {
    return parseFloat(borderValue.trim());
  });
}

function hasSingleValueBucket(legendData) {
  const firstBucket = legendData.buckets[0];
  return firstBucket.from === firstBucket.to;
}

function getNumericalLegend(data, colorColumn) {
  const customColorMap = colorHelpers.getCustomColorMap(colorColumn.numericalOptions.colorOverwrites);
  const values = dataHelpers.getNumericalValuesByColumn(data, colorColumn.selectedColumn);
  const nonNullValues = dataHelpers.getNonNullValues(values);
  const metaData = dataHelpers.getMetaData(
    values,
    nonNullValues
  );

  const legendData = {
    type: "numerical",
    ...metaData,
  };

  legendData.buckets = getBucketsForLegend(
    nonNullValues,
    colorColumn,
    legendData.minValue,
    legendData.maxValue,
    customColorMap
  );

  legendData.hasSingleValueBucket = hasSingleValueBucket(legendData);

  // for all bucket types we calculate the resulting buckets out of given data set
  // custom bucketing need a special handling of min/max values because the first and the last
  // custom bucket value could be lower/higher than min/max
  if (colorColumn.numericalOptions.bucketType === "custom") {
    // if first custom bucket value is less than min value in given data set
    // we set min value of legend to starting value of custom buckets
    const minBucketValue = legendData.buckets[0].from;
    if (legendData.minValue > minBucketValue) {
      legendData.minValue = minBucketValue;
    }
    // if last custom bucket value is higher that max value in given data set
    // we set max value of legend to last custom bucket value
    const maxBucketValue = legendData.buckets[legendData.buckets.length - 1].to;
    if (legendData.maxValue < maxBucketValue) {
      legendData.maxValue = maxBucketValue;
    }
  }
  return legendData;
}

function getCategoricalLegend(data, colorColumn) {
  const legendData = {
    type: "categorical",
  };

  const customColorMap = colorHelpers.getCustomColorMap(colorColumn.categoricalOptions.colorOverwrites);
  const categoryObject = dataHelpers.getUniqueCategoriesObject(data, colorColumn);

  let categories = [];
  categoryObject.categories.forEach((label, index) => {
    categories.push({
      label,
      color: colorHelpers.getCategoryColor(index, customColorMap),
    });
  });

  legendData.hasNullValues = categoryObject.hasNullValues;
  legendData.categories = categories;

  return legendData;
}



module.exports = {
  getNumericalLegend,
  getCategoricalLegend,
};
