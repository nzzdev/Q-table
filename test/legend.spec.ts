import Hapi from'@hapi/hapi';
import Joi from 'joi';
import * as fixtures from '../resources/fixtures/data';
import { elementCount } from './helpers';
import { getMarkup } from './helpers';

let server: Hapi.Server;

// @ts-ignore
import routes from '../dist/routes.js';

// Start the server before the tests.
beforeAll(async () => {
  try {
    server = Hapi.server({
      port: process.env.PORT || 3000,
    });
    server.validator(Joi);
    server.route(routes);
  } catch (err) {
    expect(err).not.toBeDefined();
  }
});

afterAll(async () => {
  await server.stop({ timeout: 2000 });

  // @ts-ignore.
  server = null;
});

describe('legend', () => {
  it('shows the legend', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.legendShown,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table-legend-container').then(
      value => expect(value).toEqual(1)
    );
  });

  it('does not show legend when hidden', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.legendHidden,
        toolRuntimeConfig: {},
      },
    });

    const markup = getMarkup(response.result);

    elementCount(markup, '.q-table-legend-container').then(
      value => expect(value).toEqual(0)
    );
  });
});
