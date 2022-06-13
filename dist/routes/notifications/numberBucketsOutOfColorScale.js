import Joi from 'joi';
import * as colorColumnHelpers from '../../helpers/colorColumn.js';
const sequentialScaleMax = 7;
const divergingScaleMax = sequentialScaleMax * 2;
const route = {
    method: 'POST',
    path: '/notification/numberBucketsOutOfColorScale',
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
            const { colorColumnType, numericalOptions } = colorColumnSettings;
            let scale = numericalOptions.scale;
            if (colorColumnType === 'numerical') {
                let numberBuckets = colorColumnHelpers.getNumberBuckets(colorColumnSettings);
                if (scale === 'sequential' && numberBuckets > sequentialScaleMax) {
                    return {
                        message: {
                            title: 'notifications.numberBucketsOutOfColorScale.title',
                            body: 'notifications.numberBucketsOutOfColorScale.body',
                        },
                    };
                }
                else {
                    const a = scale;
                    const divergingSpec = scale.split('-');
                    const divergingType = divergingSpec[0];
                    const divergingIndex = parseInt(divergingSpec[1]);
                    const numberBucketsLeft = divergingIndex;
                    let numberBucketsRight = numberBuckets - divergingIndex;
                    if (divergingType === "bucket" /* DivergingType.BUCKET */) {
                        numberBucketsRight -= 1;
                    }
                    const numberBucketsBiggerSide = Math.max(numberBucketsLeft, numberBucketsRight);
                    let scaleSize = numberBucketsBiggerSide * 2;
                    if (divergingType === "bucket" /* DivergingType.BUCKET */) {
                        scaleSize += 1;
                    }
                    if (scaleSize > divergingScaleMax) {
                        return {
                            message: {
                                title: 'notifications.numberBucketsOutOfColorScale.title',
                                body: 'notifications.numberBucketsOutOfColorScale.body',
                            },
                        };
                    }
                }
            }
        }
        catch (err) {
            console.log('Error processing /notification/numberBucketsOutOfColorScale', err);
        }
        return null;
    },
};
export default route;
