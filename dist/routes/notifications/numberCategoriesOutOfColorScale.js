import Joi from "joi";
import * as dataHelpers from '../../helpers/data.js';
import { digitWords } from '../../helpers/colorColumnColor.js';
const numberMainColors = digitWords.length;
export default {
    method: "POST",
    path: "/notification/numberCategoriesOutOfColorScale",
    options: {
        validate: {
            options: {
                allowUnknown: true,
            },
            payload: Joi.object().required(),
        },
        tags: ["api"],
    },
    handler: function (request, h) {
        try {
            const item = request.payload.item;
            if (item.options.colorColumn.colorColumnType === "categorical") {
                // removing the header row first
                item.data = dataHelpers.getDataWithoutHeaderRow(item.data);
                const numberUniqueValues = dataHelpers.getUniqueCategoriesCount(item.data.table, item.options.colorColumn);
                if (numberUniqueValues > numberMainColors) {
                    return {
                        message: {
                            title: "notifications.numberCategoriesOutOfColorScale.title",
                            body: "notifications.numberCategoriesOutOfColorScale.body",
                        },
                    };
                }
            }
            return null;
        }
        catch (err) {
            return null;
        }
    },
};
