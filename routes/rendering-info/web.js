const querystring = require('querystring');
const fs = require('fs');

const Joi = require('joi');
const Boom = require('boom');

const UglifyJS = require("uglify-js");

const resourcesDir = __dirname + '/../../resources/';
const helpersDir = __dirname + '/../../helpers/';
const viewsDir = __dirname + '/../../views/';
const scriptsDir  = __dirname + '/../../scripts/';
const stylesDir  = __dirname + '/../../styles/';

// setup nunjucks environment
const nunjucks = require('nunjucks');
const nunjucksEnv = new nunjucks.Environment();

const styleHashMap = require(`${stylesDir}/hashMap.json`);

const getExactPixelWidth = require(`${helpersDir}toolRuntimeConfig.js`).getExactPixelWidth;
const data = require(`${helpersDir}data.js`);


// POSTed item will be validated against given schema
// hence we fetch the JSON schema...
const schemaString = JSON.parse(fs.readFileSync(resourcesDir + 'schema.json', {
  encoding: 'utf-8'
}));
const Ajv = require('ajv');
const ajv = new Ajv();

// add draft-04 support explicit
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

const validate = ajv.compile(schemaString);
function validateAgainstSchema(item, options) {
  if (validate(item)) {
    return item;
  } else {
    throw Boom.badRequest(JSON.stringify(validate.errors));
  }
}

async function validatePayload(payload, options, next) {
  if (typeof payload !== 'object') {
    return next(Boom.badRequest(), payload);
  }
  if (typeof payload.item !== 'object') {
    return next(Boom.badRequest(), payload);
  }
  if (typeof payload.toolRuntimeConfig !== 'object') {
    return next(Boom.badRequest(), payload);
  }
  await validateAgainstSchema(payload.item, options);
}

module.exports = {
  method: 'POST',
  path: '/rendering-info/web',
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

    renderingInfo.stylesheets = [{
      name: styleHashMap['q-table']
    }];

    const item = request.payload.item;
    item.data = data.getDataForTemplate(item.data);

    const context = {
      item: item,
      displayOptions: request.payload.toolRuntimeConfig.displayOptions || {},
      id: `q_table_${request.query._id}_${Math.floor(Math.random() * 100000)}`.replace(/-/g, ''),
      initWithCardLayout: item.options.cardLayout === true
    };

    renderingInfo.markup = nunjucksEnv.render(viewsDir + 'table.html', context);

    // if we have cardLayoutIfSmall, we need to measure the width to set the class
    // not needed if we have cardLayout all the time
    if (item.options.cardLayout === false && item.options.cardLayoutIfSmall === true) {
      const functionName = `applyCardLayoutClass${context.id}`;
      const dataObject = `${context.id}Data`;

      renderingInfo.scripts = [
        {
          content: `
            var ${dataObject} = {
              element: document.querySelector("#${context.id}")
            };
            ${dataObject}.width = ${dataObject}.element.getBoundingClientRect().width;
            function ${functionName}() {
              if (${dataObject}.width > 400) {
                ${dataObject}.element.classList.remove('q-table--card-layout');
              } else {
                ${dataObject}.element.classList.add('q-table--card-layout');
              }
            }
            ${functionName}();
            window.addEventListener('resize', function() {
              requestAnimationFrame(function() {
                var newWidth = ${dataObject}.element.getBoundingClientRect().width;
                if (newWidth !== ${dataObject}.width) {
                  ${dataObject}.width = newWidth;
                  ${functionName}();
                }
              });
            });
          `
        }
      ]

      // minify the script
      for (let script of renderingInfo.scripts) {
        script.content = UglifyJS.minify(script.content).code;
      }
    }

    return renderingInfo;
  }
}
