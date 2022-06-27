import { QTableSvelteProperties } from '../interfaces';

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

export function getMinibarsScript(context: QTableSvelteProperties): string {
  const dataObject = `window.${context.id}Data`;
  const getColumnFunctionName = `getColumn${context.id}`;
  const renderMinibarsFunctionName = `renderMinibars${context.id}`;
  const handleMinibarsMinWidthFunctionName = `handleMinibarsMinWidth${context.id
    }`;

  return `
    function ${getColumnFunctionName}(table, col) {
      var tab = table.getElementsByTagName('tbody')[0];
      var columns = [];

      for (var i = 0; i < tab.rows.length; i++) {
          if (tab.rows[i].cells.length > col) {
              columns.push(tab.rows[i].cells[col]);
          }
      }
      return columns;
    }

    function ${handleMinibarsMinWidthFunctionName}(selectedColumn, minibarColumn, tableMinibarType) {
      if (${dataObject}.element.getBoundingClientRect().width < 400) {
        if (tableMinibarType==="mixed") {
          selectedColumn.forEach(function(cell){
            cell.classList.add('q-table-minibar--mixed-mobile');
          });
        }
        if (tableMinibarType==="positive") {
          minibarColumn.forEach(function(cell){
            cell.classList.add('q-table-minibar-cell-mobile');
          });
        }
        if (tableMinibarType==="negative") {
          selectedColumn.forEach(function(cell){
            cell.classList.add('q-table-minibar-cell-mobile');
          });
        }
      } else {
        if (tableMinibarType==="mixed") {
          selectedColumn.forEach(function(cell){
            cell.classList.remove('q-table-minibar--mixed-mobile');
          });
        }
        if (tableMinibarType==="positive") {
          minibarColumn.forEach(function(cell){
            cell.classList.remove('q-table-minibar-cell-mobile');
          });
        }
        if (tableMinibarType==="negative") {
          selectedColumn.forEach(function(cell){
            cell.classList.remove('q-table-minibar-cell-mobile');
          });
        }
      }
    }

    function ${renderMinibarsFunctionName}() {
      var selectedColumn = ${getColumnFunctionName}(${dataObject}.tableElement,
        ${context.item.options.minibar.selectedColumn});
      var minibarColumn = ${getColumnFunctionName}(${dataObject}.tableElement,
        ${context.item.options.minibar.selectedColumn + 1});
      ${handleMinibarsMinWidthFunctionName}(selectedColumn, minibarColumn, selectedColumn[0].dataset.minibar);
    }

    window.q_domready.then(function() {
      ${renderMinibarsFunctionName}();
    });
  `;
}

