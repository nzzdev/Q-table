"use strict";
exports.__esModule = true;
var path = require('path');
module.exports = {
    method: 'GET',
    path: '/stylesheet/{filename}.{hash}.{extension}',
    options: {
        files: {
            relativeTo: path.join(__dirname, '/../dist/styles/')
        }
    },
    handler: function (request, h) {
        return h.file("".concat(request.params.filename, ".").concat(request.params.extension));
        // .type('text/css')
        // .header('cache-control', `max-age=${60 * 60 * 24 * 365}, immutable`); // 1 year
    }
};
