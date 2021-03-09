const Boom = require("@hapi/boom");
const Joi = require("@hapi/joi");
const getNumericColumns = require("../helpers/data.js").getNumericColumns;
const getNumberBuckets = require("../helpers/heatmap.js").getNumberBuckets;

function getOptionEnum(item, type) {
  if (item.data.table.length < 1) {
    return [null];
  }

  if (type === "minibar") {
    // todo: filter if heatmap is set 
    return [null].concat(
      ...getNumericColumns(item.data.table).map(col => col.index)
    );
  } else if (type === "heatmap") {
    // todo: filter if minibar is set 
    return [null].concat(
      ...getNumericColumns(item.data.table).map(col => col.index)
    );
  }
}

function getOptionEnumTitles(item, type) {
  if (item.data.table.length < 1) {
    return ["keine"];
  }

  if (type === "minibar") {
    // todo: filter if heatmap is set 
    return ["keine"].concat(
      ...getNumericColumns(item.data.table).map(col => col.title)
    );
  } else if (type === "heatmap") {
    // todo: filter if minibar is set 
    return ["keine"].concat(
      ...getNumericColumns(item.data.table).map(col => col.title)
    );
  }
}

function getScaleEnumWithTitles(numericalOptions) {
  let enumValues = ["sequential"];
  let enumTitles = ["Sequentiell"];

  // let bucketNumber = 0;
  // if (numericalOptions.bucketType === "custom") {
  //   if (numericalOptions.customBuckets) {
  //     const buckets = numericalOptions.customBuckets.split(",");
  //     bucketNumber = buckets.length - 1;
  //   }
  // } else {
  //   bucketNumber = numericalOptions.numberBuckets;
  // }

  // // Add valid bucket borders to enum as diverging values
  // for (let i = 1; i < bucketNumber; i++) {
  //   enumValues.push(`border-${i}`);
  //   enumTitles.push(`Divergierend ab Grenze ${i}`);
  // }

  // // Add valid buckets to enum as diverging values
  // for (let i = 1; i < bucketNumber - 1; i++) {
  //   enumValues.push(`bucket-${i}`);
  //   enumTitles.push(`Divergierend ab Bucket ${i + 1}`);
  // }

  // return {
  //   enum: [enumValues],
  //   "Q:options": {
  //     enum_titles: enumTitles,
  //   },
  // };
  return {
    enum: [],
    "Q:options": {
      enum_titles: [],
    },
  };
}

function getColorSchemeEnumWithTitles(scale) {
  if (scale === "sequential") {
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

function getColorOverwriteEnumAndTitles(numericalOptions) {
  try {
    let enumValues = [null];
    const numberItems = getNumberBuckets(numericalOptions);
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
        enum: getOptionEnum(item, "minibar"),
        "Q:options": {
          enum_titles: getOptionEnumTitles(item, "minibar")
        }
      };
    }

    if (optionName === "selectedColumnHeatmap") {
      return {
        enum: getOptionEnum(item, "heatmap"),
        "Q:options": {
          enum_titles: getOptionEnumTitles(item, "heatmap")
        }
      };
    }

    if (optionName === "scale") {
      return getScaleEnumWithTitles(item.options.numericalOptions);
    }

    if (optionName === "colorScheme") {
      return getColorSchemeEnumWithTitles(item.options.numericalOptions.scale);
    }

    if (optionName === "colorOverwritesItem") {
      return getColorOverwriteEnumAndTitles(
        item.options.numericalOptions
      );
    }

    return Boom.badRequest();
  }
};