export function getColorColumnScript(context: QTableSvelteProperties): string {
  const dataObject = `window.${context.id}Data`;
  const setupMethodBoxFunctionName = `setupMethodBox${context.id}`;
  const prepareMethodBoxElementsFunctionName = `prepareMethodBoxElements${context.id}`;
  const setVisibilityOfElementsFunctionName = `setVisibilityOfElements${context.id}`;
  const renderColorColumnNumericalLegendFunctionName = `renderColorColumnNumericalLegend${context.id}`;
  const addEventListenerToMethodBoxToggleFunctionName = `addEventListenerToMethodBoxToggle${context.id}`;
  const handleClickOnMethodBoxToogleFunctionName = `handleClickOnMethodBoxToogle${context.id}`;
  const addEventListenerToMethodBoxArticleLinkFunctionName = `addEventListenerToMethodBoxArticleLink${context.id}`;
  const handleClickOnMethodBoxArticleLinkFunctionName = `handleClickOnMethodBoxArticleLink${context.id}`;

  let renderColorColumnNumericalLegendFunction = '';
  if (context.colorColumn && context.colorColumn.colorColumnType === 'numerical') {
    renderColorColumnNumericalLegendFunction = `renderColorColumnNumericalLegend${context.id}(${dataObject}.element.getBoundingClientRect().width)`;
  }

  return `
  function ${prepareMethodBoxElementsFunctionName}() {
    ${dataObject}.methodBoxToggleElement = ${dataObject}.element.querySelector(
      ".q-table-methods-link"
    );
    ${dataObject}.methodBoxContainerElement = ${dataObject}.element.querySelector(
      ".q-table-methods-container"
    );
    ${dataObject}.methodBoxOpenIcon = ${dataObject}.element.querySelector(
      ".q-table-methods-link-icon-plus"
    );
    ${dataObject}.methodBoxCloseIcon = ${dataObject}.element.querySelector(
      ".q-table-methods-link-icon-close"
    );
    ${dataObject}.methodBoxArticleLink = ${dataObject}.element.querySelector(
      ".q-table-methods-article-container"
    );
  }

  function ${setVisibilityOfElementsFunctionName}() {
    if (${dataObject}.isMethodBoxVisible) {
      if (${dataObject}.methodBoxContainerElement) {
        ${dataObject}.methodBoxContainerElement.classList.remove("hidden");
      }
      if (${dataObject}.methodBoxOpenIcon) {
        ${dataObject}.methodBoxOpenIcon.classList.add("hidden");
      }
      if (${dataObject}.methodBoxCloseIcon) {
        ${dataObject}.methodBoxCloseIcon.classList.remove("hidden");
      }
    } else {
      if (${dataObject}.methodBoxContainerElement) {
        ${dataObject}.methodBoxContainerElement.classList.add("hidden");
      }
      if (${dataObject}.methodBoxCloseIcon) {
        ${dataObject}.methodBoxCloseIcon.classList.add("hidden");
      }
      if (${dataObject}.methodBoxOpenIcon) {
        ${dataObject}.methodBoxOpenIcon.classList.remove("hidden");
      }
    }
  }

  function ${addEventListenerToMethodBoxToggleFunctionName}() {
    if (${dataObject}.methodBoxToggleElement) {
      ${dataObject}.methodBoxToggleElement.addEventListener("click", function(event) {
        ${handleClickOnMethodBoxToogleFunctionName}(event);
      });
    }
  }

  function ${handleClickOnMethodBoxToogleFunctionName}(event) {
    const eventDetail = {
      eventInfo: {
        componentName: "q-table",
        eventAction: ${dataObject}.isMethodBoxVisible
          ? "close-methods-box"
          : "open-methods-box",
        eventNonInteractive: false,
      },
    };

    ${dataObject}.isMethodBoxVisible = !${dataObject}.isMethodBoxVisible;
    ${setVisibilityOfElementsFunctionName}();

    const trackingEvent = new CustomEvent("q-tracking-event", {
      bubbles: true,
      detail: eventDetail,
    });
    event.target.dispatchEvent(trackingEvent);
  }

  function ${addEventListenerToMethodBoxArticleLinkFunctionName}() {
    if (${dataObject}.methodBoxArticleLink) {
      ${dataObject}.methodBoxToggleElement.addEventListener("click", function(event) {
        ${handleClickOnMethodBoxArticleLinkFunctionName}(event);
      });
    }
  }

  function ${handleClickOnMethodBoxArticleLinkFunctionName}(event) {
    const eventDetail = {
      eventInfo: {
        componentName: "q-table",
        eventAction: "open-method-box-article-link",
        eventNonInteractive: false,
      },
    };

    const trackingEvent = new CustomEvent("q-tracking-event", {
      bubbles: true,
      detail: eventDetail,
    });
    event.target.dispatchEvent(trackingEvent);
  }

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
    ${prepareMethodBoxElementsFunctionName}();
    ${setVisibilityOfElementsFunctionName}();
    ${renderColorColumnNumericalLegendFunction}
    ${addEventListenerToMethodBoxToggleFunctionName}();
    ${addEventListenerToMethodBoxArticleLinkFunctionName}();
  }

  window.q_domready.then(function() {
    ${setupMethodBoxFunctionName}();
  });
  `;
}
