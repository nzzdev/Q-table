import { badRequest } from '@hapi/boom';
import Joi from 'joi';
export default {
    method: 'POST',
    path: '/dynamic-schema/{optionName}',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request, h) {
        const item = request.payload.item;
        const optionName = request.params.optionName;
        if (optionName === 'customCategoriesOrderItem') {
            return getCustomCategoriesOrderEnumAndTitlesCategorical(item.data.table, item.options.colorColumn);
        }
        return badRequest();
    },
};
