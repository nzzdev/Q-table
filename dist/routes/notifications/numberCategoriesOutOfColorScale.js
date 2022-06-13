import Joi from 'joi';
import { getDataWithoutHeaderRow, getUniqueCategoriesCount } from '../../helpers/data.js';
import { digitWords } from '../../helpers/colorColumnColor.js';
const numberMainColors = digitWords.length;
const route = {
    method: 'POST',
    path: '/notification/numberCategoriesOutOfColorScale',
    options: {
        validate: {
            options: {
                allowUnknown: true,
            },
            payload: Joi.object().required(),
        },
        tags: ['api'],
    },
    handler: function (request) {
        try {
            const payload = request.payload;
            const item = payload.item;
            const colorColumnSettings = item.options.colorColumn;
            if (item.options.colorColumn.colorColumnType === 'categorical') {
                const tableData = getDataWithoutHeaderRow(item.data.table);
                const numberUniqueValues = getUniqueCategoriesCount(tableData, colorColumnSettings);
                if (numberUniqueValues > numberMainColors) {
                    return {
                        message: {
                            title: 'notifications.numberCategoriesOutOfColorScale.title',
                            body: 'notifications.numberCategoriesOutOfColorScale.body',
                        },
                    };
                }
            }
        }
        catch (err) {
            console.log('Error processing /notification/numberCategoriesOutOfColorScale', err);
        }
        return null;
    },
};
export default route;
