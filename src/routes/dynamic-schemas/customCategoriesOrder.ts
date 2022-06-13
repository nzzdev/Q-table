import Joi from 'joi';
import { getDataWithoutHeaderRow, getUniqueCategoriesCount } from '../../helpers/data.js';
import type {
  DataMetaData,
  QTableConfigOptions,
  QTableDataRaw
} from '../../interfaces';
import type { Request, ServerRoute } from '@hapi/hapi';

const route: ServerRoute = {
  method: 'POST',
  path: '/dynamic-schema/customCategoriesOrder',
  options: {
    validate: {
      payload: Joi.object(),
    },
  },
  handler: function (request: Request): ReturnPayload {
    const payload = request.payload as Payload;
    const item = payload.item;
    const data = getDataWithoutHeaderRow(item.data.table);

    const colorColumnSettings = item.options.colorColumn;

    return {
      maxItems: getUniqueCategoriesCount(data, colorColumnSettings),
    };
  },
};

export default route;

/**
 * Interfaces.
 */
interface Payload {
  item: {
    data: {
      table: QTableDataRaw,
      metaData: DataMetaData,
    },
    options: QTableConfigOptions,
  }
}

interface ReturnPayload {
  maxItems: number;
}
