const Boom = require("boom");
const Joi = require("joi");
const getNumericColumns = require("../helpers/data.js").getNumericColumns;
const prepareSelectedColumn = require("../helpers/data.js")
  .prepareSelectedColumn;

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

    if (
      request.params.optionName === "minibars" ||
      request.params.optionName === "selectedColumn"
    ) {
      let isAvailable = false;

      if (request.payload.data.table.length !== 0) {
        if (
          !request.payload.options.cardLayout &&
          request.payload.data.table[0].length >= 3 &&
          getNumericColumns(request.payload.data.table).length > 0
        ) {
          isAvailable = true;
        }
      }
      return {
        available: isAvailable
      };
    }

    if (request.params.optionName === "barColor") {
      let isAvailable = false;
      if (
        request.payload.options.minibar !== null &&
        request.payload.options.minibar !== undefined
      ) {
        isAvailable =
          request.payload.options.minibar.selectedColumn !== null &&
          request.payload.options.minibar.selectedColumn !== undefined;
      }

      return {
        available: isAvailable
      };
    }

    if (request.params.optionName === "barColorPositive") {
      let isAvailable = false;
      if (
        request.payload.options.minibar != null &&
        request.payload.options.minibar != undefined
      ) {
        if (
          request.payload.options.minibar.selectedColumn !== null &&
          request.payload.options.minibar.selectedColumn !== undefined
        ) {
          let type = prepareSelectedColumn(
            request.payload.data.table,
            request.payload.options.minibar.selectedColumn
          ).type;

          isAvailable = type === "mixed" || type === "positive";
        }
      }
      return {
        available: isAvailable
      };
    }

    if (request.params.optionName === "barColorNegative") {
      let isAvailable = false;
      if (
        request.payload.options.minibar != null &&
        request.payload.options.minibar != undefined
      ) {
        if (
          request.payload.options.minibar.selectedColumn !== null &&
          request.payload.options.minibar.selectedColumn !== undefined
        ) {
          let type = prepareSelectedColumn(
            request.payload.data.table,
            request.payload.options.minibar.selectedColumn
          ).type;

          isAvailable = type === "mixed" || type === "negative";
        }
      }
      return {
        available: isAvailable
      };
    }

    if (request.params.optionName === "invertColors") {
      let isAvailable = false;
      if (
        request.payload.options.minibar != null &&
        request.payload.options.minibar != undefined
      ) {
        if (
          request.payload.options.minibar.selectedColumn !== null &&
          request.payload.options.minibar.selectedColumn !== undefined
        ) {
          let type = prepareSelectedColumn(
            request.payload.data.table,
            request.payload.options.minibar.selectedColumn
          ).type;

          isAvailable = type === "mixed";
        }
      }
      return {
        available: isAvailable
      };
    }

    return Boom.badRequest();
  }
};
