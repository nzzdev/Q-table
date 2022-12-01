import * as fixtures from '../../resources/fixtures/data';
import { createServer, elements } from '../helpers';

const fourEmSpaceCharCode = 8197;

describe('formatting', () => {
  const getServer = createServer();

  it('formats each cell correctly', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.formatting,
        toolRuntimeConfig: {},
      },
    });

    elements(response, '.qtable-cell-text').then(els => {
      // TODO:
      // Test each cell value that the label is correctly set.
      expect(true).toEqual(true);

      // expect(elements[0].innerHTML).toBe("🇨🇭 ");
    });
  });
});
