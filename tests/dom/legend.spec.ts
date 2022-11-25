import * as fixtures from '../../resources/fixtures/data';
import { elementCount, createServer } from '../helpers';

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

    elementCount(response, '.q-table-legend-container').then(
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

    elementCount(response, '.q-table-legend-container').then(
      value => expect(value).toEqual(0)
    );
  });

  // Write tests that tests the exact legend entries are served correctly.
});
