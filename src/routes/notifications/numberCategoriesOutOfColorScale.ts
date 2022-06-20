import Joi from 'joi';
import { getDataWithoutHeaderRow, getUniqueCategoriesCount } from '../../helpers/data.js';
import { digitWords } from '../../helpers/colorColumnColor.js';
import { DataMetaData, QTableConfigOptions, QTableDataRaw } from '../../interfaces.js';
import type { Request, ServerRoute } from '@hapi/hapi'

const numberMainColors = digitWords.length;

const route: ServerRoute = {
  method: 'POST',
  path: '/notification/numberCategoriesOutOfColorScale',
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
      const colorColumnSettings = item.options.colorColumn;

      if (item.options.colorColumn.colorColumnType === 'categorical') {
        const tableData = getDataWithoutHeaderRow(item.data.table);
        const numberUniqueValues = getUniqueCategoriesCount(tableData, colorColumnSettings);

        if (numberUniqueValues > numberMainColors) {
          return {
            message: {
              title: 'notifications.numberCategoriesOutOfColorScale.title',
              body: 'notifications.numberCategoriesOutOfColorScale.body',
            },
          };
        }
      }
    } catch (err) {
      console.log('Error processing /notification/numberCategoriesOutOfColorScale', err);
    }

    return null;
  },
};

export default route;

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
