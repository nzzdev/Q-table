const querystring = require('querystring');

const Joi = require('joi');
const Boom = require('boom');

const viewsDir = __dirname + '/../../views/';
const stylesDir  = __dirname + '/../../styles/';

// setup nunjucks environment
const nunjucks = require('nunjucks');
const nunjucksEnv = new nunjucks.Environment();

const styleHashMap = require(`${stylesDir}/hashMap.json`);

const getExactPixelWidth = require('../../helpers/toolRuntimeConfig.js').getExactPixelWidth;
const data = require('../../helpers/data.js');

// temp function until we have all chart types implemented with the new vega renderer
// determines if we go with the new or old renderer
function shouldUseLegacyRenderingInfo(request) {
  const item = request.payload.item;
  if (item.options.chartType === 'Line') {
    return false;
  }
  return true;
}

module.exports = {
  method: 'POST',
  path: '/rendering-info/web',
  options: {
    validate: {
      options: {
        allowUnknown: true
      },
      payload: {
        item: Joi.object(),
        toolRuntimeConfig: Joi.object()
      }
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
            window.addEventListener('resize', () => {
              requestAnimationFrame(() => {
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
    }

    return renderingInfo;
  }
}
