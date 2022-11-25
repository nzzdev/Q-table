/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { QTableSvelteProperties } from '../interfaces';

export function getCardLayoutScript(context: QTableSvelteProperties): string {
  const applyCardLayoutClassFunctionName = `applyCardLayoutClass${context.id}`;
  const dataObject = `window.${context.id}Data`;
  const minibar = context.minibar;
  let renderMinibarsFunction = '';

  if (minibar !== null) {
    renderMinibarsFunction = `renderMinibars${context.id}()`;
  }

  let renderColorColumnNumericalLegendFunction = '';
  if (context.colorColumn && context.colorColumn.colorColumnType === 'numerical') {
    renderColorColumnNumericalLegendFunction = `renderColorColumnNumericalLegend${context.id}(${dataObject}.width)`;
  }

  return `
    ${dataObject}.footerElement = ${dataObject}.element.querySelector(".s-q-item__footer");
    ${dataObject}.isCardLayout = ${dataObject}.isCardLayout || undefined;

    function ${applyCardLayoutClassFunctionName}() {
      if (${dataObject}.width > 400 && !${context.item.options.cardLayout}) {
        ${dataObject}.isCardLayout = false;
        ${dataObject}.element.classList.remove('q-table--card-layout');
      } else if (${context.item.options.cardLayoutIfSmall}) {
        ${dataObject}.isCardLayout = true;
        ${dataObject}.element.classList.add('q-table--card-layout');
      }
    }
    window.q_domready.then(function() {
      ${dataObject}.width = ${dataObject}.element.getBoundingClientRect().width;

      ${applyCardLayoutClassFunctionName}();
    });
    function ${context.id}debounce(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this, args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    };
    window.addEventListener('resize', ${context.id}debounce(function() {
      requestAnimationFrame(function() {
        var newWidth = ${dataObject}.element.getBoundingClientRect().width;
        if (newWidth !== ${dataObject}.width) {
          ${dataObject}.width = newWidth;
          ${applyCardLayoutClassFunctionName}();
          ${renderMinibarsFunction};
          ${renderColorColumnNumericalLegendFunction};
        }
      });
    }, 250));
  `;
}

export function getColorColumnScript(context: QTableSvelteProperties): string {
  const dataObject = `window.${context.id}Data`;
  const setupMethodBoxFunctionName = `setupMethodBox${context.id}`;
  const renderColorColumnNumericalLegendFunctionName = `renderColorColumnNumericalLegend${context.id}`;

  let renderColorColumnNumericalLegendFunction = '';
  if (context.colorColumn && context.colorColumn.colorColumnType === 'numerical') {
    renderColorColumnNumericalLegendFunction = `renderColorColumnNumericalLegend${context.id}(${dataObject}.element.getBoundingClientRect().width)`;
  }

  return `
  function ${renderColorColumnNumericalLegendFunctionName}(width) {
    var legend = ${dataObject}.element.querySelector(".q-table-colorColumn-legend--numerical");
    var legendContainer = ${dataObject}.element.querySelector(".q-table-legend-container");
    if (width <= 640) {
      legend.classList.remove("q-table-colorColumn-legend--fullwidth")
      legendContainer.classList.add("q-table-legend-container--desktop");
      legendContainer.classList.remove("q-table-legend-container--fullwidth");
    } else {
      legend.classList.add("q-table-colorColumn-legend--fullwidth")
      legendContainer.classList.remove("q-table-legend-container--desktop");
      legendContainer.classList.add("q-table-legend-container--fullwidth");
    }
  }

  function ${setupMethodBoxFunctionName}() {
    ${renderColorColumnNumericalLegendFunction}
  }

  window.q_domready.then(function() {
    ${setupMethodBoxFunctionName}();
  });
  `;
}
