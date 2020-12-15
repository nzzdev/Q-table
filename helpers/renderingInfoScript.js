function getDefaultScript(context) {
  const dataObject = `window.${context.id}Data`;
  return `
    if (!window.q_domready) {
      window.q_domready = new Promise(function(resolve) {
        if (document.readyState && (document.readyState === 'interactive' || document.readyState === 'complete')) {
          resolve();
        } else {
          function onReady() {
            resolve();
            document.removeEventListener('DOMContentLoaded', onReady, true);
          }
          document.addEventListener('DOMContentLoaded', onReady, true);
          document.onreadystatechange = function() {
            if (document.readyState === "interactive") {
              resolve();
            }
          }
        }
      });
    }
    if (${dataObject} === undefined) {
      ${dataObject} = {};
    }
    ${dataObject}.element = document.querySelector("#${context.id}");
    ${dataObject}.tableElement = ${dataObject}.element.querySelector(".q-table__table");
    ${dataObject}.isCardLayout = ${context.item.options.cardLayout};
  `;
}

function getCardLayoutScript(context) {
  const applyCardLayoutClassFunctionName = `applyCardLayoutClass${context.id}`;
  const dataObject = `window.${context.id}Data`;

  let renderMinibarsFunction = "";
  if (Object.keys(context.minibar).length !== 0) {
    renderMinibarsFunction = `renderMinibars${context.id}()`;
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
        }
      });
    }, 250));
  `;
}

function getShowMoreButtonScript(context) {
  const dataObject = `window.${context.id}Data`;
  const handleShowMoreButtonFunctionName = `handleShowMoreButton${context.id}`;
  const hideRowsFunctionName = `hideRows${context.id}`;
  const showRowsFunctionName = `showRows${context.id}`;

  return `
    ${dataObject}.rowVisibilityState = 'visible';
    ${dataObject}.numberOfRows = ${context.numberOfRows};
    ${dataObject}.numberOfRowsToHide = ${context.numberOfRowsToHide};
    function ${hideRowsFunctionName}() {
      ${dataObject}.tableElement.querySelectorAll('tbody tr').forEach(function(rowElement, index) {
        if (index >= (${dataObject}.numberOfRows - ${dataObject}.numberOfRowsToHide)) {
          rowElement.classList.remove('q-table-state-visible');
          rowElement.classList.add('q-table-state-hidden');
        }
      });
      ${dataObject}.showMoreButtonElement.textContent = 'Alle ' + ${dataObject}.numberOfRows + ' anzeigen';
      ${dataObject}.rowVisibilityState = 'hidden';
    }
    function ${showRowsFunctionName}() {
      ${dataObject}.tableElement.querySelectorAll('tbody tr').forEach(function(rowElement, index) {
        rowElement.classList.remove('q-table-state-hidden');
        rowElement.classList.add('q-table-state-visible');
      });
      ${dataObject}.showMoreButtonElement.textContent = "Tabelle zuklappen";
      ${dataObject}.rowVisibilityState = 'visible';
    }
    function ${handleShowMoreButtonFunctionName}() {
      if (${dataObject}.numberOfRowsToHide === undefined) {
        if (${dataObject}.isCardLayout && ${dataObject}.numberOfRows >= 6) {
          ${dataObject}.numberOfRowsToHide = ${dataObject}.numberOfRows - 3; // show 3 initially
        } else if (${dataObject}.numberOfRows >= 15) {
          ${dataObject}.numberOfRowsToHide = ${dataObject}.numberOfRows - 10; // show 10 initially
        }
      }
      if (${dataObject}.numberOfRowsToHide === undefined || ${dataObject}.numberOfRowsToHide < 1) {
        return;
      }

      ${dataObject}.showMoreButtonElement = document.createElement('button');
      ${dataObject}.showMoreButtonElement.classList.add('s-button');
      ${dataObject}.showMoreButtonElement.classList.add('s-button--secondary');
      ${dataObject}.showMoreButtonElement.classList.add('q-table_show-more-button');
      ${dataObject}.showMoreButtonElement.setAttribute('type', 'button');
      ${dataObject}.element.insertBefore(${dataObject}.showMoreButtonElement, ${dataObject}.element.querySelector(".s-q-item__footer"));

      ${dataObject}.showMoreButtonElement.addEventListener('click', function(event) {
        if (${dataObject}.rowVisibilityState === 'hidden') {
          ${showRowsFunctionName}();
        } else {
          ${hideRowsFunctionName}();
          ${dataObject}.tableElement.scrollIntoView(true);
        }
      });
      ${hideRowsFunctionName}();
    }

    window.q_domready.then(function() {
      ${handleShowMoreButtonFunctionName}();
    });
  `;
}

function getMinibarsScript(context) {
  const dataObject = `window.${context.id}Data`;
  const getColumnFunctionName = `getColumn${context.id}`;
  const renderMinibarsFunctionName = `renderMinibars${context.id}`;
  const handleMinibarsMinWidthFunctionName = `handleMinibarsMinWidth${
    context.id
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

function getSearchFormInputScript(context) {
  const dataObject = `window.${context.id}Data`;
  const searchFormInputAddEventListeners = `searchFormInputAddEventListeners${context.id}`;
  const searchFormInputHideRows = `searchFormInputHideRows${context.id}`;
  const searchFormInputShowRows = `searchFormInputShowRows${context.id}`;
  const filterRows = `filterRows${context.id}`;

  return `
    function ${searchFormInputHideRows}() {
      ${dataObject}.showMoreButtonElement.style.display = '';

      ${dataObject}.tableElement.querySelectorAll('tbody tr').forEach(function(rowElement, index) {
        if (index >= (${dataObject}.numberOfRows - ${dataObject}.numberOfRowsToHide)) {
          rowElement.classList.remove('q-table-state-visible');
          rowElement.classList.add('q-table-state-hidden');
        }
      });
      ${dataObject}.showMoreButtonElement.textContent = 'Alle ' + ${dataObject}.numberOfRows + ' anzeigen';
      ${dataObject}.rowVisibilityState = 'hidden';
    }

    function ${searchFormInputShowRows}() {
      ${dataObject}.showMoreButtonElement.style.display = 'none';

      ${dataObject}.tableElement.querySelectorAll('tbody tr').forEach(function(rowElement, index) {
        rowElement.classList.remove('q-table-state-hidden');
        rowElement.classList.add('q-table-state-visible');
      });
      ${dataObject}.showMoreButtonElement.textContent = "Tabelle zuklappen";
      ${dataObject}.rowVisibilityState = 'visible';
    }

    function ${filterRows}(filter) {
      filter = filter.toUpperCase();
      
      if (filter.length < 2) return;

      ${dataObject}.tableElement.querySelectorAll('tbody tr .q-table__cell--text').forEach(
        function(cellElement, index) {
          textCellValue = cellElement.innerText.toUpperCase();
          
          if (textCellValue.indexOf(filter) > -1) {
            cellElement.parentElement.classList.remove('q-table-state-hidden');
            cellElement.parentElement.classList.add('q-table-state-visible');
          } else {
            cellElement.parentElement.classList.remove('q-table-state-visible');
            cellElement.parentElement.classList.add('q-table-state-hidden');
          }
        }
      );
    }

    function ${searchFormInputAddEventListeners}() {
      document.querySelector('.search-form-input').addEventListener('input', function(event) {
        var filter = event.target.value;

        if (filter.length == 0) {
          // No filter = show default view with show more button (15 rows)
          ${searchFormInputHideRows}();
        } else if (filter.length == 1) {
          // 1 char typed = show all rows
          ${searchFormInputShowRows}();
        } else {
          ${filterRows}(filter);
        }
      });

      document.querySelector('.search-form-input').addEventListener('search', function(event) {
        if (event.target.value == '') {
          ${searchFormInputShowRows}();
          ${searchFormInputHideRows}();
        }
      });
    }

    window.q_domready.then(function() {
      ${searchFormInputAddEventListeners}();
    });
  `;
}

module.exports = {
  getDefaultScript: getDefaultScript,
  getCardLayoutScript: getCardLayoutScript,
  getShowMoreButtonScript: getShowMoreButtonScript,
  getMinibarsScript: getMinibarsScript,
  getSearchFormInputScript: getSearchFormInputScript
};
