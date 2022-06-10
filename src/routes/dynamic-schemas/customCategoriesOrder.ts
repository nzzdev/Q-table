import Joi from 'joi';
import { getDataWithoutHeaderRow, getUniqueCategoriesCount } from '../../helpers/data.js';
import type {
  DataMetaData,
  QTableConfigOptions,
  QTableDataRaw
} from '../../interfaces';

export default {
  method: 'POST',
  path: '/dynamic-schema/customCategoriesOrder',
  options: {
    validate: {
      payload: Joi.object(),
    },
  },
  handler: function (request, h): ReturnPayload {
    const item = request.payload.item as Payload;
    const data = getDataWithoutHeaderRow(item.data.table);

    const colorColumnSettings = item.options.colorColumn;

    return {
      maxItems: getUniqueCategoriesCount(data, colorColumnSettings),
    };
  },
};

/**
 * Interfaces.
 */
interface Payload {
  data: {
    table: QTableDataRaw,
    metaData: DataMetaData,
  },
  options: QTableConfigOptions,
}

interface ReturnPayload {
  maxItems: number;
}
