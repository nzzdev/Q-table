import Boom from '@hapi/boom';
import Joi from 'joi';
import { getNumericColumns } from '../helpers/data.js';
import { getMinibarNumbersWithType } from '../helpers/minibars.js';
import { hasCustomBuckets } from '../helpers/colorColumn.js';
import type { AvailabilityResponseObject, WebPayload } from '../interfaces';
import type { Request } from '@hapi/hapi';

export default {
  method: 'POST',
  path: '/option-availability/{optionName}',
  options: {
    validate: {
      payload: Joi.object(),
    },
  },
  handler: function (request: Request): AvailabilityResponseObject | Boom.Boom {
    const payload = request.payload as WebPayload;
    const item = payload.item;
    const optionName = request.params.optionName as string;

    if (optionName === 'cardLayoutIfSmall') {
      return {
        available: !item.options.cardLayout,
      };
    }

    if (optionName === 'showTableSearch') {
      return {
        available: item.data.table.length > 16,
      };
    }

    if (optionName === 'minibars' || optionName === 'selectedColumnMinibar') {
      let isAvailable = false;

      if (item.data.table.length !== 0) {
        if (!item.options.cardLayout && item.data.table[0].length >= 2 && getNumericColumns(item.data.table).length >= 1) {
          isAvailable = true;
        }
      }
      return {
        available: isAvailable,
      };
    }

    // properties minibar
    if (item.options.minibar !== null && item.options.minibar !== undefined) {
      if (optionName === 'barColor') {
        const isAvailable = item.options.minibar.selectedColumn !== null && item.options.minibar.selectedColumn !== undefined;
        return {
          available: isAvailable,
        };
      }

      if (optionName === 'barColorPositive') {
        if (typeof item.options.minibar.selectedColumn === 'number') {
          const type = getMinibarNumbersWithType(item.data.table, item.options.minibar.selectedColumn).type;

          return {
            available: type === 'mixed' || type === 'positive',
          };
        }
      }

      if (optionName === 'barColorNegative') {
        if (typeof item.options.minibar.selectedColumn === 'number') {
          const type = getMinibarNumbersWithType(item.data.table, item.options.minibar.selectedColumn).type;

          return {
            available: type === 'mixed' || type === 'negative',
          };
        }
      }

      if (optionName === 'invertColors') {
        if (typeof item.options.minibar.selectedColumn === 'number') {
          const type = getMinibarNumbersWithType(item.data.table, item.options.minibar.selectedColumn).type;

          return {
            available: type === 'mixed',
          };
        }
      }
    }

    if (optionName === 'colorColumn' || optionName === 'selectedColorColumn') {
      let isAvailable = false;

      if (item.data.table.length > 2) {
        if (!item.options.cardLayout && item.data.table[0].length >= 2 && item.data.table.length >= 1) {
          isAvailable = true;
        }
      }
      return {
        available: isAvailable,
      };
    }

    // properties colorColumn
    if (item.options.colorColumn !== null && item.options.colorColumn !== undefined) {
      if (optionName === 'isNumerical') {
        return {
          available: item.options.colorColumn.selectedColumn !== null && item.options.colorColumn.colorColumnType === 'numerical',
        };
      }

      if (optionName === 'isCategorical') {
        return {
          available: item.options.colorColumn.selectedColumn !== null && item.options.colorColumn.colorColumnType === 'categorical',
        };
      }

      if (['colorColumnType', 'bucketType', 'colorScale', 'colorOverwritesItem', 'colorScheme', 'customCategoriesOrder'].includes(optionName)) {
        return {
          available: item.options.colorColumn.selectedColumn !== null && item.options.colorColumn.selectedColumn !== undefined,
        };
      }

      if (optionName === 'customBuckets') {
        let isAvailable = item.options.colorColumn.selectedColumn !== null && item.options.colorColumn.selectedColumn !== undefined;
        if (isAvailable) {
          isAvailable = hasCustomBuckets(item.options.colorColumn.numericalOptions.bucketType);
        }
        return {
          available: isAvailable,
        };
      }

      if (optionName === 'numberBuckets') {
        let isAvailable = item.options.colorColumn.selectedColumn !== null && item.options.colorColumn.selectedColumn !== undefined;
        if (isAvailable) {
          isAvailable = !hasCustomBuckets(item.options.colorColumn.numericalOptions.bucketType);
        }
        return {
          available: isAvailable,
        };
      }

      if (optionName === 'customColors') {
        let isAvailable = item.options.colorColumn.selectedColumn !== null && item.options.colorColumn.selectedColumn !== undefined;
        if (isAvailable) {
          isAvailable = item.options.colorColumn.numericalOptions.scale === 'sequential' || item.options.colorColumn.colorColumnType === 'categorical';
        }
        return {
          available: isAvailable,
        };
      }
    }

    return Boom.badRequest();
  },
};
