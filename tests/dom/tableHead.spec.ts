/**
 * @jest-environment jsdom
 */
import * as fixtures from '../../resources/fixtures/data';
import { elementCount, createMarkupWithScript, createServer } from '../helpers';

// https://github.com/prisma/prisma/issues/8558#issuecomment-1102176746
global.setImmediate = global.setImmediate || ((fn: () => unknown, ...args: []) => global.setTimeout(fn, 0, ...args));

describe('column headers', () => {
  const getServer = createServer();

  it('shows column headers', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.fourColumn,
        toolRuntimeConfig: {},
      },
    });

    const markup = createMarkupWithScript(response);

    elementCount(markup, '.qtable-th').then(value => expect(value).toEqual(4));
  });

  it("doesn't show column headers", async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.fourColumnNoHeader,
        toolRuntimeConfig: {},
      },
    });

    const markup = createMarkupWithScript(response);

    elementCount(markup, '.qtable-th').then(value => expect(value).toEqual(0));
  });
});
