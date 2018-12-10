const Boom = require("boom");
const Joi = require("joi");
const getNumericColumns = require("../helpers/data.js").getNumericColumns;
const getMinibarNumbersWithType = require("../helpers/minibars.js")
  .getMinibarNumbersWithType;

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
        available: !request.payload.item.options.cardLayout
      };
    }

    if (
      request.params.optionName === "minibars" ||
      request.params.optionName === "selectedColumn"
    ) {
      let isAvailable = false;

      if (request.payload.item.data.table.length !== 0) {
        if (
          !request.payload.item.options.cardLayout &&
          request.payload.item.data.table[0].length >= 3 &&
          getNumericColumns(request.payload.item.data.table).length > 0
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
        request.payload.item.options.minibar !== null &&
        request.payload.item.options.minibar !== undefined
      ) {
        isAvailable =
          request.payload.item.options.minibar.selectedColumn !== null &&
          request.payload.item.options.minibar.selectedColumn !== undefined;
      }

      return {
        available: isAvailable
      };
    }

    if (request.params.optionName === "barColorPositive") {
      let isAvailable = false;
      if (
        request.payload.item.options.minibar != null &&
        request.payload.item.options.minibar != undefined
      ) {
        if (
          request.payload.item.options.minibar.selectedColumn !== null &&
          request.payload.item.options.minibar.selectedColumn !== undefined
        ) {
          let type = getMinibarNumbersWithType(
            request.payload.item.data.table,
            request.payload.item.options.minibar.selectedColumn
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
        request.payload.item.options.minibar != null &&
        request.payload.item.options.minibar != undefined
      ) {
        if (
          request.payload.item.options.minibar.selectedColumn !== null &&
          request.payload.item.options.minibar.selectedColumn !== undefined
        ) {
          let type = getMinibarNumbersWithType(
            request.payload.item.data.table,
            request.payload.item.options.minibar.selectedColumn
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
        request.payload.item.options.minibar != null &&
        request.payload.item.options.minibar != undefined
      ) {
        if (
          request.payload.item.options.minibar.selectedColumn !== null &&
          request.payload.item.options.minibar.selectedColumn !== undefined
        ) {
          let type = getMinibarNumbersWithType(
            request.payload.item.data.table,
            request.payload.item.options.minibar.selectedColumn
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
