const Boom = require("boom");
const Joi = require("joi");
const getNumericColumns = require("../helpers/data.js").getNumericColumns;
const calculateMinibarType = require("../helpers/data.js").getMinibarType;

function getMinibarType(data, selectedColumnIndex) {
  let typeAmount = {
    positives: 0,
    negatives: 0
  };

  data[0].map(value => (value = "")); // first row is always header so ignore it
  data.map((row, index) => {
    let value = row[selectedColumnIndex + 1];
    value !== null
      ? (value = value.replace(/\s/g, "").replace(",", "."))
      : value;

    if (value < 0) {
      typeAmount.negatives++;
    } else {
      typeAmount.positives++;
    }
  });
  return calculateMinibarType(typeAmount);
}

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
          request.payload.data[0].length >= 3 &&
          getNumericColumns(request.payload.data).length > 0
      };
    }

    if (request.params.optionName === "colorOverwritePositive") {
      let isAvailable = false;

      if (
        request.payload.options.minibarOptions !== null &&
        request.payload.options.minibarOptions !== undefined
      ) {
        let type = getMinibarType(
          request.payload.data,
          request.payload.options.minibarOptions
        );

        isAvailable = type === "mixed" || type === "positive";
      }
      return {
        available: isAvailable
      };
    }

    if (request.params.optionName === "colorOverwriteNegative") {
      let isAvailable = false;

      if (
        request.payload.options.minibarOptions !== null &&
        request.payload.options.minibarOptions !== undefined
      ) {
        let type = getMinibarType(
          request.payload.data,
          request.payload.options.minibarOptions
        );

        isAvailable = type === "mixed" || type === "negative";
      }
      return {
        available: isAvailable
      };
    }

    if (request.params.optionName === "invertColors") {
      let isAvailable = false;
      if (
        request.payload.options.minibarOptions !== null &&
        request.payload.options.minibarOptions !== undefined
      ) {
        let type = getMinibarType(
          request.payload.data,
          request.payload.options.minibarOptions
        );

        isAvailable = type === "mixed";
      }
      return {
        available: isAvailable
      };
    }

    return Boom.badRequest();
  }
};
