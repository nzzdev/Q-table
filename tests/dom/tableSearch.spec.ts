import * as fixtures from '../../resources/fixtures/data';
import { elementCount, createServer } from '../helpers';

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

    elementCount(response, '.q-table__search__input').then(value => {
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

    elementCount(response, '.q-table__search__input').then(value => {
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

    elementCount(response, '.q-table__search__input').then(value => {
      expect(value).toEqual(0);
    });
  });
});
