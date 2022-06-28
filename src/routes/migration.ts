import type { ResponseToolkit, Request, ServerRoute } from '@hapi/hapi';
import Joi from 'joi';
import * as migrationToV2 from '../migration-scripts/to-v2.0.0.js';
import * as migrationToV3 from '../migration-scripts/to-v3.0.0.js';

// register migration scripts here in order of version,
// i.e. list the smallest version first!
const migrationScripts = [
  migrationToV2,
  migrationToV3,
];

const route: ServerRoute = {
  method: 'POST',
  path: '/migration',
  options: {
    validate: {
      payload: {
        item: Joi.object().required()
      }
    }
  },
  handler: (request: Request, h: ResponseToolkit) => {
    const payload = request.payload as Payload;
    let item = payload.item;

    const results = migrationScripts.map(script => {
      const result = script.migrate(item);
      if (result.isChanged) {
        item = result.item;
      }
      return result;
    });

    const isChanged = results.findIndex(result => {
      return result.isChanged;
    });

    if (isChanged >= 0) {
      return {
        item: item
      };
    }

    return h.response().code(304);
  }
};

export default route;

interface Payload {
  item: unknown;
}
