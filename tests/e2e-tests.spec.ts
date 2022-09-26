/**
 * @jest-environment jsdom
 */
import Hapi from '@hapi/hapi';
import Joi from 'joi';
import * as fixtures from '../resources/fixtures/data';
import { getAvailabilityResponse, getMarkup, getScripts, getStylesheets } from './helpers';
import type { SelectedColumnMinibarReturnPayload } from '../src/routes/dynamic-schemas/selectedColumnMinibar';
import type { SelectedColorColumnReturnPayload } from '../src/routes/dynamic-schemas/selectedColorColumn';

// We ignore because this will be built before you run the tests.
// @ts-ignore
import routes from '../dist/routes.js';

// https://github.com/prisma/prisma/issues/8558#issuecomment-1102176746
global.setImmediate = global.setImmediate || ((fn: () => unknown, ...args: []) => global.setTimeout(fn, 0, ...args));
let server: Hapi.Server;

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

describe('basics', () => {
  it('starts the server', () => {
    expect(server.info.created).toEqual(expect.any(Number));
  });

  it('is healthy', async () => {
    const response = await server.inject('/health');
    expect(response.payload).toEqual('ok');
  });
});

describe('rendering-info/web', () => {
  it('renders a table', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.fourColumnNoHeader,
        toolRuntimeConfig: {},
      },
    });

    expect(response.statusCode).toEqual(200);

    const markup = getMarkup(response.result);
    const stylesheets = getStylesheets(response.result);
    const scripts = getScripts(response.result);

    const foundMarkupId = markup.includes('id="q_table_someid_');
    const foundMarkupClass = markup.includes('class="q-table-container"');
    expect(foundMarkupId).toBe(true);
    expect(foundMarkupClass).toBe(true);

    const foundStylesheet = stylesheets[0].name.startsWith('q-table.');
    expect(foundStylesheet).toBe(true);

    expect(scripts[0].content).toEqual(expect.any(String));
  });

  it('returns 400 if no payload given', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
    });
    expect(response.statusCode).toEqual(400);
  });

  it('returns 400 if no item given in payload', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.fourColumnNoHeader,
      },
    });
    expect(response.statusCode).toEqual(400);
  });

  it('returns 400 if no toolRuntimeConfig given in payload', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        toolRuntimeConfig: {},
      },
    });
    expect(response.statusCode).toEqual(400);
  });

  it('returns 400 if invalid item given', async () => {
    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: { foo: 'bar' },
        toolRuntimeConfig: {},
      },
    });
    expect(response.statusCode).toEqual(400);
  });
});

describe('migration endpoint', () => {
  it('returns 304 for /migration', async () => {
    const request = {
      method: 'POST',
      url: '/migration',
      payload: {
        item: fixtures.minibarsNegative,
      },
    };
    const response = await server.inject(request);
    expect(response.statusCode).toEqual(304);
  });
});

describe('option availability endpoint', () => {
  it('returns true for option availability of minibar selectedColumn', async () => {
    const request = {
      method: 'POST',
      url: '/option-availability/selectedColumnMinibar',
      payload: {
        item: fixtures.minibarsMixed,
      },
    };

    const response = await server.inject(request);

    const available = getAvailabilityResponse(response.result);
    expect(available).toEqual(true);
  });

  it('returns true for option availability of minibar selectedColumn', async () => {
    const request = {
      method: 'POST',
      url: '/option-availability/selectedColumnMinibar',
      payload: {
        item: fixtures.twoColumn,
      },
    };
    const response = await server.inject(request);

    const available = getAvailabilityResponse(response.result);
    expect(available).toEqual(true);
  });

  it('Minibar is not available from a certain number of columns', async () => {
    const request = {
      method: 'POST',
      url: '/option-availability/selectedColumnMinibar',
      payload: {
        item: fixtures.oneColumn,
      },
    };
    const response = await server.inject(request);

    const available = getAvailabilityResponse(response.result);
    expect(available).toEqual(false);
  });

  it('returns true for option availability of colorColumn selectedColumn', async () => {
    const request = {
      method: 'POST',
      url: '/option-availability/selectedColorColumn',
      payload: {
        item: fixtures.colorColumnNumerical,
      },
    };
    const response = await server.inject(request);

    const available = getAvailabilityResponse(response.result);
    expect(available).toEqual(true);
  });

  it('returns true for option availability of colorColumn selectedColumn', async () => {
    const request = {
      method: 'POST',
      url: '/option-availability/selectedColorColumn',
      payload: {
        item: fixtures.twoColumn,
      },
    };
    const response = await server.inject(request);

    const available = getAvailabilityResponse(response.result);
    expect(available).toEqual(true);
  });

  it('ColorColumn is not available from a certain number of columns', async () => {
    const request = {
      method: 'POST',
      url: '/option-availability/selectedColorColumn',
      payload: {
        item: fixtures.oneColumn,
      },
    };
    const response = await server.inject(request);

    const available = getAvailabilityResponse(response.result);
    expect(available).toEqual(false);
  });
});

describe('dynamic schema endpoint', () => {
  it('returns enums of minibar selectedColumn', async () => {
    const request = {
      method: 'POST',
      url: '/dynamic-schema/selectedColumnMinibar',
      payload: {
        item: fixtures.minibarsNegative,
      },
    };

    const response = await server.inject(request);

    const result = response.result as SelectedColumnMinibarReturnPayload;

    expect(result.enum).toEqual([null, 1, 2, 3]);
    expect(result['Q:options'].enum_titles).toEqual(['keine', '2016', '2017', '+/- %']);
  });

  it('returns enums of colorColumn selectedColumn', async () => {
    const request = {
      method: 'POST',
      url: '/dynamic-schema/selectedColorColumn',
      payload: {
        item: fixtures.colorColumnNumerical,
      },
    };

    const response = await server.inject(request);
    const result = response.result as SelectedColorColumnReturnPayload;

    expect(result.enum).toEqual([null, 0, 1, 2, 3]);
    expect(result['Q:options'].enum_titles).toEqual(['keine', 'String', 'Number', 'Number', 'String']);
  });
});

describe('fixture data endpoint', () => {
  it('returns fixture data items for /fixtures/data', async () => {
    const response = await server.inject('/fixtures/data');
    expect(response.statusCode).toEqual(200);
  });
});
