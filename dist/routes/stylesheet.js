// The references is required to register the inert extension onto hapi__hapi so that
// the h.file line is registered correctly by typescript.
/// <reference path="../../node_modules/@types/hapi__inert/index.d.ts"/>
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
export default {
    method: 'GET',
    path: '/stylesheet/{filename}.{hash}.{extension}',
    options: {
        files: {
            relativeTo: path.join(__dirname, '/../styles/')
        }
    },
    handler: function (request, h) {
        return h.file(`${request.params.filename}.${request.params.extension}`)
            .type('text/css')
            .header('cache-control', `max-age=${60 * 60 * 24 * 365}, immutable`); // 1 year
    }
};
