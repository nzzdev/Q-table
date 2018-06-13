module.exports = [
  require("./rendering-info/web.js"),
  require("./stylesheet.js"),
  require("./option-availability.js"),
  require("./dynamic-enum.js"),
  require("./health.js"),
  require("./migration.js"),
  require("./fixtures/data.js")
].concat(require("./schema.js"));
