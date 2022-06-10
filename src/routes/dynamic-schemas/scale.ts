import Joi from 'joi';
import type { QTableConfigOptions } from '../../interfaces';

export default {
  method: 'POST',
  path: '/dynamic-schema/colorScale',
  options: {
    validate: {
      payload: Joi.object(),
    },
  },
  handler: function (request, h): ReturnPayload {
    const item = request.payload.item as Payload;
    const numericalOptions = item.options.colorColumn.numericalOptions;

    let enumValues = ['sequential'];
    let enumTitles = ['Sequentiell'];

    let bucketNumber = 0;
    if (numericalOptions.bucketType === 'custom') {
      if (numericalOptions.customBuckets) {
        const buckets = numericalOptions.customBuckets.split(',');
        bucketNumber = buckets.length - 1;
      }
    } else {
      bucketNumber = numericalOptions.numberBuckets;
    }

    // Add valid bucket borders to enum as diverging values.
    for (let i = 1; i < bucketNumber; i++) {
      enumValues.push(`border-${i}`);
      enumTitles.push(`Divergierend ab Grenze ${i}`);
    }

    // Add valid buckets to enum as diverging values.
    for (let i = 1; i < bucketNumber - 1; i++) {
      enumValues.push(`bucket-${i}`);
      enumTitles.push(`Divergierend ab Bucket ${i + 1}`);
    }

    return {
      enum: enumValues,
      'Q:options': {
        enum_titles: enumTitles,
      },
    };
  },
};

/**
 * Interfaces.
 */
interface Payload {
  options: QTableConfigOptions,
}

interface ReturnPayload {
  enum: string[],
  'Q:options': {
    enum_titles: string[]
  },
}
