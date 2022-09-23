import Joi from 'joi';
import { getNumberBuckets } from '../../helpers/colorColumn.js';
import { getDataWithoutHeaderRow, getUniqueCategoriesCount } from '../../helpers/data.js';
import type { ColorColumnSettings, DataMetaData, QTableConfigOptions, QTableDataRaw } from '../../interfaces';
import type { Request, ServerRoute } from '@hapi/hapi';

const route: ServerRoute = {
  method: 'POST',
  path: '/dynamic-schema/colorOverwrites',
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
      return getMaxItemsNumerical(colorColumnSettings);
    } else {
      return getMaxItemsCategorical(data, colorColumnSettings);
    }
  },
};

export default route;

function getMaxItemsNumerical(colorColumnSettings: ColorColumnSettings): ReturnPayload {
  return {
    maxItems: getNumberBuckets(colorColumnSettings),
  };
}

function getMaxItemsCategorical(data: QTableDataRaw, colorColumnSettings: ColorColumnSettings): ReturnPayload {
  try {
    data = getDataWithoutHeaderRow(data);

    return {
      maxItems: getUniqueCategoriesCount(data, colorColumnSettings),
    };
  } catch {
    return {
      maxItems: undefined,
    };
  }
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
  maxItems: undefined | number;
}
