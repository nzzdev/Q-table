import * as fixtures from '../../resources/fixtures/data';
import { createServer, elements } from '../helpers';

describe('country flag emoji', () => {
  const getServer = createServer();

  it('should add a country emoji', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.countryEmojis,
        toolRuntimeConfig: {},
      },
    });

    elements(response, 'td .qtable-cell-label').then(elements => {
      expect(elements[0].innerHTML).toBe("🇨🇭 ");
      expect(elements[1].innerHTML).toBe(' ');
    });
  });
});
