/**
 * @jest-environment jsdom
 */
 import * as fixtures from '../../resources/fixtures/data';
 import {
  elementCount,
  createMarkupWithScript,
  createServer,
} from '../helpers';

// https://github.com/prisma/prisma/issues/8558#issuecomment-1102176746
global.setImmediate = global.setImmediate || ((fn: () => unknown, ...args: []) => global.setTimeout(fn, 0, ...args));

describe('legend', () => {
  const getServer = createServer();

  it('shows the legend', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.legendShown,
        toolRuntimeConfig: {},
      },
    });

    const markup = createMarkupWithScript(response);

    elementCount(markup, '.q-table-legend-container').then(
      value => expect(value).toEqual(1)
    );
  });

  it('does not show legend when hidden', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.legendHidden,
        toolRuntimeConfig: {},
      },
    });

    const markup = createMarkupWithScript(response);

    elementCount(markup, '.q-table-legend-container').then(
      value => expect(value).toEqual(0)
    );
  });

  // Write tests that tests the exact legend entries are served correctly.
});