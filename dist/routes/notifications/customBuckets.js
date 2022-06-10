import Joi from 'joi';
import { getCustomBucketBorders, getDataWithoutHeaderRow, getNumericalValuesByColumn, getNonNullValues, getMetaData } from '../../helpers/data.js';
export default {
    method: 'POST',
    path: '/notification/customBuckets',
    options: {
        validate: {
            options: {
                allowUnknown: true,
            },
            payload: Joi.object().required(),
        },
        tags: ['api'],
    },
    handler: function (request, h) {
        try {
            const item = request.payload.item;
            // removing the header row first
            item.data.table = getDataWithoutHeaderRow(item.data.table);
            if (item.options.colorColumn.bucketType === 'custom') {
                const bucketBorders = getCustomBucketBorders(item.options.colorColumn.customBuckets);
                const values = getNumericalValuesByColumn(item.data.table, item.options.colorColumn.selectedColumn);
                const numberValues = getNonNullValues(values);
                const metaData = getMetaData(values, numberValues, 0);
                if (bucketBorders[0] > metaData.minValue ||
                    bucketBorders[bucketBorders.length - 1] < metaData.maxValue) {
                    return {
                        message: {
                            title: 'notifications.customBuckets.title',
                            body: 'notifications.customBuckets.body',
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
