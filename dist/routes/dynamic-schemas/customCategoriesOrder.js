import Joi from 'joi';
import { getDataWithoutHeaderRow, getUniqueCategoriesCount } from '../../helpers/data.js';
export default {
    method: 'POST',
    path: '/dynamic-schema/customCategoriesOrder',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request, h) {
        const item = request.payload.item;
        const data = getDataWithoutHeaderRow(item.data.table);
        const colorColumnSettings = item.options.colorColumn;
        return {
            maxItems: getUniqueCategoriesCount(data, colorColumnSettings),
        };
    },
};
