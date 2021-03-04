const Boom = require("@hapi/boom");
const Joi = require("@hapi/joi");
const getNumericColumns = require("../helpers/data.js").getNumericColumns;

function getMiniBarEnum(item) {
  if (item.data.table.length < 1) {
    return [null];
  }

  return [null].concat(
    ...getNumericColumns(item.data.table).map(col => col.index)
  );
}

function getMiniBarEnumTitles(item) {
  if (item.data.table.length < 1) {
    return ["keine"];
  }
  return ["keine"].concat(
    ...getNumericColumns(item.data.table).map(col => col.title)
  );
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
  handler: function(request, h) {
    const item = request.payload.item;
    if (request.params.optionName === "selectedColumnMinibar") {
      return {
        enum: getMiniBarEnum(item),
        "Q:options": {
          enum_titles: getMiniBarEnumTitles(item)
        }
      };
    }

    if (request.params.optionName === "selectedColumnHeatmap") {
      return {
        enum: getMiniBarEnum(item),
        "Q:options": {
          enum_titles: getMiniBarEnumTitles(item)
        }
      };
    }
    return Boom.badRequest();
  }
};
