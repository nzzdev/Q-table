module.exports.migrate = function(item) {
  let result = {
    isChanged: false
  };

  if (item.options.minibarOptions) {
    let minibars = {
      selectedColumn: item.options.minibarOptions,
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
  }
  result.item = item;
  return result;
};
