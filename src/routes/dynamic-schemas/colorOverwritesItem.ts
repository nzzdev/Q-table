import Joi from 'joi';
import { getNumberBuckets } from '../../helpers/colorColumn.js';
import { getDataWithoutHeaderRow, getUniqueCategoriesObject } from '../../helpers/data.js';
import type { ColorColumnSettings, DataMetaData, QTableConfigOptions, QTableDataRaw } from '../../interfaces';
import type { Request, ServerRoute } from '@hapi/hapi';

const route: ServerRoute = {
  method: 'POST',
  path: '/dynamic-schema/colorOverwritesItem',
  options: {
    validate: {
      payload: Joi.object(),
    },
  },
  handler: function (request: Request): ReturnPayload {
    const payload = request.payload as Payload;
    const item = payload.item;
    const data = item.data.table;

    const colorColumnSettings = item.options.colorColumn;
    const colorColumnType = colorColumnSettings.colorColumnType;

    if (colorColumnType === 'numerical') {
      return getDropdownSettingsNumerical(colorColumnSettings);
    } else {
      return getDropdownSettingsCategorical(data, colorColumnSettings);
    }
  },
};

export default route;

function getDropdownSettingsNumerical(colorColumnSettings: ColorColumnSettings): ReturnPayload {
  const ids: (number | null)[] = [null];
  const titles: string[] = [];
  const numberItems = getNumberBuckets(colorColumnSettings);

  for (let i = 0; i < numberItems; i++) {
    const id = i + 1;

    ids.push(id);
    titles.push(`${id}. Bucket `);
  }

  return {
    enum: ids,
    'Q:options': {
      enum_titles: titles,
    },
  };
}

function getDropdownSettingsCategorical(data: QTableDataRaw, colorColumnSettings: ColorColumnSettings): ReturnPayload {
  data = getDataWithoutHeaderRow(data);
  const categories = getUniqueCategoriesObject(data, colorColumnSettings).categories;

  const titles = [''];
  const enumValues: (number | null)[] = [null];

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const id = i + 1;
    const title = `${id} - ${category}`;

    enumValues.push(id);
    titles.push(title);
  }

  return {
    enum: enumValues,
    'Q:options': {
      enum_titles: titles,
    },
  };
}

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
  enum: (number | null)[];
  'Q:options': {
    enum_titles: string[];
  };
}
