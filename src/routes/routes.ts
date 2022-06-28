import web from './rendering-info/web';
import stylesheet from './stylesheet';
import optionAvailability from './option-availability';
import dynamicSchemas from './dynamic-schemas/index';
import health from './health';
import migration from './migration';
import locales from './locales';
import fixtureData from './fixtures/data';
import numberBucketsOutOfColorScale from './notifications/numberBucketsOutOfColorScale';
import numberBucketsExceedsDataSet from './notifications/numberBucketsExceedsDataSet';
import numberCategoriesOutOfColorScale from './notifications/numberCategoriesOutOfColorScale';
import customBuckets from './notifications/customBuckets';
import schema from './schema';

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
  ...schema,
];

export default allRoutes;
