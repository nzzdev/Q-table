const querystring = require("querystring");
const fs = require("fs");
const path = require("path");

const Joi = require("joi");
const Boom = require("boom");

const UglifyJS = require("uglify-js");

const resourcesDir = __dirname + "/../../resources/";
const helpersDir = __dirname + "/../../helpers/";
const viewsDir = __dirname + "/../../views/";
const scriptsDir = __dirname + "/../../scripts/";
const stylesDir = __dirname + "/../../styles/";

// setup nunjucks environment
const nunjucks = require("nunjucks");
const nunjucksEnv = new nunjucks.Environment();

const styleHashMap = require(`${stylesDir}/hashMap.json`);

const getExactPixelWidth = require(`${helpersDir}toolRuntimeConfig.js`)
  .getExactPixelWidth;
const dataHelpers = require(`${helpersDir}data.js`);

const renderingInfoScripts = require("../../helpers/renderingInfoScript.js");

// POSTed item will be validated against given schema
// hence we fetch the JSON schema...
const schemaString = JSON.parse(
  fs.readFileSync(resourcesDir + "schema.json", {
    encoding: "utf-8"
  })
);
const Ajv = require("ajv");
const ajv = new Ajv();

// add draft-04 support explicit
ajv.addMetaSchema(require("ajv/lib/refs/json-schema-draft-04.json"));

const validate = ajv.compile(schemaString);
function validateAgainstSchema(item, options) {
  if (validate(item)) {
    return item;
  } else {
    throw Boom.badRequest(JSON.stringify(validate.errors));
  }
}

function getPositiveColor(type) {
  let color;
  if (type === "mixed") {
    color = "s-viz-color-diverging-2-2";
  } else {
    color = "s-viz-color-one-5";
  }
  return color;
}

function getNegativeColor(type) {
  let color;
  if (type === "mixed") {
    color = "s-viz-color-diverging-2-1";
  } else {
    color = "s-viz-color-one-5";
  }
  return color;
}

async function validatePayload(payload, options, next) {
  if (typeof payload !== "object") {
    return next(Boom.badRequest(), payload);
  }
  if (typeof payload.item !== "object") {
    return next(Boom.badRequest(), payload);
  }
  if (typeof payload.toolRuntimeConfig !== "object") {
    return next(Boom.badRequest(), payload);
  }
  await validateAgainstSchema(payload.item, options);
}

