import * as fixtures from '../../resources/fixtures/data';
import { elementCount, createServer } from '../helpers';

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

    elementCount(response, '.qtable-th').then(value => expect(value).toEqual(4));
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

    elementCount(response, '.qtable-th').then(value => expect(value).toEqual(0));
  });
});
