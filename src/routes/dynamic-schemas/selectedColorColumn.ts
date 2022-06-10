import Joi from 'joi';
import { getCategoricalColumns } from '../../helpers/data.js';
import type { DataMetaData, QTableConfigOptions, QTableDataRaw } from '../../interfaces';

export default {
  method: 'POST',
  path: '/dynamic-schema/selectedColorColumn',
  options: {
    validate: {
      payload: Joi.object(),
    },
  },
  handler: function (request, h): ReturnPayload {
    const item = request.payload.item as Payload;
    const settings = getDropdownSettings(item.data.table);

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
function getDropdownSettings(data: QTableDataRaw): DropdownSettings {
    // Default setting already added.
    const dropdownSettings: DropdownSettings = {
      ids: [null],
      titles: ['keine'],
    }

  // If data is available we all add all numeric columns to the dropdown.
  if (data.length > 0) {
    const columns = getCategoricalColumns(data);

    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];

      dropdownSettings.ids.push(column.index);
      dropdownSettings.titles.push(column.title);
    }
  }

  return dropdownSettings;
}

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

interface DropdownSettings {
  ids: (number | null)[],
  titles: string[],
}

interface ReturnPayload {
  enum: (number | null)[],
  'Q:options': {
    enum_titles: string[]
  },
}
