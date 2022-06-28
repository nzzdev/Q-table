import type { Request } from '@hapi/hapi';
import Joi from 'joi';
import { getCustomBucketBorders, getDataWithoutHeaderRow, getNumericalValuesByColumn, getNonNullValues, getMetaData } from '../../helpers/data.js';
import type { DataMetaData, QTableConfigOptions, QTableDataRaw } from '../../interfaces.js';

export default {
  method: 'POST',
  path: '/notification/customBuckets',
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
      const { numericalOptions, selectedColumn } = colorColumnSettings;
      const { bucketType, customBuckets } = numericalOptions;

      if (bucketType === 'custom' && typeof selectedColumn === 'number') {
        const bucketBorders = getCustomBucketBorders(customBuckets);
        const values = getNumericalValuesByColumn(data, selectedColumn);
        const numberValues = getNonNullValues(values);
        const metaData = getMetaData(values, numberValues, 0);

        if (bucketBorders[0] > metaData.minValue || bucketBorders[bucketBorders.length - 1] < metaData.maxValue) {
          return {
            message: {
              title: 'notifications.customBuckets.title',
              body: 'notifications.customBuckets.body',
            },
          };
        }
      }
    } catch (err) {
      console.log('Error processing /notification/customBuckets', err);
    }

    return null;
  },
};

interface Payload {
  item: {
    data: {
      table: QTableDataRaw;
      metaData: DataMetaData;
    };
    options: QTableConfigOptions;
  };
  roles: string[];
}
