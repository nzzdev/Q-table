import { dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Request, ResponseToolkit, ServerRoute } from '@hapi/hapi'

const __dirname = dirname(fileURLToPath(import.meta.url));
const resourcesDir = __dirname + '/../../resources/';


const schemaRoute: ServerRoute = {
  method: 'GET',
  path: '/schema.json',
  handler: function(request: Request, h: ResponseToolkit) {
    return h.file(resourcesDir + 'schema.json');
  }
}

const displayOptionsRoute: ServerRoute = {
  method: 'GET',
  path: '/display-options-schema.json',
  handler: function(request: Request, h: ResponseToolkit) {
    return h.file(resourcesDir + 'display-options-schema.json');
  }
}

export default [
  schemaRoute,
  displayOptionsRoute,
];
