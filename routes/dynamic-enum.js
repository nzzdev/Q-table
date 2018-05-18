const Boom = require("boom");
const Joi = require("joi");
const clone = require("clone");
const isColumnNumeric = require("../helpers/data.js").isColumnNumeric;

function getNumericColumns(data) {
  let numericColumns = [];
  for (var i = 0; i <= data[0].slice(1).length; i++) {
    if (isColumnNumeric(data, i + 1)) {
      numericColumns.push(data[0].slice(1)[i]);
    }
  }
  return numericColumns;
}
function getMiniBarEnum(item) {
  if (item.data.length < 1) {
    return [null];
  }
  return [null].concat(...getNumericColumns(item.data).keys());
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
