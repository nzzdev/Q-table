import type { Request, ServerRoute } from '@hapi/hapi';
import Joi from 'joi';
import type { DataMetaData, QTableConfigOptions, QTableDataRaw } from '../../interfaces';

// TODO Refactor common functionality with selectedColorColum.ts and selectedColumnMinibar.ts
const route: ServerRoute = {
  method: 'POST',
  path: '/dynamic-schema/selectedFrozenRow',
  options: {
    validate: {
      payload: Joi.object(),
    },
  },
  handler: function (request: Request): SelectedFrozenRowPossibilities {
    const payload = request.payload as Payload;
    const item = payload.item;

    const settings = getFrozenRowDropdownSettings(item.data.table);

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
const getFrozenRowDropdownSettings = (data: QTableDataRaw): DropdownSettings => {
  // Default setting already added.
  const dropdownSettings: DropdownSettings = {
    ids: [null],
    titles: ['keine'],
  };

  // Omit if data only contains a title row
  if (data.length > 1) {
    const [, ...rows]: QTableDataRaw = data
    dropdownSettings.ids = dropdownSettings.ids.concat(rows.map((d, i) => i))
    dropdownSettings.titles = dropdownSettings.titles.concat(rows.map((d, i) => (i + 2).toString()))
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

export interface SelectedFrozenRowPossibilities {
  enum: (number | null)[];
  'Q:options': {
    enum_titles: string[];
  };
}
