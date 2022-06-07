import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const resourcesDir = __dirname + '/../../resources/';
export default [
    {
        method: 'GET',
        path: '/schema.json',
        handler: function (request, h) {
            return h.file(resourcesDir + 'schema.json');
        }
    },
    {
        method: 'GET',
        path: '/display-options-schema.json',
        handler: function (request, h) {
            return h.file(resourcesDir + 'display-options-schema.json');
        }
    }
];
