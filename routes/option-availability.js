const Boom = require("@hapi/boom");
const Joi = require("@hapi/joi");
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
    const item = request.payload.item;
    if (request.params.optionName === "cardLayoutIfSmall") {
      return {
        available: !item.options.cardLayout
      };
    }

    if (request.params.optionName === "showTableSearch") {
      return {
        available: (item.data.table.length > 16)
      };
    }

    if (
      request.params.optionName === "minibars" ||
      request.params.optionName === "selectedColumn"
    ) {
      let isAvailable = false;

      if (item.data.table.length !== 0) {
        if (
          !item.options.cardLayout &&
          item.data.table[0].length >= 3 &&
          getNumericColumns(item.data.table).length >= 1
        ) {
          isAvailable = true;
        }
      }
      return {
        available: isAvailable
      };
    }

    if (
      request.params.optionName === "heatmap" || 
      request.params.optionName === "selectedColumn"
    ) {
      let isAvailable = false;

      if (item.data.table.length !== 0) {
        if (
          !item.options.cardLayout &&
          item.data.table[0].length >= 3 &&
          getNumericColumns(item.data.table).length >= 1 
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
      if (item.options.minibar !== null && item.options.minibar !== undefined) {
        isAvailable =
          item.options.minibar.selectedColumn !== null &&
          item.options.minibar.selectedColumn !== undefined;
      }

      return {
        available: isAvailable
      };
    }

    if (request.params.optionName === "barColorPositive") {
      let isAvailable = false;
      if (item.options.minibar != null && item.options.minibar != undefined) {
        if (
          item.options.minibar.selectedColumn !== null &&
          item.options.minibar.selectedColumn !== undefined
        ) {
          let type = getMinibarNumbersWithType(
            item.data.table,
            item.options.minibar.selectedColumn
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
      if (item.options.minibar != null && item.options.minibar != undefined) {
        if (
          item.options.minibar.selectedColumn !== null &&
          item.options.minibar.selectedColumn !== undefined
        ) {
          let type = getMinibarNumbersWithType(
            item.data.table,
            item.options.minibar.selectedColumn
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
      if (item.options.minibar != null && item.options.minibar != undefined) {
        if (
          item.options.minibar.selectedColumn !== null &&
          item.options.minibar.selectedColumn !== undefined
        ) {
          let type = getMinibarNumbersWithType(
            item.data.table,
            item.options.minibar.selectedColumn
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
