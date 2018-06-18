module.exports.migrate = function(item) {
  let result = {
    isChanged: false
  };

  if (!Number.isNaN(parseInt(item.options.minibarOptions))) {
    let minibars = {
      selectedColumn: item.options.minibarOptions + 1,
      barColor: {
        positive: {
          className: "",
          colorCode: ""
        },
        negative: {
          className: "",
          colorCode: ""
        }
      },
      invertColors: false
    };
    item.options["minibar"] = minibars;
    delete item.options.minibarOptions;
    result.isChanged = true;
  } else {
    delete item.options.minibarOptions;
    result.isChanged = true;
  }
  result.item = item;
  return result;
};
