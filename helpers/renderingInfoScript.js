function getScript(context) {
  const functionName = `applyCardLayoutClass${context.id}`;
  const dataObject = `${context.id}Data`;
  return `
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
    function debounce(func, wait, immediate) {
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
    ${functionName}();
    window.addEventListener('resize', debounce(function() {
      requestAnimationFrame(function() {
        var newWidth = ${dataObject}.element.getBoundingClientRect().width;
        if (newWidth !== ${dataObject}.width) {
          ${dataObject}.width = newWidth;
          ${functionName}();
        }
      });
    }, 250));
  `;
}

module.exports = {
  getScript: getScript
};
