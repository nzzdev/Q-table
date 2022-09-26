import Joi from 'joi';
import { getNumericColumns } from '../../helpers/data.js';
import type { DataMetaData, QTableConfigOptions, QTableDataRaw } from '../../interfaces';
import type { Request, ServerRoute } from '@hapi/hapi';

const route: ServerRoute = {
  method: 'POST',
  path: '/dynamic-schema/selectedColumnMinibar',
  options: {
    validate: {
      payload: Joi.object(),
    },
  },
  handler: function (request: Request): SelectedColumnMinibarReturnPayload {
    const payload = request.payload as Payload;
    const item = payload.item;

    const settings = getMinibarDropdownSettings(item.data.table);

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
function getMinibarDropdownSettings(data: QTableDataRaw): DropdownSettings {
  // Default setting already added.
  const dropdownSettings: DropdownSettings = {
    ids: [null],
    titles: ['keine'],
  };

  // If data is available we all add all numeric columns to the dropdown.
  if (data.length > 0) {
    const columns = getNumericColumns(data);

    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];

      dropdownSettings.ids.push(column.index);
      dropdownSettings.titles.push(column.title);
    }
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
  titles: string[];
}

export interface SelectedColumnMinibarReturnPayload {
  enum: (number | null)[];
  'Q:options': {
    enum_titles: string[];
  };
}
