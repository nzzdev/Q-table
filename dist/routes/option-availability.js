import Boom from '@hapi/boom';
import Joi from 'joi';
import { getNumericColumns } from '../helpers/data.js';
import { getMinibarNumbersWithType } from '../helpers/minibars.js';
import { hasCustomBuckets } from '../helpers/colorColumn.js';
export default {
    method: "POST",
    path: "/option-availability/{optionName}",
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request, h) {
        const item = request.payload.item;
        const optionName = request.params.optionName;
        if (optionName === "cardLayoutIfSmall") {
            return {
                available: !item.options.cardLayout,
            };
        }
        if (optionName === "showTableSearch") {
            return {
                available: item.data.table.length > 16,
            };
        }
        if (optionName === "minibars" || optionName === "selectedColumnMinibar") {
            let isAvailable = false;
            if (item.data.table.length !== 0) {
                if (!item.options.cardLayout &&
                    item.data.table[0].length >= 2 &&
                    getNumericColumns(item.data.table).length >= 1) {
                    isAvailable = true;
                }
            }
            return {
                available: isAvailable,
            };
        }
        // properties minibar
        if (item.options.minibar !== null && item.options.minibar !== undefined) {
            if (optionName === "barColor") {
                let isAvailable = item.options.minibar.selectedColumn !== null &&
                    item.options.minibar.selectedColumn !== undefined;
                return {
                    available: isAvailable,
                };
            }
            if (optionName === "barColorPositive") {
                let isAvailable = item.options.minibar.selectedColumn !== null &&
                    item.options.minibar.selectedColumn !== undefined;
                if (isAvailable) {
                    let type = getMinibarNumbersWithType(item.data.table, item.options.minibar.selectedColumn).type;
                    isAvailable = type === "mixed" || type === "positive";
                }
                return {
                    available: isAvailable,
                };
            }
            if (optionName === "barColorNegative") {
                let isAvailable = item.options.minibar.selectedColumn !== null &&
                    item.options.minibar.selectedColumn !== undefined;
                if (isAvailable) {
                    let type = getMinibarNumbersWithType(item.data.table, item.options.minibar.selectedColumn).type;
                    isAvailable = type === "mixed" || type === "negative";
                }
                return {
                    available: isAvailable,
                };
            }
            if (optionName === "invertColors") {
                let isAvailable = item.options.minibar.selectedColumn !== null &&
                    item.options.minibar.selectedColumn !== undefined;
                if (isAvailable) {
                    let type = getMinibarNumbersWithType(item.data.table, item.options.minibar.selectedColumn).type;
                    isAvailable = type === "mixed";
                }
                return {
                    available: isAvailable,
                };
            }
        }
        if (optionName === "colorColumn" || optionName === "selectedColorColumn") {
            let isAvailable = false;
            if (item.data.table.length > 2) {
                if (!item.options.cardLayout &&
                    item.data.table[0].length >= 2 &&
                    item.data.table.length >= 1) {
                    isAvailable = true;
                }
            }
            return {
                available: isAvailable,
            };
        }
        // properties colorColumn
        if (item.options.colorColumn !== null &&
            item.options.colorColumn !== undefined) {
            if (optionName === "isNumerical") {
                return {
                    available: item.options.colorColumn.selectedColumn !== null &&
                        item.options.colorColumn.colorColumnType === "numerical",
                };
            }
            if (optionName === "isCategorical") {
                return {
                    available: item.options.colorColumn.selectedColumn !== null &&
                        item.options.colorColumn.colorColumnType === "categorical",
                };
            }
            if ([
                "colorColumnType",
                "bucketType",
                "scale",
                "colorOverwritesItem",
                "colorScheme",
                "customCategoriesOrder",
            ].includes(optionName)) {
                return {
                    available: item.options.colorColumn.selectedColumn !== null &&
                        item.options.colorColumn.selectedColumn !== undefined,
                };
            }
            if (optionName === "customBuckets") {
                let isAvailable = item.options.colorColumn.selectedColumn !== null &&
                    item.options.colorColumn.selectedColumn !== undefined;
                if (isAvailable) {
                    isAvailable = hasCustomBuckets(item.options.colorColumn.numericalOptions.bucketType);
                }
                return {
                    available: isAvailable,
                };
            }
            if (optionName === "numberBuckets") {
                let isAvailable = item.options.colorColumn.selectedColumn !== null &&
                    item.options.colorColumn.selectedColumn !== undefined;
                if (isAvailable) {
                    isAvailable = !hasCustomBuckets(item.options.colorColumn.numericalOptions.bucketType);
                }
                return {
                    available: isAvailable,
                };
            }
            if (optionName === "customColors") {
                let isAvailable = item.options.colorColumn.selectedColumn !== null &&
                    item.options.colorColumn.selectedColumn !== undefined;
                if (isAvailable) {
                    isAvailable =
                        item.options.colorColumn.numericalOptions.scale === "sequential" ||
                            item.options.colorColumn.colorColumnType === "categorical";
                }
                return {
                    available: isAvailable,
                };
            }
        }
        return Boom.badRequest();
    },
};
