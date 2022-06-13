import Joi from 'joi';
import { getNumberBuckets } from '../../helpers/colorColumn.js';
import { getDataWithoutHeaderRow, getUniqueCategoriesCount } from '../../helpers/data.js';
const route = {
    method: 'POST',
    path: '/dynamic-schema/colorOverwrites',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const data = item.data.table;
        const colorColumnSettings = item.options.colorColumn;
        const colorColumnType = colorColumnSettings.colorColumnType;
        if (colorColumnType === 'numerical') {
            return getMaxItemsNumerical(colorColumnSettings);
        }
        else {
            return getMaxItemsCategorical(data, colorColumnSettings);
        }
    },
};
export default route;
function getMaxItemsNumerical(colorColumnSettings) {
    return {
        maxItems: getNumberBuckets(colorColumnSettings),
    };
}
function getMaxItemsCategorical(data, colorColumnSettings) {
    try {
        data = getDataWithoutHeaderRow(data);
        return {
            maxItems: getUniqueCategoriesCount(data, colorColumnSettings),
        };
    }
    catch (_a) {
        return {
            maxItems: undefined,
        };
    }
}
