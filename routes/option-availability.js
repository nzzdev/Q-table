const Boom = require('boom');
const Joi = require('joi');

module.exports = {
  method: 'POST',
  path:'/option-availability/{optionName}',
  options: {
    validate: {
      payload: Joi.object()
    },
    cors: true
  },
  handler: function(request, h) {
    if (request.params.optionName === 'cardLayoutIfSmall') {
      return {
        available: !request.payload.options.cardLayout
      };
    }
    return reply(Boom.badRequest());
  }
}
