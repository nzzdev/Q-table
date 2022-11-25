import * as fixtures from '../../resources/fixtures/data';
import { createServer, elements } from '../helpers';

describe('frozen row', () => {
  const getServer = createServer();

  it('should add a class to frozen row', async () => {
    const server = getServer();

    const response = await server.inject({
      url: '/rendering-info/web?_id=someid',
      method: 'POST',
      payload: {
        item: fixtures.freezeRow,
        toolRuntimeConfig: {},
      },
    });

    elements(response, 'tr').then(elements => {
      expect(elements[0].classList.length).toBe(1);
      expect(elements[1].classList.length).toBe(0);
      expect(elements[0].classList[0]).toEqual('qtable-tr-frozen');
    })
  });
});
