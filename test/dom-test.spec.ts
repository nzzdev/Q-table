// const Joi = require('joi');

import { JSDOM } from 'jsdom';
import Hapi from'@hapi/hapi';
import Joi from 'Joi';
import type { ResponseToolkit, Request, ServerRoute } from '@hapi/hapi';

function elementCount(markup: string, selector: string) {
  return new Promise((resolve, reject) => {
    const dom = new JSDOM(markup);
    resolve(dom.window.document.querySelectorAll(selector).length);
  });
}

let server: Hapi.Server;

// @ts-ignore
// import routes from '../dist/routes/routes.js';

import routes2 from '../dist/routes.js';

// const routes: ServerRoute[] = [];

beforeAll(async () => {
  try {
    server = Hapi.server({
      port: process.env.PORT || 3000,
    });
    server.validator(Joi);
    server.route(routes2);
  } catch (err) {
    expect(err).not.toBeDefined();
  }
});

import someObject from '../resources/fixtures/data/four-column.json';

describe('column headers', () => {
  it('shows column headers', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        // item: require('../resources/fixtures/data/four-column.json'),
        item: someObject,
        toolRuntimeConfig: {},
      },
    });

    // @ts-ignore
    const markup = response.result.markup as unknown as string;


    console.log(response.result);

    elementCount(markup, '.q-table-cell--head').then(
      (value) => {
        expect(value).toEqual(4);
      }
    );
  });
});
