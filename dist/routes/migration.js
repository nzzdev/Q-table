var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Joi from 'joi';
import * as migrationToV2 from '../migration-scripts/to-v2.0.0.js';
import * as migrationToV3 from '../migration-scripts/to-v3.0.0.js';
// register migration scripts here in order of version,
// i.e. list the smallest version first!
const migrationScripts = [
    migrationToV2,
    migrationToV3,
];
const route = {
    method: 'POST',
    path: '/migration',
    options: {
        validate: {
            payload: {
                item: Joi.object().required()
            }
        }
    },
    handler: (request, h) => __awaiter(void 0, void 0, void 0, function* () {
        const payload = request.payload;
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
    })
};
export default route;
