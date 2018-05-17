const Boom = require("boom");
const Joi = require("joi");

module.exports = {
  method: "POST",
  path: "/option-availability/{optionName}",
  options: {
    validate: {
      payload: Joi.object()
    },
    cors: true
  },
  handler: function(request, h) {
    if (request.params.optionName === "cardLayoutIfSmall") {
      return {
        available: !request.payload.options.cardLayout
      };
    }

    if (request.params.optionName === "minibarOptions") {
      return {
        available:
          !request.payload.options.cardLayout &&
          request.payload.data[0].length >= 3
      };
    }
    return reply(Boom.badRequest());
  }
};
