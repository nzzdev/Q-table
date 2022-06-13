import Joi from 'joi';
import { getDataWithoutHeaderRow, getUniqueCategoriesCount } from '../../helpers/data.js';
const route = {
    method: 'POST',
    path: '/dynamic-schema/customCategoriesOrder',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const data = getDataWithoutHeaderRow(item.data.table);
        const colorColumnSettings = item.options.colorColumn;
        return {
            maxItems: getUniqueCategoriesCount(data, colorColumnSettings),
        };
    },
};
export default route;
