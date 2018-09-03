module.exports.migrate = function(item) {
  let result = {
    isChanged: false
  };

  if (item.data !== undefined || item.data !== null) {
    if (item.data.metaData === undefined || item.data.metaData === null) {
      let data = item.data.slice();
      item.data = {
        table: data,
        metaData: {
          cells: []
        }
      };
      result.isChanged = true;
    }
  }

  result.item = item;
  return result;
};
