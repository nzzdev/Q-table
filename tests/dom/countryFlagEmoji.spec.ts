/**
 * @jest-environment jsdom
 */
 import * as fixtures from '../../resources/fixtures/data';
 import { elementCount, createMarkupWithScript, createServer, elements } from '../helpers';

// https://github.com/prisma/prisma/issues/8558#issuecomment-1102176746
global.setImmediate = global.setImmediate || ((fn: () => unknown, ...args: []) => global.setTimeout(fn, 0, ...args));

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

    const markup = createMarkupWithScript(response);

    elements(markup, 'td .qtable-cell-label').then(elements => {
      expect(elements[0].innerHTML).toBe("🇨🇭 ");
      expect(elements[1].innerHTML).toBe(' ');
    });
  });
});
