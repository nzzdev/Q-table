const path = require('path');
import type { IReply, Request } from 'hapi';

module.exports = {
  method: 'GET',
  path: '/stylesheet/{filename}.{hash}.{extension}',
  options: {
    files: {
      relativeTo: path.join(__dirname, '/../dist/styles/')
    }
  },
  handler: function(request: Request, h) {
    return h.file(`${request.params.filename}.${request.params.extension}`);
      .type('text/css')
      .header('cache-control', `max-age=${60 * 60 * 24 * 365}, immutable`); // 1 year
  }
};
