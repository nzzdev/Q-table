const Boom = require("boom");
const Joi = require("joi");
const clone = require("clone");
const getNumericColumns = require("../helpers/data.js").getNumericColumns;

function getMiniBarEnum(item) {
  if (item.data.length < 1) {
    return [null];
  }

  let numericColumns = getNumericColumns(item.data).map(columnNames => {
    return item.data[0].indexOf(columnNames) - 1;
  });

  return [null].concat(...numericColumns);
}

function getMiniBarEnumTitles(item) {
  if (item.data.length < 1) {
    return ["keine"];
  }
  return ["keine"].concat(...getNumericColumns(item.data));
}

module.exports = {
  method: "POST",
  path: "/dynamic-enum/{optionName}",
  options: {
    validate: {
      payload: Joi.object()
    },
    cors: true
  },
  handler: function(request, h) {
    if (request.params.optionName === "minibarOptions") {
      return {
        enum: getMiniBarEnum(request.payload),
        enum_titles: getMiniBarEnumTitles(request.payload)
      };
    }
    return Boom.badRequest();
  }
};
