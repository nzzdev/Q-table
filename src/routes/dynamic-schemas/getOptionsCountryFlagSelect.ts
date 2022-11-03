import Joi from 'joi';
import { getColumnsType } from '../../helpers/data.js';
import type { DataMetaData, QTableConfigOptions, QTableDataRaw } from '../../interfaces';
import type { Request, ServerRoute } from '@hapi/hapi';

const route: ServerRoute = {
  method: 'POST',
  path: '/dynamic-schema/getOptionsCountryFlagSelect',
  options: {
    validate: {
      payload: Joi.object(),
    },
  },
  handler: function (request: Request): ReturnPayload {
    const payload = request.payload as Payload;
    const item = payload.item;

    const settings = getOptions(item.data.table);

    return {
      enum: settings.ids,
      'Q:options': {
        enum_titles: settings.titles,
      },
    };
  },
};

/**
 * Internal.
 */
function getOptions(data: QTableDataRaw): DropdownSettings {
  // Default setting already added.
  const dropdownSettings: DropdownSettings = {
    ids: [null],
    titles: ['keine'],
  };

  if (data.length > 0) {
    const columnTypes = getColumnsType(data);

    data[0].forEach((head, index) => {

      if (!columnTypes[index].isNumeric) {
        dropdownSettings.ids.push(index);
        dropdownSettings.titles.push(head);
      }
    });
  }

  return dropdownSettings;
}

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

interface DropdownSettings {
  ids: (number | null)[];
  titles: (string|null)[];
}

export interface ReturnPayload {
  enum: (number | null)[];
  'Q:options': {
    enum_titles: (string|null)[];
  };
}
