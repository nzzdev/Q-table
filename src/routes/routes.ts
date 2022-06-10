import web from './rendering-info/web.js';
import stylesheet from './stylesheet.js';
import optionAvailability from './option-availability.js';
import dynamicSchemas from './dynamic-schemas/index.js';
import health from './health.js';
import migration from './migration.js';
import locales from './locales.js';
import fixtureData from './fixtures/data.js';
import numberBucketsOutOfColorScale from './notifications/numberBucketsOutOfColorScale.js';
import numberBucketsExceedsDataSet from './notifications/numberBucketsExceedsDataSet.js';
import numberCategoriesOutOfColorScale from './notifications/numberCategoriesOutOfColorScale.js';
import customBuckets from './notifications/customBuckets.js';
import schema from './schema.js';

const allRoutes = [
  web,
  stylesheet,
  optionAvailability,
  ...dynamicSchemas,
  health,
  migration,
  locales,
  fixtureData,
  numberBucketsOutOfColorScale,
  numberBucketsExceedsDataSet,
  numberCategoriesOutOfColorScale,
  customBuckets,
  ...schema
];

export default allRoutes;
