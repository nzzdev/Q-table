import * as fixtures from '../../resources/fixtures/data';
import { createServer, elements } from '../helpers';

// const fourEmSpaceCharCode = 8197;

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

    elements(response, '.qtable-cell-label').then(els => {
      let offset = 0;

      // First column.
      expect(els[offset + 0].innerHTML).toBe('🇨🇭 ');
      expect(els[offset + 1].innerHTML).toBe('9999 ');
      expect(els[offset + 2].innerHTML).toBe('10 000,00 ');
      expect(els[offset + 3].innerHTML).toBe('10,000 ');
      expect(els[offset + 4].innerHTML).toBe('1% ');
      expect(els[offset + 5].innerHTML).toBe('1,0% ');
      expect(els[offset + 6].innerHTML).toBe('1,00% ');
      expect(els[offset + 7].innerHTML).toBe('1,000% ');
      expect(els[offset + 8].innerHTML).toBe('➚ +1% ');

      offset = 9;

      // Second column.
      expect(els[offset + 0].innerHTML).toBe('🇩🇪 ');
      expect(els[offset + 1].innerHTML).toBe('9999 ');
      expect(els[offset + 2].innerHTML).toBe('9 999,00 ');
      expect(els[offset + 3].innerHTML).toBe('10,000 ');
      expect(els[offset + 4].innerHTML).toBe('1% ');
      expect(els[offset + 5].innerHTML).toBe('1,0% ');
      expect(els[offset + 6].innerHTML).toBe('1,00% ');
      expect(els[offset + 7].innerHTML).toBe('1,000% ');
      expect(els[offset + 8].innerHTML).toBe('➘ -1% ');

      offset = 18;

      // Third column.
      expect(els[offset + 0].innerHTML).toBe('🇦🇹 ');
      expect(els[offset + 1].innerHTML).toBe('9999 ');
      expect(els[offset + 2].innerHTML).toBe('1 000,00 ');
      expect(els[offset + 3].innerHTML).toBe('10,000 ');
      expect(els[offset + 4].innerHTML).toBe('1% ');
      expect(els[offset + 5].innerHTML).toBe('1,0% ');
      expect(els[offset + 6].innerHTML).toBe('1,00% ');
      expect(els[offset + 7].innerHTML).toBe('1,000% ');
      expect(els[offset + 8].innerHTML).toBe('➙ 0% ');
    });
  });
});
