const Boom = require("@hapi/boom");
const Joi = require("@hapi/joi");
const dataHelpers = require("../helpers/data.js");
const colorColumnHelpers = require("../helpers/colorColumn.js");

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

function getColorColumnEnum(item) {
  if (item.data.table.length < 1) {
    return [null];
  }

  return [null].concat(
    ...dataHelpers.getCategoricalColumns(item.data.table).map(col => col.index)
  );
}

function getColorColumnEnumTitles(item) {
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

function getMaxItemsNumerical(colorColumn) {
  return {
    maxItems: colorColumnHelpers.getNumberBuckets(colorColumn),
  };
}

function getMaxItemsCategorical(data, colorColumn) {
  try {
    // removing the header row first
    data = dataHelpers.getDataWithoutHeaderRow(data);

    return {
      maxItems: dataHelpers.getUniqueCategoriesCount(data, colorColumn),
    };
  } catch {
    return {
      maxItems: undefined,
    };
  }
}

function getColorOverwriteEnumAndTitlesNumerical(colorColumn) {
  try {
    let enumValues = [null];
    const numberItems = colorColumnHelpers.getNumberBuckets(colorColumn);
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

function getColorOverwriteEnumAndTitlesCategorical(data, colorColumn) {
  data = dataHelpers.getDataWithoutHeaderRow(data);
  let customCategoriesOrder = colorColumn.categoricalOptions.customCategoriesOrder;
  let enumValues = [null];
  const categories = dataHelpers.getUniqueCategoriesObject(data, colorColumn).categories;
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

function getCustomCategoriesOrderEnumAndTitlesCategorical(data, colorColumn) {
  try {
    data = dataHelpers.getDataWithoutHeaderRow(data);
    const categories = dataHelpers.getUniqueCategoriesObject(data, colorColumn).categories;

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

    if (optionName === "selectedColorColumn") {
      return {
        enum: getColorColumnEnum(item),
        "Q:options": {
          enum_titles: getColorColumnEnumTitles(item)
        }
      };
    }

    if (optionName === "scale") {
      return getScaleEnumWithTitles(item.options.colorColumn.numericalOptions);
    }

    if (optionName === "colorScheme") {
      return getColorSchemeEnumWithTitles(item.options.colorColumn.numericalOptions);
    }

    if (optionName === "colorOverwrites") {
      if (item.options.colorColumn.colorColumnType === "numerical") {
        return getMaxItemsNumerical(item.options.colorColumn);
      } else {
        return getMaxItemsCategorical(item.data.table, item.options.colorColumn);
      }
    }

    if (optionName === "colorOverwritesItem") {
      if (item.options.colorColumn.colorColumnType === "numerical") {
        return getColorOverwriteEnumAndTitlesNumerical(
          item.options.colorColumn
        );
      } else {
        return getColorOverwriteEnumAndTitlesCategorical(item.data.table, item.options.colorColumn);
      }
    }

    if (optionName === "customCategoriesOrder") {
      return getMaxItemsCategorical(item.data, item.options.colorColumn);
    }

    if (optionName === "customCategoriesOrderItem") {
      return getCustomCategoriesOrderEnumAndTitlesCategorical(item.data.table, item.options.colorColumn);
    }

    return Boom.badRequest();
  }
};
