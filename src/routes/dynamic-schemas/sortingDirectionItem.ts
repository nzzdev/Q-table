import Joi from 'joi';
import type { DataMetaData, QTableConfigOptions, QTableDataRaw, SortDirection } from '../../interfaces';
import type { Request, ServerRoute } from '@hapi/hapi';

const route: ServerRoute = {
  method: 'POST',
  path: '/dynamic-schema/sortingDirectionItem',
  options: {
    validate: {
      payload: Joi.object(),
    },
  },
  handler: function (request: Request): ReturnPayload {
    // const payload = request.payload as Payload;
    // const item = payload.item;
    // const data = item.data.table;

    const ids: SortDirection[] = [null];
    const titles: string[] = [''];

    // We only support one column to be auto sorted.
    // But don't know how to make sure the select of the current auto sorted
    // column does not get it's options deleted.
    // This code affects all selects.

    // const m = item.options.sorting?.find(s => s.sortingDirection !== null);

    // if (!m) {
      ids.push('asc', 'desc');
      titles.push('Ascending', 'Decending');
    // }

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
// interface Payload {
//   item: {
//     data: {
//       table: QTableDataRaw;
//       metaData: DataMetaData;
//     };
//     options: QTableConfigOptions;
//   };
// }

interface ReturnPayload {
  enum: SortDirection[];
  'Q:options': {
    enum_titles: string[];
  };
}
