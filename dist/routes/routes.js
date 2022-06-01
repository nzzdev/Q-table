import web from './rendering-info/web.js';
import stylesheet from './stylesheet.js';
import optionAvailability from './option-availability.js';
import dynamicSchema from './dynamic-schema.js';
import health from './health.js';
import migration from './migration.js';
import locales from './locales.js';
// import fixtureData from './fixtures/data.js';
import numberBucketsOutOfColorScale from './notifications/numberBucketsOutOfColorScale.js';
import numberBucketsExceedsDataSet from './notifications/numberBucketsExceedsDataSet.js';
import numberCategoriesOutOfColorScale from './notifications/numberCategoriesOutOfColorScale.js';
import customBuckets from './notifications/customBuckets.js';
import schema from './schema.js';
const allRoutes = [
    web,
    stylesheet,
    optionAvailability,
    dynamicSchema,
    health,
    migration,
    locales,
    // fixtureData, - TODO
    numberBucketsOutOfColorScale,
    numberBucketsExceedsDataSet,
    numberCategoriesOutOfColorScale,
    customBuckets,
    ...schema
];
export default allRoutes;
// export default [
// require("./rendering-info/web.js"),
// require("./stylesheet.js"),
// require("./option-availability.js"),
// require("./dynamic-schema.js"),
// require("./health.js"),
// require("./migration.js"),
// require("./locales.js"),
// require("./fixtures/data.js"),
// require("./notifications/numberBucketsOutOfColorScale.js"),
// require("./notifications/numberBucketsExceedsDataSet.js"),
// require("./notifications/numberCategoriesOutOfColorScale.js"),
// require("./notifications/customBuckets.js"),
// ].concat(require("./schema.js"));
