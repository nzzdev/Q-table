import Joi from 'joi';
import type { DataMetaData, QTableConfigOptions, QTableDataRaw } from '../../interfaces';
import type { Request, ServerRoute } from '@hapi/hapi';

const route: ServerRoute = {
  method: 'POST',
  path: '/dynamic-schema/sortingItem',
  options: {
    validate: {
      payload: Joi.object(),
    },
  },
  handler: function (request: Request): ReturnPayload {
    const payload = request.payload as Payload;
    const item = payload.item;
    const data = item.data.table;
    const ids: number[] = [];
    const titles: (string|null)[] = [];

    for (let i = 0; i < data[0].length; i++) {
      const d = data[0][i];

      ids.push(i);
      titles.push(d);
    }

    return {
      enum: ids,
      'Q:options': {
        enum_titles: titles,
      },
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
      table: QTableDataRaw;
      metaData: DataMetaData;
    };
    options: QTableConfigOptions;
  };
}

interface ReturnPayload {
  enum: number[];
  'Q:options': {
    enum_titles: (string|null)[];
  };
}
