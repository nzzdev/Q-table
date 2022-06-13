import Joi from 'joi';
import { getDataWithoutHeaderRow, getUniqueCategoriesObject } from '../../helpers/data.js';
const route = {
    method: 'POST',
    path: '/dynamic-schema/customCategoriesOrderItem',
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
        const categories = getUniqueCategoriesObject(data, colorColumnSettings).categories;
        return {
            enum: categories,
            'Q:options': {
                enum_titles: categories,
            },
        };
    },
};
export default route;
