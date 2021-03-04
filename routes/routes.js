module.exports = [
  require("./rendering-info/web.js"),
  require("./stylesheet.js"),
  require("./option-availability.js"),
  require("./dynamic-schema.js"),
  require("./health.js"),
  require("./migration.js"),
  require("./locales.js"),
  require("./fixtures/data.js"),
  require("./notifications/numberBucketsOutOfColorScale.js"),
].concat(require("./schema.js"));
