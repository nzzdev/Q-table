const rootDir = __dirname + "/../../../";
const distDir = rootDir + 'dist/';
const helpersDir = distDir + "helpers";

const Joi = require("joi");
const dataHelpers = require(`${helpersDir}/data.js`);

const numberMainColors = require(`${helpersDir}/colorColumnColor.js`).digitWords.length;

module.exports = {
  method: "POST",
  path: "/notification/numberCategoriesOutOfColorScale",
  options: {
    validate: {
      options: {
        allowUnknown: true,
      },
      payload: Joi.object().required(),
    },
    tags: ["api"],
  },
  handler: function (request, h) {
    try {
      const item = request.payload.item;
      if (item.options.colorColumn.colorColumnType === "categorical") {
        // removing the header row first
        item.data = dataHelpers.getDataWithoutHeaderRow(item.data);
        const numberUniqueValues = dataHelpers.getUniqueCategoriesCount(
          item.data.table, item.options.colorColumn
        );

        if (numberCategories > numberMainColors) {
          return {
            message: {
              title: "notifications.numberCategoriesOutOfColorScale.title",
              body: "notifications.numberCategoriesOutOfColorScale.body",
            },
          };
        }
      }
      return null;
    } catch (err) {
      return null;
    }
  },
};
