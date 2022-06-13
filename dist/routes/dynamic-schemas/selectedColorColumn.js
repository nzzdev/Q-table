import Joi from 'joi';
import { getCategoricalColumns } from '../../helpers/data.js';
const route = {
    method: 'POST',
    path: '/dynamic-schema/selectedColorColumn',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const item = payload.item;
        const settings = getDropdownSettings(item.data.table);
        return {
            enum: settings.ids,
            'Q:options': {
                enum_titles: settings.titles,
            },
        };
    },
};
export default route;
/**
 * Internal.
 */
function getDropdownSettings(data) {
    // Default setting already added.
    const dropdownSettings = {
        ids: [null],
        titles: ['keine'],
    };
    // If data is available we all add all numeric columns to the dropdown.
    if (data.length > 0) {
        const columns = getCategoricalColumns(data);
        for (let i = 0; i < columns.length; i++) {
            const column = columns[i];
            dropdownSettings.ids.push(column.index);
            dropdownSettings.titles.push(column.title);
        }
    }
    return dropdownSettings;
}
