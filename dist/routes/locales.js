import Joi from 'joi';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = __dirname + '/../../resources/locales/';
export default {
    path: '/locales/{lng}/translation.json',
    method: 'GET',
    options: {
        description: 'Returns translations for given language',
        tags: ['api'],
        validate: {
            params: {
                lng: Joi.string().required()
            }
        }
    },
    handler: (request, h) => {
        return h
            .file(localesDir + request.params.lng + '/translation.json')
            .type('application/json');
    }
};
