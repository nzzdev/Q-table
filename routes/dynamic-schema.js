const Boom = require("@hapi/boom");
const Joi = require("@hapi/joi");
const dataHelpers = require("../helpers/data.js");
const heatmapHelpers = require("../helpers/heatmap.js");

function getMinibarEnum(item) {
  if (item.data.table.length < 1) {
    return [null];
  }

  return [null].concat(
    ...dataHelpers.getNumericColumns(item.data.table).map(col => col.index)
  );

}

function getMinibarEnumTitles(item) {
  if (item.data.table.length < 1) {
    return ["keine"];
  }

  return ["keine"].concat(
    ...dataHelpers.getNumericColumns(item.data.table).map(col => col.title)
  );
}

function getHeatmapEnum(item) {
  if (item.data.table.length < 1) {
    return [null];
  }

  return [null].concat(
    ...dataHelpers.getCategoricalColumns(item.data.table).map(col => col.index)
  );
}

function getHeatmapEnumTitles(item) {
  if (item.data.table.length < 1) {
    return ["keine"];
  }

  return ["keine"].concat(
    ...dataHelpers.getCategoricalColumns(item.data.table).map(col => col.title)
  );
}

function getScaleEnumWithTitles(numericalOptions) {
  let enumValues = ["sequential"];
  let enumTitles = ["Sequentiell"];

  let bucketNumber = 0;
  if (numericalOptions.bucketType === "custom") {
    if (numericalOptions.customBuckets) {
      const buckets = numericalOptions.customBuckets.split(",");
      bucketNumber = buckets.length - 1;
    }
  } else {
    bucketNumber = numericalOptions.numberBuckets;
  }

  // Add valid bucket borders to enum as diverging values
  for (let i = 1; i < bucketNumber; i++) {
    enumValues.push(`border-${i}`);
    enumTitles.push(`Divergierend ab Grenze ${i}`);
  }

  // Add valid buckets to enum as diverging values
  for (let i = 1; i < bucketNumber - 1; i++) {
    enumValues.push(`bucket-${i}`);
    enumTitles.push(`Divergierend ab Bucket ${i + 1}`);
  }

  return {
    enum: enumValues,
    "Q:options": {
      enum_titles: enumTitles,
    },
  };
}

function getColorSchemeEnumWithTitles(numericalOptions) {
  if (numericalOptions.scale === "sequential") {
    return {
      enum: ["one", "two", "three", "female", "male"],
      "Q:options": {
        enum_titles: [
          "Schema 1 (Standard)",
          "Schema 2 (Standard-Alternative)",
          "Schema 3 (negative Bedeutung)",
          "Schema weiblich",
          "Schema männlich",
        ],
      },
    };
  }
  return {
    enum: ["one", "two", "three", "gender"],
    "Q:options": {
      enum_titles: [
        "Schema 1 (Standard negativ/positiv)",
        "Schema 2 (neutral)",
        "Schema 3 (Alternative negativ/positiv)",
        "Schema weiblich/männlich",
      ],
    },
  };
}

function getMaxItemsNumerical(heatmap) {
  return {
    maxItems: heatmapHelpers.getNumberBuckets(heatmap),
  };
}

function getMaxItemsCategorical(data) {
  try {
    // removing the header row first
    data = dataHelpers.getDataWithoutHeaderRow(data);

    return {
      maxItems: dataHelpers.getUniqueCategoriesCount(data),
    };
  } catch {
    return {
      maxItems: undefined,
    };
  }
}

function getColorOverwriteEnumAndTitlesNumerical(heatmap) {
  try {
    let enumValues = [null];
    const numberItems = getNumberBuckets(heatmap.numericalOption);
    for (let index = 0; index < numberItems; index++) {
      enumValues.push(index + 1);
    }
    return {
      enum: enumValues,
      "Q:options": {
        enum_titles: enumValues.map((value) =>
          value === null ? "" : `${value}. Bucket `
        ),
      },
    };
  } catch {
    return {};
  }
}

function getColorOverwriteEnumAndTitlesCategorical(data, heatmap) {
  data = dataHelpers.getDataWithoutHeaderRow(data);
  let customCategoriesOrder = heatmap.categoricalOptions.customCategoriesOrder;
  let enumValues = [null];
  const categories = dataHelpers.getUniqueCategoriesObject(data, heatmap).categories;
  const numberItems = categories.length;
  for (let index = 0; index < numberItems; index++) {
    enumValues.push(index + 1);
  }
  return {
    enum: enumValues,
    "Q:options": {
      enum_titles: [""].concat(
        categories.map((category, index) => `${index + 1} - ${category}`)
      ),
    },
  };
}

function getCustomCategoriesOrderEnumAndTitlesCategorical(data) {
  try {
    data = dataHelpers.getDataWithoutHeaderRow(data);
    const categories = dataHelpers.getUniqueCategoriesObject(data).categories;

    return {
      enum: categories,
      "Q:options": {
        enum_titles: categories
      },
    };
  } catch (ex) {
    console.log(ex);
    return {};
  }
}

module.exports = {
  method: "POST",
  path: "/dynamic-schema/{optionName}",
  options: {
    validate: {
      payload: Joi.object()
    },
    cors: true
  },
  handler: function (request, h) {
    const item = request.payload.item;
    const optionName = request.params.optionName;
    if (optionName === "selectedColumnMinibar") {
      return {
        enum: getMinibarEnum(item),
        "Q:options": {
          enum_titles: getMinibarEnumTitles(item)
        }
      };
    }

    if (optionName === "selectedColumnHeatmap") {
      return {
        enum: getHeatmapEnum(item),
        "Q:options": {
          enum_titles: getHeatmapEnumTitles(item)
        }
      };
    }

    if (optionName === "scale") {
      return getScaleEnumWithTitles(item.options.heatmap.numericalOptions);
    }

    if (optionName === "colorScheme") {
      return getColorSchemeEnumWithTitles(item.options.heatmap.numericalOptions);
    }

    if (optionName === "colorOverwrites") {
      if (item.options.heatmap.heatmapType === "numerical") {
        return getMaxItemsNumerical(item.options.heatmap);
      } else {
        return getMaxItemsCategorical(item.data.table);
      }
    }

    if (optionName === "colorOverwritesItem") {
      if (item.options.heatmap.heatmapType === "numerical") {
        return getColorOverwriteEnumAndTitlesNumerical(
          item.options.heatmap
        );
      } else {
        return getColorOverwriteEnumAndTitlesCategorical(item.data.table, item.options.heatmap);
      }
    }

    if (optionName === "customCategoriesOrder") {
      return getMaxItemsCategorical(item.data);
    }

    if (optionName === "customCategoriesOrderItem") {
      return getCustomCategoriesOrderEnumAndTitlesCategorical(item.data.table);
    }

    return Boom.badRequest();
  }
};
