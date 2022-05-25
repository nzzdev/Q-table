function getDefaultScript(context) {
    var dataObject = "window.".concat(context.id, "Data");
    return "\n    if (!window.q_domready) {\n      window.q_domready = new Promise(function(resolve) {\n        if (document.readyState && (document.readyState === 'interactive' || document.readyState === 'complete')) {\n          resolve();\n        } else {\n          function onReady() {\n            resolve();\n            document.removeEventListener('DOMContentLoaded', onReady, true);\n          }\n          document.addEventListener('DOMContentLoaded', onReady, true);\n          document.onreadystatechange = function() {\n            if (document.readyState === \"interactive\") {\n              resolve();\n            }\n          }\n        }\n      });\n    }\n    if (".concat(dataObject, " === undefined) {\n      ").concat(dataObject, " = {};\n    }\n    ").concat(dataObject, ".element = document.querySelector(\"#").concat(context.id, "\");\n    ").concat(dataObject, ".tableElement = ").concat(dataObject, ".element.querySelector(\".q-table__table\");\n    ").concat(dataObject, ".isCardLayout = ").concat(context.item.options.cardLayout, ";\n  ");
}
function getCardLayoutScript(context) {
    var applyCardLayoutClassFunctionName = "applyCardLayoutClass".concat(context.id);
    var dataObject = "window.".concat(context.id, "Data");
    var renderMinibarsFunction = "";
    if (Object.keys(context.minibar).length !== 0) {
        renderMinibarsFunction = "renderMinibars".concat(context.id, "()");
    }
    var renderColorColumnNumericalLegendFunction = "";
    if (context.colorColumn && context.colorColumn.colorColumnType === "numerical") {
        renderColorColumnNumericalLegendFunction = "renderColorColumnNumericalLegend".concat(context.id, "(").concat(dataObject, ".width)");
    }
    return "\n    ".concat(dataObject, ".footerElement = ").concat(dataObject, ".element.querySelector(\".s-q-item__footer\");\n    ").concat(dataObject, ".isCardLayout = ").concat(dataObject, ".isCardLayout || undefined;\n\n    function ").concat(applyCardLayoutClassFunctionName, "() {\n      if (").concat(dataObject, ".width > 400 && !").concat(context.item.options.cardLayout, ") {\n        ").concat(dataObject, ".isCardLayout = false;\n        ").concat(dataObject, ".element.classList.remove('q-table--card-layout');\n      } else if (").concat(context.item.options.cardLayoutIfSmall, ") {\n        ").concat(dataObject, ".isCardLayout = true;\n        ").concat(dataObject, ".element.classList.add('q-table--card-layout');\n      }\n    }\n    window.q_domready.then(function() {\n      ").concat(dataObject, ".width = ").concat(dataObject, ".element.getBoundingClientRect().width;\n      \n      ").concat(applyCardLayoutClassFunctionName, "();\n    });\n    function ").concat(context.id, "debounce(func, wait, immediate) {\n      var timeout;\n      return function() {\n        var context = this, args = arguments;\n        var later = function() {\n          timeout = null;\n          if (!immediate) func.apply(context, args);\n        };\n        var callNow = immediate && !timeout;\n        clearTimeout(timeout);\n        timeout = setTimeout(later, wait);\n        if (callNow) func.apply(context, args);\n      };\n    };\n    window.addEventListener('resize', ").concat(context.id, "debounce(function() {\n      requestAnimationFrame(function() {\n        var newWidth = ").concat(dataObject, ".element.getBoundingClientRect().width;\n        if (newWidth !== ").concat(dataObject, ".width) {\n          ").concat(dataObject, ".width = newWidth;\n          ").concat(applyCardLayoutClassFunctionName, "();\n          ").concat(renderMinibarsFunction, ";\n          ").concat(renderColorColumnNumericalLegendFunction, ";\n        }\n      });\n    }, 250));\n  ");
}
function getShowMoreButtonScript(context) {
    var dataObject = "window.".concat(context.id, "Data");
    var handleShowMoreButtonFunctionName = "handleShowMoreButton".concat(context.id);
    var hideRowsFunctionName = "hideRows".concat(context.id);
    var showRowsFunctionName = "showRows".concat(context.id);
    return "\n    ".concat(dataObject, ".rowVisibilityState = 'visible';\n    ").concat(dataObject, ".numberOfRows = ").concat(context.numberOfRows, ";\n    ").concat(dataObject, ".numberOfRowsToHide = ").concat(context.numberOfRowsToHide, ";\n    function ").concat(hideRowsFunctionName, "() {\n      ").concat(dataObject, ".tableElement.querySelectorAll('tbody tr').forEach(function(rowElement, index) {\n        if (index >= (").concat(dataObject, ".numberOfRows - ").concat(dataObject, ".numberOfRowsToHide)) {\n          rowElement.classList.remove('q-table-state-visible');\n          rowElement.classList.add('q-table-state-hidden');\n        }\n      });\n      ").concat(dataObject, ".showMoreButtonElement.textContent = 'Alle ' + ").concat(dataObject, ".numberOfRows + ' anzeigen';\n      ").concat(dataObject, ".rowVisibilityState = 'hidden';\n    }\n    function ").concat(showRowsFunctionName, "() {\n      ").concat(dataObject, ".tableElement.querySelectorAll('tbody tr').forEach(function(rowElement, index) {\n        rowElement.classList.remove('q-table-state-hidden');\n        rowElement.classList.add('q-table-state-visible');\n      });\n      ").concat(dataObject, ".showMoreButtonElement.textContent = \"Tabelle zuklappen\";\n      ").concat(dataObject, ".rowVisibilityState = 'visible';\n    }\n    function ").concat(handleShowMoreButtonFunctionName, "() {\n      if (").concat(dataObject, ".numberOfRowsToHide === undefined) {\n        if (").concat(dataObject, ".isCardLayout && ").concat(dataObject, ".numberOfRows >= 6) {\n          ").concat(dataObject, ".numberOfRowsToHide = ").concat(dataObject, ".numberOfRows - 3; // show 3 initially\n        } else if (").concat(dataObject, ".numberOfRows >= 15) {\n          ").concat(dataObject, ".numberOfRowsToHide = ").concat(dataObject, ".numberOfRows - 10; // show 10 initially\n        }\n      }\n      if (").concat(dataObject, ".numberOfRowsToHide === undefined || ").concat(dataObject, ".numberOfRowsToHide < 1) {\n        return;\n      }\n\n      ").concat(dataObject, ".showMoreButtonElement = document.createElement('button');\n      ").concat(dataObject, ".showMoreButtonElement.classList.add('s-button');\n      ").concat(dataObject, ".showMoreButtonElement.classList.add('s-button--secondary');\n      ").concat(dataObject, ".showMoreButtonElement.classList.add('q-table_show-more-button');\n      ").concat(dataObject, ".showMoreButtonElement.setAttribute('type', 'button');\n      ").concat(dataObject, ".element.insertBefore(").concat(dataObject, ".showMoreButtonElement, ").concat(dataObject, ".element.querySelector(\".s-q-item__footer\"));\n\n      ").concat(dataObject, ".showMoreButtonElement.addEventListener('click', function(event) {\n        if (").concat(dataObject, ".rowVisibilityState === 'hidden') {\n          ").concat(showRowsFunctionName, "();\n        } else {\n          ").concat(hideRowsFunctionName, "();\n          ").concat(dataObject, ".tableElement.scrollIntoView(true);\n        }\n      });\n      ").concat(hideRowsFunctionName, "();\n    }\n\n    window.q_domready.then(function() {\n      ").concat(handleShowMoreButtonFunctionName, "();\n    });\n  ");
}
function getMinibarsScript(context) {
    var dataObject = "window.".concat(context.id, "Data");
    var getColumnFunctionName = "getColumn".concat(context.id);
    var renderMinibarsFunctionName = "renderMinibars".concat(context.id);
    var handleMinibarsMinWidthFunctionName = "handleMinibarsMinWidth".concat(context.id);
    return "\n    function ".concat(getColumnFunctionName, "(table, col) {\n      var tab = table.getElementsByTagName('tbody')[0];\n      var columns = [];\n\n      for (var i = 0; i < tab.rows.length; i++) {\n          if (tab.rows[i].cells.length > col) { \n              columns.push(tab.rows[i].cells[col]);\n          }\n      }\n      return columns;\n    }\n\n    function ").concat(handleMinibarsMinWidthFunctionName, "(selectedColumn, minibarColumn, tableMinibarType) {\n      if (").concat(dataObject, ".element.getBoundingClientRect().width < 400) {\n        if (tableMinibarType===\"mixed\") {\n          selectedColumn.forEach(function(cell){\n            cell.classList.add('q-table-minibar--mixed-mobile');\n          });\n        }\n        if (tableMinibarType===\"positive\") {\n          minibarColumn.forEach(function(cell){\n            cell.classList.add('q-table-minibar-cell-mobile');\n          });\n        }\n        if (tableMinibarType===\"negative\") {\n          selectedColumn.forEach(function(cell){\n            cell.classList.add('q-table-minibar-cell-mobile');\n          });\n        }\n      } else {\n        if (tableMinibarType===\"mixed\") {\n          selectedColumn.forEach(function(cell){\n            cell.classList.remove('q-table-minibar--mixed-mobile');\n          });\n        }\n        if (tableMinibarType===\"positive\") {\n          minibarColumn.forEach(function(cell){\n            cell.classList.remove('q-table-minibar-cell-mobile');\n          });\n        }\n        if (tableMinibarType===\"negative\") {\n          selectedColumn.forEach(function(cell){\n            cell.classList.remove('q-table-minibar-cell-mobile');\n          });\n        }\n      }\n    }\n\n    function ").concat(renderMinibarsFunctionName, "() {\n      var selectedColumn = ").concat(getColumnFunctionName, "(").concat(dataObject, ".tableElement,\n        ").concat(context.item.options.minibar.selectedColumn, ");\n      var minibarColumn = ").concat(getColumnFunctionName, "(").concat(dataObject, ".tableElement,\n        ").concat(context.item.options.minibar.selectedColumn + 1, ");\n      ").concat(handleMinibarsMinWidthFunctionName, "(selectedColumn, minibarColumn, selectedColumn[0].dataset.minibar);\n    }\n\n    window.q_domready.then(function() {\n      ").concat(renderMinibarsFunctionName, "();\n    });\n  ");
}
function getSearchFormInputScript(context) {
    var dataObject = "window.".concat(context.id, "Data");
    var searchFormInputAddEventListeners = "searchFormInputAddEventListeners".concat(context.id);
    var searchFormInputHideRows = "searchFormInputHideRows".concat(context.id);
    var searchFormInputShowRows = "searchFormInputShowRows".concat(context.id);
    var filterRows = "filterRows".concat(context.id);
    return "\n    function ".concat(searchFormInputHideRows, "() {\n      ").concat(dataObject, ".showMoreButtonElement.style.display = '';\n\n      ").concat(dataObject, ".tableElement.querySelectorAll('tbody tr').forEach(function(rowElement, index) {\n        if (index >= (").concat(dataObject, ".numberOfRows - ").concat(dataObject, ".numberOfRowsToHide)) {\n          rowElement.classList.remove('q-table-state-visible');\n          rowElement.classList.add('q-table-state-hidden');\n        }\n      });\n      ").concat(dataObject, ".showMoreButtonElement.textContent = 'Alle ' + ").concat(dataObject, ".numberOfRows + ' anzeigen';\n      ").concat(dataObject, ".rowVisibilityState = 'hidden';\n    }\n\n    function ").concat(searchFormInputShowRows, "() {\n      ").concat(dataObject, ".showMoreButtonElement.style.display = 'none';\n\n      ").concat(dataObject, ".tableElement.querySelectorAll('tbody tr').forEach(function(rowElement, index) {\n        rowElement.classList.remove('q-table-state-hidden');\n        rowElement.classList.add('q-table-state-visible');\n      });\n      ").concat(dataObject, ".showMoreButtonElement.textContent = \"Tabelle zuklappen\";\n      ").concat(dataObject, ".rowVisibilityState = 'visible';\n    }\n\n    function ").concat(filterRows, "(filter) {\n      var foundString = false;\n      filter = filter.toUpperCase();\n\n      if (filter.length < 2) return;\n\n      // Loop through all table rows\n      ").concat(dataObject, ".tableElement.querySelectorAll('tbody tr').forEach(\n        function(rowElement) {\n          foundString = false;\n          \n          // Loop through all text cells\n          rowElement.querySelectorAll('.q-table__cell--text').forEach(\n            function(textCellElement) {\n              textCellValue = textCellElement.innerText.toUpperCase();\n\n              if (textCellValue.indexOf(filter) > -1) {\n                foundString = true;\n                return;\n              }\n            }\n          )\n\n          if (foundString) {\n            rowElement.classList.remove('q-table-state-hidden');\n            rowElement.classList.add('q-table-state-visible');\n          } else {\n            rowElement.classList.remove('q-table-state-visible');\n            rowElement.classList.add('q-table-state-hidden');\n          }\n        }\n      );\n    }\n\n    function ").concat(searchFormInputAddEventListeners, "() {\n      ").concat(dataObject, ".element.querySelector('.q-table__search__input').addEventListener('input', function(event) {\n        var filter = event.target.value;\n\n        if (filter.length < 2) {\n          // Always make all rows visible again\n          ").concat(searchFormInputShowRows, "();\n\n          // No filter = show default view with show more button (15 rows)\n          if (filter.length == 0) ").concat(searchFormInputHideRows, "();\n        } else {\n          ").concat(filterRows, "(filter);\n        }\n      });\n    }\n\n    window.q_domready.then(function() {\n      ").concat(searchFormInputAddEventListeners, "();\n    });\n  ");
}
function getColorColumnScript(context) {
    var dataObject = "window.".concat(context.id, "Data");
    var setupMethodBoxFunctionName = "setupMethodBox".concat(context.id);
    var prepareMethodBoxElementsFunctionName = "prepareMethodBoxElements".concat(context.id);
    var setVisibilityOfElementsFunctionName = "setVisibilityOfElements".concat(context.id);
    var renderColorColumnNumericalLegendFunctionName = "renderColorColumnNumericalLegend".concat(context.id);
    var addEventListenerToMethodBoxToggleFunctionName = "addEventListenerToMethodBoxToggle".concat(context.id);
    var handleClickOnMethodBoxToogleFunctionName = "handleClickOnMethodBoxToogle".concat(context.id);
    var addEventListenerToMethodBoxArticleLinkFunctionName = "addEventListenerToMethodBoxArticleLink".concat(context.id);
    var handleClickOnMethodBoxArticleLinkFunctionName = "handleClickOnMethodBoxArticleLink".concat(context.id);
    var renderColorColumnNumericalLegendFunction = "";
    if (context.colorColumn && context.colorColumn.colorColumnType === "numerical") {
        renderColorColumnNumericalLegendFunction = "renderColorColumnNumericalLegend".concat(context.id, "(").concat(dataObject, ".element.getBoundingClientRect().width)");
    }
    return "\n\n  function ".concat(prepareMethodBoxElementsFunctionName, "() {\n    ").concat(dataObject, ".methodBoxToggleElement = ").concat(dataObject, ".element.querySelector(\n      \".q-table-methods-link\"\n    );\n    ").concat(dataObject, ".methodBoxContainerElement = ").concat(dataObject, ".element.querySelector(\n      \".q-table-methods-container\"\n    );\n    ").concat(dataObject, ".methodBoxOpenIcon = ").concat(dataObject, ".element.querySelector(\n      \".q-table-methods-link-icon-plus\"\n    );\n    ").concat(dataObject, ".methodBoxCloseIcon = ").concat(dataObject, ".element.querySelector(\n      \".q-table-methods-link-icon-close\"\n    );\n    ").concat(dataObject, ".methodBoxArticleLink = ").concat(dataObject, ".element.querySelector(\n      \".q-table-methods-article-container\"\n    );\n  }\n\n  function ").concat(setVisibilityOfElementsFunctionName, "() {\n    if (").concat(dataObject, ".isMethodBoxVisible) {\n      if (").concat(dataObject, ".methodBoxContainerElement) {\n        ").concat(dataObject, ".methodBoxContainerElement.classList.remove(\"hidden\");\n      }\n      if (").concat(dataObject, ".methodBoxOpenIcon) {\n        ").concat(dataObject, ".methodBoxOpenIcon.classList.add(\"hidden\");\n      }\n      if (").concat(dataObject, ".methodBoxCloseIcon) {\n        ").concat(dataObject, ".methodBoxCloseIcon.classList.remove(\"hidden\");\n      }\n    } else {\n      if (").concat(dataObject, ".methodBoxContainerElement) {\n        ").concat(dataObject, ".methodBoxContainerElement.classList.add(\"hidden\");\n      }\n      if (").concat(dataObject, ".methodBoxCloseIcon) {\n        ").concat(dataObject, ".methodBoxCloseIcon.classList.add(\"hidden\");\n      }\n      if (").concat(dataObject, ".methodBoxOpenIcon) {\n        ").concat(dataObject, ".methodBoxOpenIcon.classList.remove(\"hidden\");\n      }\n    }\n  }\n\n  function ").concat(addEventListenerToMethodBoxToggleFunctionName, "() {\n    if (").concat(dataObject, ".methodBoxToggleElement) {\n      ").concat(dataObject, ".methodBoxToggleElement.addEventListener(\"click\", function(event) {\n        ").concat(handleClickOnMethodBoxToogleFunctionName, "(event);\n      });\n    }\n  }\n\n\n  function ").concat(handleClickOnMethodBoxToogleFunctionName, "(event) {\n    const eventDetail = {\n      eventInfo: {\n        componentName: \"q-table\",\n        eventAction: ").concat(dataObject, ".isMethodBoxVisible\n          ? \"close-methods-box\"\n          : \"open-methods-box\",\n        eventNonInteractive: false,\n      },\n    };\n\n    ").concat(dataObject, ".isMethodBoxVisible = !").concat(dataObject, ".isMethodBoxVisible;\n    ").concat(setVisibilityOfElementsFunctionName, "();\n\n    const trackingEvent = new CustomEvent(\"q-tracking-event\", {\n      bubbles: true,\n      detail: eventDetail,\n    });\n    event.target.dispatchEvent(trackingEvent);\n  }\n\n  function ").concat(addEventListenerToMethodBoxArticleLinkFunctionName, "() {\n    if (").concat(dataObject, ".methodBoxArticleLink) {\n      ").concat(dataObject, ".methodBoxToggleElement.addEventListener(\"click\", function(event) {\n        ").concat(handleClickOnMethodBoxArticleLinkFunctionName, "(event);\n      });\n    }\n  }\n\n  function ").concat(handleClickOnMethodBoxArticleLinkFunctionName, "(event) {\n    const eventDetail = {\n      eventInfo: {\n        componentName: \"q-table\",\n        eventAction: \"open-method-box-article-link\",\n        eventNonInteractive: false,\n      },\n    };\n\n    const trackingEvent = new CustomEvent(\"q-tracking-event\", {\n      bubbles: true,\n      detail: eventDetail,\n    });\n    event.target.dispatchEvent(trackingEvent);\n  }\n\n  function ").concat(renderColorColumnNumericalLegendFunctionName, "(width) {\n    var legend = ").concat(dataObject, ".element.querySelector(\".q-table-colorColumn-legend--numerical\");\n    var legendContainer = ").concat(dataObject, ".element.querySelector(\".q-table-colorColumn-legend-container\");\n    if (width <= 640) {\n      legend.classList.remove(\"q-table-colorColumn-legend--fullwidth\")\n      legendContainer.classList.add(\"q-table-colorColumn-legend-container--desktop\"); \n      legendContainer.classList.remove(\"q-table-colorColumn-legend-container--fullwidth\"); \n    } else {\n      legend.classList.add(\"q-table-colorColumn-legend--fullwidth\")\n      legendContainer.classList.remove(\"q-table-colorColumn-legend-container--desktop\"); \n      legendContainer.classList.add(\"q-table-colorColumn-legend-container--fullwidth\"); \n    }\n  }\n\n  function ").concat(setupMethodBoxFunctionName, "() {\n    ").concat(prepareMethodBoxElementsFunctionName, "();\n    ").concat(setVisibilityOfElementsFunctionName, "();\n    ").concat(renderColorColumnNumericalLegendFunction, "\n    ").concat(addEventListenerToMethodBoxToggleFunctionName, "();\n    ").concat(addEventListenerToMethodBoxArticleLinkFunctionName, "();\n  }\n\n  window.q_domready.then(function() {\n    ").concat(setupMethodBoxFunctionName, "();\n  });\n  ");
}
module.exports = {
    getDefaultScript: getDefaultScript,
    getCardLayoutScript: getCardLayoutScript,
    getShowMoreButtonScript: getShowMoreButtonScript,
    getMinibarsScript: getMinibarsScript,
    getSearchFormInputScript: getSearchFormInputScript,
    getColorColumnScript: getColorColumnScript
};