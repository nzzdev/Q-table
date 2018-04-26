const Boom = require("boom");
const Joi = require("joi");

function getMiniBarEnum(item) {
  if (item.data.length < 1) {
    return [null];
  }
  // constructs an array like [null,0,1,2,3,...] with as many indexes as there are data columns
  return [null].concat([...item.data[0].slice(1).keys()]);
}

function getMiniBarEnumTitles(item) {
  if (item.data.length < 1) {
    return ["keine"];
  }
  return ["keine"].concat(item.data[0].slice(1));
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
