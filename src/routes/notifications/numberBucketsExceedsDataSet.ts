import Joi from 'joi';
import { getDataWithoutHeaderRow, getUniqueCategoriesCount } from '../../helpers/data.js';
import type { Request } from '@hapi/hapi'
import type { DataMetaData, QTableConfigOptions, QTableDataRaw } from '../../interfaces.js';

export default {
  method: 'POST',
  path: '/notification/numberBucketsExceedsDataSet',
  options: {
    validate: {
      options: {
        allowUnknown: true,
      },
      payload: Joi.object().required(),
    },
    tags: ['api'],
  },
  handler: function (request: Request) {
    try {
      const payload = request.payload as Payload;
      const item = payload.item;
      const data = getDataWithoutHeaderRow(item.data.table);
      const colorColumnSettings = item.options.colorColumn;
      const { numericalOptions } = colorColumnSettings;

      if (numericalOptions.bucketType !== 'custom') {
        const numberUniqueValues = getUniqueCategoriesCount(data, colorColumnSettings);
        const numberBuckets = numericalOptions.numberBuckets;

        if (numberBuckets > numberUniqueValues) {
          return {
            message: {
              title: 'notifications.numberBucketsExceedsDataSet.title',
              body: 'notifications.numberBucketsExceedsDataSet.body',
            },
          };
        }
      }
    } catch (err) {
      console.log('Error processing /notification/numberBucketsExceedsDataSet', err);
    }

    return null;
  },
};

interface Payload {
  item: {
    data: {
      table: QTableDataRaw,
      metaData: DataMetaData,
    },
    options: QTableConfigOptions,
  },
  roles: string[],
}
