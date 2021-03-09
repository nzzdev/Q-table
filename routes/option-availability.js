const Boom = require("@hapi/boom");
const Joi = require("@hapi/joi");
const getNumericColumns = require("../helpers/data.js").getNumericColumns;
const getMinibarNumbersWithType = require("../helpers/minibars.js")
  .getMinibarNumbersWithType;

const hasCustomBuckets = require("../helpers/heatmap.js").hasCustomBuckets;

module.exports = {
  method: "POST",
  path: "/option-availability/{optionName}",
  options: {
    validate: {
      payload: Joi.object()
    },
    cors: true
  },
  handler: function (request, h) {
    const item = request.payload.item;
    const optionName = request.params.optionName;
    if (optionName === "cardLayoutIfSmall") {
      return {
        available: !item.options.cardLayout
      };
    }

    if (optionName === "showTableSearch") {
      return {
        available: (item.data.table.length > 16)
      };
    }

    if (
      optionName === "minibars" ||
      optionName === "selectedColumn"
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

    if (optionName === "barColor") {
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

    if (optionName === "barColorPositive") {
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

    if (optionName === "barColorNegative") {
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

    if (optionName === "invertColors") {
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

    if (
      optionName === "heatmap" ||
      optionName === "selectedColumn"
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

    if (optionName === "noValuesInCell" || optionName === "bucketType" || optionName === "customBuckets" || optionName === "numberBuckets" || optionName === "scale" || optionName === "colorOverwritesItem" || optionName === "colorScheme") {
      return item.options.heatmap !== null && item.options.heaetmap !== undefined;
    }

    if (optionName === "customBuckets") {
      let isAvailable = false;
      if (item.options.heatmap !== null && item.options.heaetmap !== undefined) {
        isAvailable = hasCustomBuckets(item.options.numericalOptions.bucketType);
      }
      return isAvailable;
    }

    if (optionName === "numberBuckets") {
      let isAvailable = false;
      if (item.options.heatmap !== null && item.options.heaetmap !== undefined) {
        isAvailable = !hasCustomBuckets(item.options.numericalOptions.bucketType);
      }
      return isAvailable;
    }

    if (optionName === "customColors") {
      let isAvailable = false;
      if (item.options.heatmap !== null && item.options.heaetmap !== undefined) {
        isAvailable = item.options.numericalOptions.scale === "sequential";
      }
      return isAvailable;
    }

    return Boom.badRequest();
  }
};