module.exports = {
  method: "POST",
  path: "/rendering-info/web",
  options: {
    validate: {
      options: {
        allowUnknown: true
      },
      payload: validatePayload
    }
  },
  handler: async function(request, h) {
    const renderingInfo = {};

    renderingInfo.stylesheets = [
      {
        name: styleHashMap["q-table"]
      }
    ];

    const item = request.payload.item;
    const itemDataCopy = request.payload.item.data.table.slice(0); // get unformated copy of data for minibars
    const metaData = dataHelpers.prepareFootnoteMetaData(item.data.metaData);
    const footnoteColIndexes = dataHelpers.getIndexOfColsWithFootnotes(
      metaData
    );

    const context = {
      item: item,
      tableData: dataHelpers.getTableData(item.data.table, metaData),
      metaData: metaData,
      footnoteColIndexes: footnoteColIndexes,
      numberOfRows: item.data.length - 1, // do not count the header
      displayOptions: request.payload.toolRuntimeConfig.displayOptions || {},
      id: `q_table_${request.query._id}_${Math.floor(
        Math.random() * 100000
      )}`.replace(/-/g, ""),
      width: getExactPixelWidth(request.payload.toolRuntimeConfig)
    };

    // if we have a width and cardLayoutIfSmall is true, we will initWithCardLayout
    if (
      context.width &&
      context.width < 400 &&
      item.options.cardLayoutIfSmall
    ) {
      context.initWithCardLayout = true;
    } else if (item.options.cardLayout) {
      context.initWithCardLayout = true;
    }

    // calculate the number of rows to hide

    // if we init with card layout, we need to have minimum of 6 rows to hide all but 3 of them
    // this calculation here is not correct if we didn't get the width, as it doesn't take small/wide layout into account
    // but it's good enough to already apply display: none; in the markup to not use the complete height until the stylesheets/scripts are loaded
    if (context.initWithCardLayout && context.numberOfRows >= 6) {
      context.numberOfRowsToHide = context.numberOfRows - 3; // show 3 initially
    } else if (context.numberOfRows >= 15) {
      // if we init without cardLayout, we hide rows if we have more than 15
      context.numberOfRowsToHide = context.numberOfRows - 10; // show 10 initially
    }

    // if we have toolRuntimeConfig.noInteraction, we do not hide rows because showing them is not possible
    if (request.payload.toolRuntimeConfig.noInteraction) {
      context.numberOfRowsToHide = undefined;
    }

    // if minibars active
    if (item.options.minibar !== null && item.options.minibar !== undefined) {
      if (
        item.options.minibar.selectedColumn !== null &&
        item.options.minibar.selectedColumn !== undefined
      ) {
        context.minibar = dataHelpers.getDataForMinibars(
          itemDataCopy,
          item.options.minibar.selectedColumn
        );

        if (
          item.options.minibar.barColor.positive.className === "" &&
          item.options.minibar.barColor.positive.colorCode === ""
        ) {
          item.options.minibar.barColor.positive.className = getPositiveColor(
            context.minibar.type
          );
        } else if (item.options.minibar.barColor.positive.className !== "") {
          item.options.minibar.barColor.positive.colorCode = "";
        }

        if (
          item.options.minibar.barColor.negative.className === "" &&
          item.options.minibar.barColor.negative.colorCode === ""
        ) {
          item.options.minibar.barColor.negative.className = getNegativeColor(
            context.minibar.type
          );
        } else if (item.options.minibar.barColor.negative.className !== "") {
          item.options.minibar.barColor.negative.colorCode = "";
        }

        if (context.item.options.minibar.invertColors) {
          let color = context.item.options.minibar.barColor.negative;
          context.item.options.minibar.barColor.negative =
            context.item.options.minibar.barColor.positive;
          context.item.options.minibar.barColor.positive = color;
        }
      }
    }

    renderingInfo.markup = nunjucksEnv.render(
      path.join(viewsDir, "table.html"),
      context
    );

    // the scripts need to know if we are confident that the numberOfRowsToHide is correct
    // it's only valid if we had a fixed width given in toolRuntimeConfig, otherwise we reset it here to be calculated by the scripts again
    if (context.width === undefined) {
      context.numberOfRowsToHide = undefined;
    }

    let possibleToHaveToHideRows = false;

    // if we show cards, we hide if more or equal than 6
    if (item.options.cardLayout && context.numberOfRows >= 6) {
      possibleToHaveToHideRows = true;
    }
    // if we have cards for small, we hide if more or equal than 6
    if (
      item.options.cardLayoutIfSmall && // we have cardLayoutIfSmall
      (context.width === undefined || context.width < 400) && // width is unknown or below 400px
      context.numberOfRows >= 6 // more than 6 rows
    ) {
      possibleToHaveToHideRows = true;
    }
    // if we have more than 15 rows, we probably have to hide rows
    if (context.numberOfRows >= 15) {
      possibleToHaveToHideRows = true;
    }

    if (request.payload.toolRuntimeConfig.noInteraction) {
      possibleToHaveToHideRows = false;
    }

    renderingInfo.scripts = [];

    // if we are going to add any script, we want the default script first
    if (
      (item.options.cardLayout === false &&
        item.options.cardLayoutIfSmall === true) ||
      possibleToHaveToHideRows ||
      (item.options.minibar !== undefined &&
        item.options.minibar !== null &&
        item.options.minibar.selectedColumn !== null)
    ) {
      renderingInfo.scripts.push({
        content: renderingInfoScripts.getDefaultScript(context)
      });
    }

    // if we have cardLayoutIfSmall, we need to measure the width to set the class
    // not needed if we have cardLayout all the time
    if (
      item.options.cardLayout === false &&
      item.options.cardLayoutIfSmall === true
    ) {
      renderingInfo.scripts.push({
        content: renderingInfoScripts.getCardLayoutScript(context)
      });
    }

    if (possibleToHaveToHideRows) {
      renderingInfo.scripts.push({
        content: renderingInfoScripts.getShowMoreButtonScript(context)
      });
    }

    if (
      item.options.minibar !== undefined &&
      item.options.minibar !== null &&
      item.options.minibar.selectedColumn !== null
    ) {
      renderingInfo.scripts.push({
        content: renderingInfoScripts.getMinibarsScript(context)
      });
    }

    // minify the scripts
    for (let script of renderingInfo.scripts) {
      script.content = UglifyJS.minify(script.content).code;
    }

    return renderingInfo;
  }
};
