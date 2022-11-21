/**
 * @jest-environment jsdom
 */
import * as fixtures from '../../resources/fixtures/data';
import { elementCount, createMarkupWithScript, createServer, elements } from '../helpers';

// https://github.com/prisma/prisma/issues/8558#issuecomment-1102176746
global.setImmediate = global.setImmediate || ((fn: () => unknown, ...args: []) => global.setTimeout(fn, 0, ...args));

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

    const markup = createMarkupWithScript(response);

    elements(markup, 'tr').then(elements => {
      expect(elements[0].classList.length).toBe(1);
      expect(elements[1].classList.length).toBe(0);
      expect(elements[0].classList[0]).toEqual("q-table-state-frozen");
    })
  });
});
