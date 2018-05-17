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
          renderMinibars();
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
  const removeMinibarFunctionName = `removeMinibar${context.id}`;
  const addMinibarFunctionName = `addMinibar${context.id}`;
  const getColumnFunctionname = `getColumn${context.id}`;
  const moveNegativeMinibarFunctionName = `moveNegativeMinibar${context.id}`;

  return `
    function ${getColumnFunctionname}(table, col) {
      var tab = table.getElementsByTagName('tbody')[0];
      var n = tab.rows.length;
      var s = [];

      for (var i = 0; i < n; i++) {
          if (tab.rows[i].cells.length > col) { 
              s.push(tab.rows[i].cells[col]);
          }
      }
      return s;
    }

    function ${removeMinibarFunctionName}(cell){
      cell.classList.remove('q-table-minibar--mixed');
      var divs = Array.from(cell.getElementsByTagName('div'));
      divs.forEach(function(div){
        if (div.dataset.minibarType==="value"){
          console.log(div.dataset.minibarType);
          console.log(div.dataset.minibar);
          if (div.dataset.minibar==="positive"){
            div.classList.remove('q-table-minibar-alignment--positive');
          }
          if (div.dataset.minibar==="negative"){
            div.classList.remove('q-table-minibar-alignment--negative');
          }
          if (div.dataset.minibar==="empty"){
            div.classList.remove('q-table-minibar-alignment--empty');
          }
        } else {
          div.classList.add('q-table-minibar-hidden');
        }
      });
    }

    function ${addMinibarFunctionName}(cell) {
      cell.classList.add('q-table-minibar--' + cell.dataset.minibar)
      var divs = Array.from(cell.getElementsByTagName('div'));
      divs.forEach(function(div){
        if (div.dataset.minibarType==="value"){
          if (div.dataset.minibar==="positive"){
            div.classList.add('q-table-minibar-alignment--positive');
          }
          if (div.dataset.minibar==="negative"){
            div.classList.add('q-table-minibar-alignment--negative');
          }
          if (div.dataset.minibar==="empty"){
            div.classList.add('q-table-minibar-alignment--empty');
          }
        } else {
          div.classList.remove('q-table-minibar-hidden');
        }
      });
    }

    function ${moveNegativeMinibarFunctionName}(valueColumn, minibarColumn, isCardLayout) {
      for(var i = 0; i <= valueColumn.length -1; i++) {
        var tableRow = valueColumn[i].parentNode;
        if (tableRow !== null) {
          var bar = minibarColumn[i];
          var value = valueColumn[i];
          if (isCardLayout) {
            tableRow.replaceChild(bar, value);  
            tableRow.insertBefore(value, bar);
          } else {
            tableRow.replaceChild(value, bar);  
            tableRow.insertBefore(bar, value);
          }
          
        }
      }
    }

    function renderMinibars() {
      var minibarColumn = ${getColumnFunctionname}(${dataObject}.tableElement,
        ${context.item.options.minibarOptions + 1});
      if (minibarColumn[0].dataset.minibar==="mixed") {
        if (${dataObject}.isCardLayout) {
          // remove minibars when cardlayout and mixed
          minibarColumn.forEach(function(cell){
            ${removeMinibarFunctionName}(cell);
          });
        } else {
          // add minibars when not cardlayout and mixed
          minibarColumn.forEach(function(cell){
            ${addMinibarFunctionName}(cell);
          });
        }
      }
      
      if (minibarColumn[0].dataset.minibar==="negative")
      {
        var valueColumn = ${getColumnFunctionname}(${dataObject}.tableElement,
          ${context.item.options.minibarOptions + 2});
        ${moveNegativeMinibarFunctionName}(valueColumn, minibarColumn, ${dataObject}.isCardLayout);
      }
    }

    window.q_domready.then(function() {
      renderMinibars();
    });
  `;
}

module.exports = {
  getDefaultScript: getDefaultScript,
  getCardLayoutScript: getCardLayoutScript,
  getShowMoreButtonScript: getShowMoreButtonScript,
  getMinibarsScript: getMinibarsScript
};
