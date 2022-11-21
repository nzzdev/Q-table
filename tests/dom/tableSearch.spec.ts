/**
 * @jest-environment jsdom
 */
 import * as fixtures from '../../resources/fixtures/data';
 import { elementCount, createMarkupWithScript, createServer } from '../helpers';

// https://github.com/prisma/prisma/issues/8558#issuecomment-1102176746
global.setImmediate = global.setImmediate || ((fn: () => unknown, ...args: []) => global.setTimeout(fn, 0, ...args));

describe('table search', () => {
  const getServer = createServer();

  it('shows table search', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.tableSearchShow,
        toolRuntimeConfig: {},
      },
    });

    const markup = createMarkupWithScript(response);

    elementCount(markup, '.q-table__search__input').then(value => {
      expect(value).toEqual(1);
    });
  });

  it("doesn't show table search", async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.tableSearchHidden,
        toolRuntimeConfig: {},
      },
    });

    const markup = createMarkupWithScript(response);

    elementCount(markup, '.q-table__search__input').then(value => {
      expect(value).toEqual(0);
    });
  });

  it("doesn't show table search if property is true but not enough elements", async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.tableSearchHidden,
        toolRuntimeConfig: {},
      },
    });

    const markup = createMarkupWithScript(response);

    elementCount(markup, '.q-table__search__input').then(value => {
      expect(value).toEqual(0);
    });
  });
});
