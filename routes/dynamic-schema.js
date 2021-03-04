const Boom = require("@hapi/boom");
const Joi = require("@hapi/joi");
const getNumericColumns = require("../helpers/data.js").getNumericColumns;

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
    if (request.params.optionName === "selectedColumnMinibar") {
      return {
        enum: getOptionEnum(item, "minibar"),
        "Q:options": {
          enum_titles: getOptionEnumTitles(item, "minibar")
        }
      };
    }

    if (request.params.optionName === "selectedColumnHeatmap") {
      return {
        enum: getOptionEnum(item, "heatmap"),
        "Q:options": {
          enum_titles: getOptionEnumTitles(item, "heatmap")
        }
      };
    }
    return Boom.badRequest();
  }
};
