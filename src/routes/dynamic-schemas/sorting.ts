import Joi from 'joi';
import type { DataMetaData, QTableDataRaw } from '../../interfaces';
import type { Request, ServerRoute } from '@hapi/hapi';

const route: ServerRoute = {
  method: 'POST',
  path: '/dynamic-schema/sorting',
  options: {
    validate: {
      payload: Joi.object(),
    },
  },
  handler: function (request: Request): number {
    const payload = request.payload as Payload;
    const item = payload.item;
    const data = item.data.table;

    return data[0].length;
  },
};

export default route;

/**
 * Interfaces.
 */
interface Payload {
  item: {
    data: {
      table: QTableDataRaw;
      metaData: DataMetaData;
    };
  };
}
