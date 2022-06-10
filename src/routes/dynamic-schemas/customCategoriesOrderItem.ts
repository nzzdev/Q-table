import Joi from 'joi';
import { getDataWithoutHeaderRow, getUniqueCategoriesObject } from '../../helpers/data.js';
import type {
  DataMetaData,
  QTableConfigOptions,
  QTableDataRaw
} from '../../interfaces';

export default {
  method: 'POST',
  path: '/dynamic-schema/customCategoriesOrderItem',
  options: {
    validate: {
      payload: Joi.object(),
    },
  },
  handler: function (request, h): ReturnPayload {
    const item = request.payload.item as Payload;
    const data = getDataWithoutHeaderRow(item.data.table);

    const colorColumnSettings = item.options.colorColumn;
    const categories = getUniqueCategoriesObject(data, colorColumnSettings).categories;

    return {
      enum: categories,
      'Q:options': {
        enum_titles: categories,
      },
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
  enum: string[],
  'Q:options': {
    enum_titles: string[]
  },
}
