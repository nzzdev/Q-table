import Joi from 'joi';
const route = {
    method: 'POST',
    path: '/dynamic-schema/colorScheme',
    options: {
        validate: {
            payload: Joi.object(),
        },
    },
    handler: function (request) {
        const payload = request.payload;
        const options = payload.item.options;
        const numericalOptions = options.colorColumn.numericalOptions;
        if (numericalOptions.scale === 'sequential') {
            return {
                enum: ['one', 'two', 'three', 'female', 'male'],
                'Q:options': {
                    enum_titles: [
                        'Schema 1 (Standard)',
                        'Schema 2 (Standard-Alternative)',
                        'Schema 3 (negative Bedeutung)',
                        'Schema weiblich',
                        'Schema männlich',
                    ],
                },
            };
        }
        return {
            enum: ['one', 'two', 'three', 'gender'],
            'Q:options': {
                enum_titles: [
                    'Schema 1 (Standard negativ/positiv)',
                    'Schema 2 (neutral)',
                    'Schema 3 (Alternative negativ/positiv)',
                    'Schema weiblich/männlich',
                ],
            },
        };
    },
};
export default route;
